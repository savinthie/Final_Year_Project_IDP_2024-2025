#IIT Student ID: 20210181
#UOW ID: w1867427
#Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
#Project Supervisor: Mr. Obhasha Priyankara
#Project Supervisee: S.H.S.V. Suwandaratna
import numpy as np
from tqdm import tqdm
import numpy as np
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from pytorch_tabnet.tab_model import TabNetRegressor
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv1D, Flatten, Dense
from lime.lime_tabular import LimeTabularExplainer
import xgboost as xgb
import joblib
import pickle as pk
import pandas as pd
from pytorch_tabnet.tab_model import TabNetRegressor
from dice_ml import Data, Model as Modeldice
import dice_ml

target_col_list = ['housing', 'food', 'transportation', 'healthcare', 'othernecessities', 'childcare', 'taxes']

num_children_col = 3  # 4th position, 0-indexed
childcare_exp_col = target_col_list.index('childcare')  # Replace 'childcare_exp' with the actual target name


# Load the scalers for input (X) and output (y)
scaler_X = joblib.load('./flask_backend/scaler_X.pkl')
scaler_y = joblib.load('./flask_backend/scaler_y.pkl')

with open('./flask_backend/xgboost_models.pkl', 'rb') as f:
    xgb_models = pk.load(f)

target_col_list = ['housing', 'food', 'transportation', 'healthcare', 'othernecessities', 'childcare', 'taxes']
def create_hybrid_model(input_shape, output_shape):
    input_layer = Input(shape=input_shape)
    # CNN part
    x = Conv1D(filters=8, kernel_size=3, padding='same', activation='relu')(input_layer)
    x = Flatten()(x)
    # MLP part
    x = Dense(128, activation='relu')(x)
    x = Dense(64, activation='relu')(x)
    # Multiple regression outputs
    output_layers = [Dense(1, activation='linear', name=f'target_{col}')(x) for col in target_col_list]

    model = Model(inputs=input_layer, outputs=output_layers)
    return model

model_combine = create_hybrid_model((18, 1), 7)
model_combine.load_weights("./flask_backend/model_expenses.weights.h5")

def createAdditinalFeatures(X_scaled, xgb_models):
    new_y_exp_scaled = []
    for model in tqdm(xgb_models):
        predict_vals = model.predict(xgb.DMatrix(X_scaled))
        new_y_exp_scaled.append(predict_vals)

    new_y_exp_scaled_val = np.array(new_y_exp_scaled)
    new_y_exp_scaled_val_transp = new_y_exp_scaled_val.T
    a = X_scaled
    b = new_y_exp_scaled_val_transp
    res = []
    for f,t in zip(a,b):
        res.append(list(f)+list(t))

    additional_featutres =  np.array(res)
    return additional_featutres

def get_prediction(input_data):
    """
    Generates predictions for expenses using the combined model.

    Args:
        model_combine: The trained Keras model.
        input_data: Pandas DataFrame of new input data.
        scaler_X: Fitted MinMaxScaler for features.
        xgb_models: List of trained XGBoost models.
        scaler_y: Fitted MinMaxScaler for target variables.
        num_children_col: Integer column index for number of children.
        childcare_exp_col: Integer column index for the 'childcare' target.

    Returns:
         Numpy Array: Predicted expense values.
    """

    # Create new features.
    input_data_with_features = createFeatures(input_data.copy())

    # Select the relevant features
    X = input_data_with_features[['total', 'median_family_income', 'num_counties_in_st', 'n_children', 'n_parents', 'n_members', 'per_member_cost','child_expense_cost','parent_expense_cost','other_expense_cost','zero_childcare_cost']].values

    # Scale the input data using the fitted scaler_X
    input_data_scaled = scaler_X.transform(X)
    #Create additional features for the hybrid model
    additional_featutres = createAdditinalFeatures(input_data_scaled, xgb_models)

    # Reshape for CNN input
    input_data_scaled_reshaped = additional_featutres[..., np.newaxis]

    # Get predictions from the combined model
    input_data_pred = np.column_stack(model_combine.predict(input_data_scaled_reshaped))

    # Inverse transform the predictions
    input_data_pred_original = scaler_y.inverse_transform(input_data_pred)

    # Enforce the rule that if there are no children, childcare cost is 0
    input_data_pred_original[:, childcare_exp_col] = np.where(
        input_data_with_features['n_children'].values == 0, 0, input_data_pred_original[:, childcare_exp_col]
    )

    return input_data_pred_original



def createFeatures(input_data):
    input_data["per_member_cost"] = input_data["total"] / input_data["n_members"]
    input_data["child_expense_cost"] = input_data["per_member_cost"]*input_data["n_children"]
    input_data["parent_expense_cost"] = input_data["per_member_cost"]*input_data["n_parents"]
    input_data["other_expense_cost"] = input_data["total"] - (input_data["child_expense_cost"]+input_data["parent_expense_cost"])
    input_data["zero_childcare_cost"] = input_data['n_children'].map(lambda x: 0 if x < 1 else 1)
    return input_data


# # Example usage:
# input_data = pd.DataFrame(
#     [[8764.0, 8976.0, 67, 0, 1, 1]],
#     columns=['total', 'median_family_income', 'num_counties_in_st', 'n_children', 'n_parents', 'n_members']
# )
# # Get predictions using modified function
# predicted_expenses = get_prediction(input_data)
# print("Predicted Expenses:", predicted_expenses)

# Load the TabNet model for financial stability
tabnet_stab = TabNetRegressor()
tabnet_stab.load_model("./flask_backend/tabnet_stability.pth.zip")

scaler_y_stability = joblib.load('./flask_backend/scaler_y_stability.pkl')

# Wrap the TabNet Stability Model for DiCE
class TabNetWrapper:
    def __init__(self, model):
        self.model = model

    def predict(self, input_data):
        input_data = np.array(input_data)
        return self.model.predict(input_data)


# Load the test expense data used to initialize DiCE
new_y_exp_test = pd.read_pickle('./flask_backend/y_exp_test_tabnet.pkl')
y_exp_test_tabnet_cols = new_y_exp_test.columns.tolist()



from dice_ml import Data, Model as Modeldice
import dice_ml

features_col = ['median_family_income','housing', 'food', 'transportation', 'healthcare', 'othernecessities', 'childcare', 'taxes','financial_stability']


# Initialize DiCE
data_dice = Data(
    dataframe=new_y_exp_test,
    continuous_features=y_exp_test_tabnet_cols[:-1],
    outcome_name='financial_stability'
)

dice_model = Modeldice(model=TabNetWrapper(tabnet_stab), backend="sklearn", model_type='regressor')
counterfactuals = dice_ml.Dice(data_dice, dice_model, method="random")

