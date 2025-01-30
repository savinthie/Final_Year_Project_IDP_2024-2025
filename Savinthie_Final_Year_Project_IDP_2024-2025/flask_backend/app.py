#IIT Student ID: 20210181
#UOW ID: w1867427
#Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
#Project Supervisor: Mr. Obhasha Priyankara
#Project Supervisee: S.H.S.V. Suwandaratna
from flask import Flask, request, jsonify
from flask_cors import CORS 
import pandas as pd
import pickle as pk
import tensorflow as tf
#from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
import joblib
import numpy as np
from util import get_prediction,tabnet_stab,scaler_y_stability,y_exp_test_tabnet_cols,counterfactuals

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)


# Load the scalers for input (X) and output (y)
scaler_X = joblib.load('./flask_backend/scaler_X.pkl')
scaler_y = joblib.load('./flask_backend/scaler_y.pkl')

with open('./flask_backend/xgboost_models.pkl', 'rb') as f:
    xgb_models = pk.load(f)


@app.route('/predict-us', methods=['POST'])
def predict_us():
    try:
        # Get the JSON data from the request
        data = request.json
        print("Received data in backend:", data)

        # Extract and parse the input data from the JSON payload
        total = float(data['total'])
        median_family_income = float(data['median_family_income'])
        num_counties_in_st = int(data['num_counties_in_st'])
        n_children = int(data['n_children'])
        single_parent = int(data['single_parent'])
        n_members = int(data['n_members'])

        if n_members < n_children:
           n_members =  n_members+n_children+single_parent
        
        print("Parsed input data for the model:", {
            "total": total,
            "median_family_income": median_family_income,
            "num_counties_in_st": num_counties_in_st,
            "n_children": n_children,
            "single_parent": single_parent,
            "n_members": n_members
        })
        
        
        
        # Create input DataFrame for the model
        input_data = pd.DataFrame([[total, median_family_income, num_counties_in_st, n_children, single_parent, n_members]],
                                        columns=['total', 'median_family_income', 'num_counties_in_st', 'n_children', 'n_parents', 'n_members'])
        print(f"input_data   : {input_data}")
        # Get predictions using modified function
        predictions = get_prediction(input_data)
        print("Predicted Expenses:", predictions)
        # Calculate total predicted expenses and financial stability
        predicted_expenses = predictions.sum(axis=1)
        predicted_financial_stability = median_family_income / predicted_expenses[0]

        # Prepare the response with predictions mapped to proper keys
        response = {
            'Housing': float(predictions[0, 0]),
            'Food': float(predictions[0, 1]),
            'Transportation': float(predictions[0, 2]),
            'Healthcare': float(predictions[0, 3]),
            'OtherNecessities': float(predictions[0, 4]),  # Adjust key name to match frontend
            'Childcare': float(predictions[0, 5]),
            'Taxes': float(predictions[0, 6]),
            'Total Predicted Expenses': float(predicted_expenses[0]),
            'Predicted Financial Stability': float(predicted_financial_stability)
        }

        print("Predictions sent back to frontend:", response)
        return jsonify(response)

    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({'error': str(e)})
    
    
@app.route('/predict-stability', methods=['POST'])
def predict_stability():
    try:
        data = request.json
        print("Received data in backend:", data)

        # Extract expense data from the JSON request
        expenses = {
            'total': float(data['total']),
            'median_family_income': float(data['median_family_income']),
            'housing': float(data['housing']),
            'food': float(data['food']),
            'transportation': float(data['transportation']),
            'healthcare': float(data['healthcare']),
            'othernecessities': float(data['OtherNecessities']),
            'childcare': float(data['childcare']),
            'taxes': float(data['taxes'])
           
        }
        
        print("Parsed input expenses data:", expenses)

        # Create a DataFrame from the received expense data
        input_df = pd.DataFrame([expenses])
        input_df_tabnet = input_df[['median_family_income','housing', 'food', 'transportation', 'healthcare', 'othernecessities', 'childcare', 'taxes']].copy()
        print(f"input_df before predict : {input_df_tabnet.values}")


        # Make prediction using the TabNet model
        predicted_stability_scaled = tabnet_stab.predict(input_df_tabnet.values)
        print(f"predicted_stability_scaled : {predicted_stability_scaled}")
        predicted_stability = scaler_y_stability.inverse_transform(predicted_stability_scaled)[0][0]
        print(f"predicted_stability : {predicted_stability}")

        # Get counterfactuals
        print(f"  y_exp_test_tabnet_cols   : {y_exp_test_tabnet_cols}" )
        query_instance = input_df[y_exp_test_tabnet_cols[:-1]]
        print(f"query_instance : {query_instance}")
        cf = counterfactuals.generate_counterfactuals(query_instance,
                                                        total_CFs=3,
                                                        desired_range=[0.5, 1])
        
        cf_df = cf.cf_examples_list[0].final_cfs_df
        input_df_tabnet = cf_df[['median_family_income','housing', 'food', 'transportation', 'healthcare', 'othernecessities', 'childcare', 'taxes']].copy()
        cf_df_predicted_stability = tabnet_stab.predict(input_df_tabnet.values)
        input_df_tabnet["financial_stability"] = cf_df_predicted_stability 
        
        input_df_tabnet[input_df_tabnet.eq(query_instance.iloc[0])] = '-'
        
        print(f"Counterfactuals : {input_df_tabnet}")
        cf_list = input_df_tabnet.to_dict(orient='records')
        print(f"cf_list : {cf_list}")
        response = {
            'predicted_financial_stability': float(predicted_stability_scaled),
            'counterfactuals': cf_list,
        }

        print("Stability predictions sent to the front end: ", response)
        return jsonify(response)

    except Exception as e:
        print(f"Error during stability prediction: {e}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)

