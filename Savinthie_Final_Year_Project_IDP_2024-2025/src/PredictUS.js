//IIT Student ID: 20210181
//UOW ID: w1867427
//Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
//Project Supervisor: Mr. Obhasha Priyankara
//Project Supervisee: S.H.S.V. Suwandaratna
import React, { useState, useEffect } from "react";
import "./App.css";
import { useLocation, useNavigate } from 'react-router-dom';
import smartfinLogo from './smartFinlogo.svg'; // Import the Smartfin log image

function PredictUS() {
  const navigate = useNavigate();
  // Form state management
  const [total, setTotal] = useState(0);
  const [median_family_income, setIncome] = useState(0);
  const [num_counties_in_st, setCountyNumber] = useState(0);
  const [n_children, setChildren] = useState(0);
  const [single_parent, setSingleParent] = useState(2); // Default to 2 (No)
  //const [n_members, setNumberOfMembers] = useState(0); //COMMENTED

  // State for results from the API
  const [results, setResults] = useState(null);
  const [totalExpenditure, setTotalExpenditure] = useState(null); // New state for total expenditure

// Dynamically calculate the number of family members
const n_members = single_parent === 1 ? n_children + 1 : n_children + 2;

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug log to check form data before sending
    console.log({
      total,
      median_family_income,
      num_counties_in_st,
      n_children,
      single_parent,
      n_members
    });

    try {
      const response = await fetch("http://127.0.0.1:5000/predict-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total,
          median_family_income,
          num_counties_in_st,
          n_children,
          single_parent,
          n_members
        }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Capture more detailed error message
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.json();
      console.log("Backend response:", data); // Log backend response for debugging
      setResults(data);

    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  // Calculate expenditure and financial stability when results change
  useEffect(() => {
    if (results) {
      let calculatedTotalExpenditure = results.Housing + results.Food + results.Transportation + results.Healthcare + results.Childcare + results.Taxes;

      // Include "Other Necessities" if available
      if (results.OtherNecessities) {
        calculatedTotalExpenditure += results.OtherNecessities;
        results["Total"] = calculatedTotalExpenditure;
      }
      if (median_family_income) {
        results["median_family_income"] = median_family_income
      }

      setTotalExpenditure(calculatedTotalExpenditure); // Update the total expenditure state
    }
  }, [results]);


    const handleViewExpenses = () => {
        if(results) {
            navigate('/expenses', { state: { expenses: results } });
        } else {
            alert('Please submit the form first to get the predicted expenses')
        }
    };


  return (
    
    <div className="App">
      <header>
        <img src={smartfinLogo} alt="Smartfin Logo" />
      </header>
      <h1>Household Expenditure Prediction</h1>
      <div className='formDiv'>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your previous month household Expenditure ($):
          <input
            type="number"
            value={total || ""} // Prevent uncontrolled component warnings
            onChange={(e) => {
              const value = e.target.value;
              // Remove leading zeros while keeping the input valid
              const sanitizedValue = value.replace(/^0+(?!$)/, "");
              setTotal(sanitizedValue === "" ? 0 : Number(sanitizedValue));
            }}
            min="0"
            required
          />
        </label>
        <br />
        <label>
          Enter your monthly income ($) :
          <input
              type="number"
              step="0.01" // Allow floats
              value={median_family_income || ""} // Prevent uncontrolled component warnings
              onChange={(e) => {
                const value = e.target.value;
                // Remove leading zeros while keeping the input valid
                const sanitizedValue = value.replace(/^0+(?!$)/, "");
                setIncome(sanitizedValue === "" ? 0 : parseFloat(sanitizedValue));
              }}
              min="0"
              required
          />
        </label>
        <br />
        <label>
          Enter the number of counties in your state:
          {/*<input
            type="number"
            value={num_counties_in_st}
            onChange={(e) => setCountyNumber(Number(e.target.value))}
            min="0"
            required
          />*/}
          <select
            value={num_counties_in_st}
            onChange={(e) => setCountyNumber(Number(e.target.value))}
            required
          >
             <option value="67">AL</option>
             <option value="30">AK</option>
             <option value="15">AZ</option>
             <option value="75">AR</option>
             <option value="58">CA</option>
             <option value="64">CO</option>
             <option value="8">CT</option>
             <option value="3">DE</option>
             <option value="1">DC</option>
             <option value="67">FL</option>
             <option value="159">GA</option>
             <option value="5">HI</option>
             <option value="44">ID</option>
             <option value="102">IL</option>
             <option value="92">IN</option>
             <option value="99">IA</option>
             <option value="105">KS</option>
             <option value="120">KY</option>
             <option value="64">LA</option>
             <option value="16">ME</option>
             <option value="24">MD</option>
             <option value="14">MA</option>
             <option value="83">MI</option>
             <option value="87">MN</option>
             <option value="82">MS</option>
             <option value="115">MO</option>
             <option value="56">MT</option>
             <option value="93">NE</option>
             <option value="17">NV</option>
             <option value="10">NH</option>
             <option value="21">NJ</option>
             <option value="33">NM</option>
             <option value="62">NY</option>
             <option value="100">NC</option>
             <option value="53">ND</option>
             <option value="88">OH</option>
             <option value="77">OK</option>
             <option value="36">OR</option>
             <option value="67">PA</option>
             <option value="5">RI</option>
             <option value="46">SC</option>
             <option value="66">SD</option>
             <option value="95">TN</option>
             <option value="254">TX</option>
             <option value="29">UT</option>
             <option value="14">VT</option>
             <option value="133">VA</option>
             <option value="39">WA</option>
             <option value="55">WV</option>
             <option value="72">WI</option>
             <option value="23">WY</option>


          </select>
        </label>
        <br />
        <label>
          Enter the number of children in your family:
          {/*<input
            type="number"
            value={n_children}
            onChange={(e) => setChildren(Number(e.target.value))}
            min="0"
            required
          />*/}
          <select
            value={n_children}
            onChange={(e) => setChildren(Number(e.target.value))}
            required
          >
             <option value="0">No child</option>
             <option value="1">One child</option>
             <option value="2">Two children</option>
             <option value="3">Three children</option>
             <option value="4">Four children</option>
          </select>
        </label>
        <br />
        <label>
          Are you a single parent?
          <select
            value={single_parent}
            onChange={(e) => setSingleParent(Number(e.target.value))}
            required
          >
             <option value="2">No</option>
            <option value="1">Yes</option>
          </select>
        </label>
        <br />
       { /*<label> // before the UI changes
          Enter the number of members in your family:
          <input
            type="number"
            value={n_members}
            onChange={(e) => setNumberOfMembers(Number(e.target.value))}
            min="0"
            required
          />
        </label>
        <br />*/}
        <br />
        <button type="submit">Predict</button>
      </form>
      </div>
      {results ? (
        <ul className="results-list">
          <li>Housing: ${results.Housing?.toFixed(2)}</li>
          <li>Food: ${results.Food?.toFixed(2)}</li>
          <li>Transportation: ${results.Transportation?.toFixed(2)}</li>
          <li>Healthcare: ${results.Healthcare?.toFixed(2)}</li>
          <li>Childcare: ${results.Childcare?.toFixed(2)}</li>
          <li>Taxes: ${results.Taxes?.toFixed(2)}</li>
          <li>Other Necessities: ${results.OtherNecessities?.toFixed(2)}</li>
          {/* Display the total expense  */}
          {totalExpenditure !== null && <li>Total Expense: ${totalExpenditure.toFixed(2)}</li>}
        </ul>
      ) : (
        <p></p>
      )}

      <button className='expenseViewBtn' onClick={handleViewExpenses}>View Expense Details</button>


    </div>
  );
}

export default PredictUS;
