//IIT Student ID: 20210181
//UOW ID: w1867427
//Project Title: SmartFIN - Microeconomic level household income sufficiency predictor using a hybrid deep learning approach with XAI
//Project Supervisor: Mr. Obhasha Priyankara
//Project Supervisee: S.H.S.V. Suwandaratna
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");


  const handleSuccessfullAuth = () => {
    navigate("/predict-us");
  };
  

  const handleAuth = (e) => {
    e.preventDefault();

    if (isLogin) {
      // Handle login logic here (API calls, etc.)
      console.log("Logging in with:", email, password);
      handleSuccessfullAuth();
    } else {
       if(password !== confirmPassword){
          setError("password doesn't match")
          return;
       }
      // Handle signup logic here (API calls, etc.)
      console.log("Signing up with:", email, password, confirmPassword);
        handleSuccessfullAuth();
    }
    setError("");
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
      setError("");

  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleAuth}>
            
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
            {!isLogin && <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>}

          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Sign Up"}
          </button>
           {error && <p className="error-message">{error}</p>}
        </form>
        <p className="toggle-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button type="button" onClick={toggleAuthMode} className="toggle-link">
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;