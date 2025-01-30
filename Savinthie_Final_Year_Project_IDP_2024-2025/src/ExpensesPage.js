//IIT Student ID: 20210181
//UOW ID: w1867427
//Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
//Project Supervisor: Mr. Obhasha Priyankara
//Project Supervisee: S.H.S.V. Suwandaratna
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExpensesPage.css'; // Import the CSS file
import smartfinLogo from './smartFinlogo.svg'; // Import the Smartfin log image


const backendURL = process.env.REACT_APP_BACKEND_URL;

function ExpensesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { expenses, median_family_income } = location.state || {};

    const [expenseValues, setExpenseValues] = useState({
        Housing: expenses?.Housing || 0,
        Food: expenses?.Food || 0,
        Transportation: expenses?.Transportation || 0,
        Healthcare: expenses?.Healthcare || 0,
        Childcare: expenses?.Childcare || 0,
        Taxes: expenses?.Taxes || 0,
        OtherNecessities: expenses?.OtherNecessities || 0
    });
    const [totalExpense, setTotalExpense] = useState(0);
    const [medianIncome, setMedianIncome] = useState(median_family_income || 0);
    const [prediction, setPrediction] = useState(null);
    const [counterfactuals, setCounterfactuals] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (expenses) {
            setExpenseValues({
                Housing: expenses?.Housing || 0,
                Food: expenses?.Food || 0,
                Transportation: expenses?.Transportation || 0,
                Healthcare: expenses?.Healthcare || 0,
                Childcare: expenses?.Childcare || 0,
                Taxes: expenses?.Taxes || 0,
                OtherNecessities : expenses?.OtherNecessities || 0,
                median_family_income : expenses?.median_family_income || 0
            });
        }
        if (median_family_income) {
            setMedianIncome(median_family_income)
        }
    }, [expenses, median_family_income]);

    useEffect(() => {
        const newTotal = Object.values(expenseValues).reduce((acc, curr) => acc + curr, 0);
        setTotalExpense(newTotal);
    }, [expenseValues]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExpenseValues({ ...expenseValues, [name]: Number(value) });
    };

    const handleMedianIncomeChange = (e) => {
        setMedianIncome(Number(e.target.value));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handlePredict = async () => {
        setLoading(true);
        setError(null);

        try {
            const apiExpenses = {
                total: totalExpense,
                median_family_income: expenseValues.median_family_income,
                housing: expenseValues.Housing,
                food: expenseValues.Food,
                transportation: expenseValues.Transportation,
                healthcare: expenseValues.Healthcare,
                OtherNecessities: expenseValues.OtherNecessities,
                childcare: expenseValues.Childcare,
                taxes: expenseValues.Taxes
            };

            const response = await fetch("http://127.0.0.1:5000/predict-stability", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiExpenses)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch prediction: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("data from backend:", data)
            setPrediction(data.predicted_financial_stability);
            setCounterfactuals(data.counterfactuals);
        } catch (err) {
            setError(err.message || 'Failed to fetch prediction. Please check backend connection or your input fields');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        if (!counterfactuals || counterfactuals.length === 0) return;

        // Convert counterfactuals to CSV format
        let csvContent = "data:text/csv;charset=utf-8," 
            + "Feature,Original,Counterfactual 1,Counterfactual 2,Counterfactual 3\n"
            + Object.keys(expenseValues).map(key => 
                `${key},${expenseValues[key].toFixed(2)},${counterfactuals.map(cf => cf[key.toLowerCase()]).join(",")}\n`
            ).join("");

        // Create a link and trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "counterfactual_report.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the file
    };

    if (!expenses) {
        return <p>No expense data available.</p>;
    }

    return (
        <div className="expenses-page">
            <header className="header">
            <img src={smartfinLogo} alt="Smartfin Logo" className="small-logo" />
            <button onClick={handleLogout} className="logout-button">Logout</button>
            </header>
            <h2>Household expenditures</h2>
            <div className="expenses-form-container">
                <form className="expenses-form">
                    {/* Form fields for each expense category */}
                    {Object.keys(expenseValues).map(key => (
                        <div className="form-group" key={key}>
                            <label htmlFor={key}>{key}:</label>
                            <span name={key}>{expenseValues[key].toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="form-group">
                        <label htmlFor="Total">Total:</label>
                        <span name="Total">{totalExpense.toFixed(2)}</span>
                    </div>
                </form>
                <button onClick={handlePredict} disabled={loading} className="predict-button">
                    {loading ? 'Predicting...' : 'Predict Stability'}
                </button>
            </div>
            {error && <p className="error-message">{error}</p>}

            {prediction && (
                <div className="prediction-section">
                    <h3>Micro economic level household Income Sufficiency Indicator</h3>
                    <p className="prediction-text">{prediction.toFixed(2)}</p>
                </div>
            )}

            {counterfactuals && counterfactuals.length > 0 && (
                <div className="counterfactuals-section">
                    <h3>Counterfactual Explanations:</h3>
                    <table className="counterfactuals-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Original</th>
                                <th>Counterfactual 1</th>
                                <th>Counterfactual 2</th>
                                <th>Counterfactual 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(expenseValues).map(key => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{expenseValues[key].toFixed(2)}</td>
                                    {counterfactuals.map((cf, index) => (
                                         <td key={`${key}-${index}`}>{cf[key.toLowerCase()]}</td>
                                    ))}
                                </tr>
                            ))}
                            <tr key={"financial_stability"}>
                                <td>{"financial_stability"}</td>
                                <td>{prediction.toFixed(2)}</td>
                                {counterfactuals.map((cf, index) => (
                                    <td key={`financial_stability-${index}`}>{cf.financial_stability.toFixed(2)}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
             {counterfactuals && counterfactuals.length > 0 && (
                    <button onClick={generateReport} className="report-button">
                        Generate Counterfactual Report
                    </button>
                )}
        </div>
    );
}

export default ExpensesPage;
