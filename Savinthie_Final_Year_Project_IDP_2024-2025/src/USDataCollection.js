import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function USDataCollection() {
  const navigate = useNavigate();

  const [dataByMonth, setDataByMonth] = useState({
    January: [],
    February: [],
    March: [],
    April: [],
    May: [],
    June: [],
    July: [],
    August: [],
    September: [],
    October: [],
    November: [],
    December: []
  });

  const [householdData, setHouseholdData] = useState({
    head_of_household_name: "",
    head_of_household_age: "",
    state: "",
    num_counties: "0",
    num_family_members: "1",
    num_children: "",
    single_parent: "0"
  });

  const [formData, setFormData] = useState({
    date: "January",
    monthly_income: "",
    med_housing_cost: "0",
    med_food_cost: "0",
    med_transport_cost: "0",
    med_healthcare_cost: "0",
    med_childcare_cost: "0",
    med_tax_cost: "0"
  });

  // New state to track if household data is completely filled
  const [isHouseholdDataFilled, setIsHouseholdDataFilled] = useState(false);

  const handleHouseholdChange = (e) => {
    const { name, value } = e.target;
    setHouseholdData({ ...householdData, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleHouseholdSubmit = (e) => {
    e.preventDefault();
    setIsHouseholdDataFilled(true);  // Mark household data as filled
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const month = formData.date;
    setDataByMonth((prevData) => ({
      ...prevData,
      [month]: [...prevData[month], { ...formData, ...householdData }]
    }));

    setFormData({
      date: "January",
      monthly_income: "",
      med_housing_cost: "0",
      med_food_cost: "0",
      med_transport_cost: "0",
      med_healthcare_cost: "0",
      med_childcare_cost: "0",
      med_tax_cost: "0"
    });
  };

  const [averages, setAverages] = useState({
    median_family_income: 0,
    med_housing_cost: 0,
    med_food_cost: 0,
    med_transport_cost: 0,
    med_healthcare_cost: 0,
    med_childcare_cost: 0,
    med_tax_cost: 0
  });
  const calculateOverallAverages = () => {
    const allData = Object.values(dataByMonth).flat();
    if (allData.length === 0) return {}; 

    const averages = {
      median_family_income: 0,
      med_housing_cost: 0,
      med_food_cost: 0,
      med_transport_cost: 0,
      med_healthcare_cost: 0,
      med_childcare_cost: 0,
      med_tax_cost: 0
    };

    allData.forEach((data) => {
      averages.median_family_income += parseFloat(data.monthly_income) / allData.length;
      averages.med_housing_cost += parseFloat(data.med_housing_cost) / allData.length;
      averages.med_food_cost += parseFloat(data.med_food_cost) / allData.length;
      averages.med_transport_cost += parseFloat(data.med_transport_cost) / allData.length;
      averages.med_healthcare_cost += parseFloat(data.med_healthcare_cost) / allData.length;
      averages.med_childcare_cost += parseFloat(data.med_childcare_cost) / allData.length;
      averages.med_tax_cost += parseFloat(data.med_tax_cost) / allData.length;
    });

    return averages;
  };

  const handlePredict = () => {
    const averages = calculateOverallAverages();
    setAverages(averages); 
    console.log("Overall Averages for prediction:", averages);
    navigate("/predict-us");
  };

  const handleReport = () => {
    navigate("/report", { state: { dataByMonth } });
  };

  return (
    <>
      <div>
        <h1>US Data Collection</h1>
      </div>

      {!isHouseholdDataFilled ? (
        <form onSubmit={handleHouseholdSubmit}>
          <label>
            Enter the name of the head of your household:
            <input
              type="text"
              name="head_of_household_name"
              value={householdData.head_of_household_name}
              onChange={handleHouseholdChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the age of the head of your household:
            <input
              type="text"
              name="head_of_household_age"
              value={householdData.head_of_household_age}
              onChange={handleHouseholdChange}
              required
            />
          </label>
          <br />
          {/* <label>
            Enter the name of the State you live in:
            <input
              type="text"
              name="state"
              value={householdData.state}
              onChange={handleHouseholdChange}
              required
            />
          </label> */}
          <label>
            Enter the name of the State you live in:
            <select
              name="state"
              value={householdData.state}
              onChange={handleHouseholdChange}
              required
            >
                 <option value="">--Please choose a state--</option>
    <option value="Alabama">Alabama</option>
    <option value="Alaska">Alaska</option>
    <option value="Arizona">Arizona</option>
    <option value="Arkansas">Arkansas</option>
    <option value="California">California</option>
    <option value="Colorado">Colorado</option>
    <option value="Connecticut">Connecticut</option>
    <option value="Delaware">Delaware</option>
    <option value="Florida">Florida</option>
    <option value="Georgia">Georgia</option>
    <option value="Hawaii">Hawaii</option>
    <option value="Idaho">Idaho</option>
    <option value="Illinois">Illinois</option>
    <option value="Indiana">Indiana</option>
    <option value="Iowa">Iowa</option>
    <option value="Kansas">Kansas</option>
    <option value="Kentucky">Kentucky</option>
    <option value="Louisiana">Louisiana</option>
    <option value="Maine">Maine</option>
    <option value="Maryland">Maryland</option>
    <option value="Massachusetts">Massachusetts</option>
    <option value="Michigan">Michigan</option>
    <option value="Minnesota">Minnesota</option>
    <option value="Mississippi">Mississippi</option>
    <option value="Missouri">Missouri</option>
    <option value="Montana">Montana</option>
    <option value="Nebraska">Nebraska</option>
    <option value="Nevada">Nevada</option>
    <option value="New Hampshire">New Hampshire</option>
    <option value="New Jersey">New Jersey</option>
    <option value="New Mexico">New Mexico</option>
    <option value="New York">New York</option>
    <option value="North Carolina">North Carolina</option>
    <option value="North Dakota">North Dakota</option>
    <option value="Ohio">Ohio</option>
    <option value="Oklahoma">Oklahoma</option>
    <option value="Oregon">Oregon</option>
    <option value="Pennsylvania">Pennsylvania</option>
    <option value="Rhode Island">Rhode Island</option>
    <option value="South Carolina">South Carolina</option>
    <option value="South Dakota">South Dakota</option>
    <option value="Tennessee">Tennessee</option>
    <option value="Texas">Texas</option>
    <option value="Utah">Utah</option>
    <option value="Vermont">Vermont</option>
    <option value="Virginia">Virginia</option>
    <option value="Washington">Washington</option>
    <option value="West Virginia">West Virginia</option>
    <option value="Wisconsin">Wisconsin</option>
    <option value="Wyoming">Wyoming</option>
</select>
          </label>
          <br />
          <label>
            Enter the number of counties in your state:
            <input
              type="number"
              name="num_counties"
              value={householdData.num_counties}
              onChange={handleHouseholdChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the number of family members in your household:
            <input
              type="number"
              name="num_family_members"
              value={householdData.num_family_members}
              onChange={handleHouseholdChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the number of children in your family:
            <input
              type="number"
              name="num_children"
              value={householdData.num_children}
              onChange={handleHouseholdChange}
              required
            />
          </label>
          <br />
          <label>
            Are you a single parent?
            <select
              name="single_parent"
              value={householdData.single_parent}
              onChange={handleHouseholdChange}
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </label>
          <br />
          <button type="submit">Submit Household Data</button>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Date:
            <select name="date" value={formData.date} onChange={handleChange}>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </label>
          <br />
          <label>
            Enter your monthly income:
            <input
              type="text"
              name="monthly_income"
              value={formData.monthly_income}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the median housing cost in your state:
            <input
              type="text"
              name="med_housing_cost"
              value={formData.med_housing_cost}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the median food cost in your state:
            <input
              type="text"
              name="med_food_cost"
              value={formData.med_food_cost}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the median transportation cost in your state:
            <input
              type="text"
              name="med_transport_cost"
              value={formData.med_transport_cost}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the median healthcare cost in your state:
            <input
              type="text"
              name="med_healthcare_cost"
              value={formData.med_healthcare_cost}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the median childcare cost in your state:
            <input
              type="text"
              name="med_childcare_cost"
              value={formData.med_childcare_cost}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Enter the median tax cost in your state:
            <input
              type="text"
              name="med_tax_cost"
              value={formData.med_tax_cost}
              onChange={handleChange}
              required
            />
          </label>
          <br />

          <button type="submit">Submit</button>
        </form>
      )}

      <button onClick={handlePredict}>Predict</button>
      <button onClick={handleReport}>Report</button>
    </>
  );
}

export default USDataCollection;


