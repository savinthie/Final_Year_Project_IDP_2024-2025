//IIT Student ID: 20210181
//UOW ID: w1867427
//Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
//Project Supervisor: Mr. Obhasha Priyankara
//Project Supervisee: S.H.S.V. Suwandaratna
import React from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./Signup.css"; // Import the CSS file

function Signup() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
      e.preventDefault(); // Prevent default form submission
      // Add signup logic here
      console.log("Signup submitted");
    }

    return (
        <div className="signup-container">
            <div className="signup-form">
                <h1>Create an Account</h1>
                  <form onSubmit={handleSubmit}>
                      <div className="form-group">
                          <label htmlFor="email" id='login_signup'>Email</label>
                          <input type="email" id="email" name="email" required placeholder="Enter your email" />
                      </div>
                      <div className="form-group">
                          <label htmlFor="password" id='login_signup'>Password</label>
                          <input type="password" id="password" name="password" required placeholder="Enter your password" />
                      </div>
                      <div className="form-group">
                          <label htmlFor="confirm_password"  id='login_signup'>Confirm Password</label>
                          <input type="password" id="confirm_password" name="confirm_password" required placeholder="Confirm your password" />
                      </div>
                      <button type="submit" className="signup-button">Sign Up</button>
                  </form>
                
                <p className="login-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;