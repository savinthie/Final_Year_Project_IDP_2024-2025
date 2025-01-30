//IIT Student ID: 20210181
//UOW ID: w1867427
//Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
//Project Supervisor: Mr. Obhasha Priyankara
//Project Supervisee: S.H.S.V. Suwandaratna
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import USDataCollection from './USDataCollection';
import PredictUS from './PredictUS';
import Login from './Login';
import Signup from './Signup';

import ExpensesPage from './ExpensesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/us-datacollection" element = {<USDataCollection/>}/>
        <Route path = "/predict-us" element = {<PredictUS/>}/>
        <Route path = "/login" element = {<Login/>}/>
        <Route path = "/" element = {<Signup/>}/>
        <Route path="/expenses" element={<ExpensesPage />} />
      </Routes>
    </Router>
  );

 }
 export default App;