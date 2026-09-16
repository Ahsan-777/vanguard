import { useState } from "react";
import loginImage from "./assets/login.png";
import { loginUser, registerUser } from "./services/loginService";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");

  const [message, setMessage] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password || !department) {
      setMessage("Please fill all login fields.");
      return;
    }

    try {
      const data = await loginUser({
        username: username,
        password: btoa(password),
        department: department
      });

      setMessage(data?.message || "Login successful!");

      onLoginSuccess({
        username: username,
        password: password,
        department: department
      });
    } catch (error) {
      console.log(
        "Login Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Invalid username, password or department"
      );
    }
  };

  // =========================
  // CREATE ACCOUNT
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !signupUsername ||
      !signupPassword ||
      !signupDepartment
    ) {
      setMessage("Please fill all signup fields.");
      return;
    }

    try {
      const data = await registerUser({
        username: signupUsername,
        password: btoa(signupPassword),
        department: signupDepartment
      });

      setMessage(
        data?.message ||
          "Account created! Now you can login."
      );

      // Put registered username/department into login
      setUsername(signupUsername);
      setDepartment(signupDepartment);

      // Go back to login
      setShowSignup(false);

      // Clear signup fields
      setSignupUsername("");
      setSignupPassword("");
      setSignupDepartment("");
    } catch (error) {
      console.log(
        "Signup Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "User already exists or missing input."
      );
    }
  };

  return (
    <div>
      {/* LOGIN IMAGE */}

      <img
        className="w-[45%] ml-[50%] h-full -mb-[10%]"
        src={loginImage}
        alt="Login"
      />

      <div className="w-[40%] -mt-[40%] ml-5">

        {/* =========================
            LOGIN FORM
        ========================= */}

        {!showSignup ? (
          <div>
            <h1>Login Page</h1>

            <form onSubmit={handleLogin}>

              {/* USERNAME */}

              <div>
                <label>Username</label>
                <br />

                <input
                  className="w-[50%] h-[25px] border border-gray-400"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />
              </div>

              <br />

              {/* PASSWORD */}

              <div>
                <label>Password</label>
                <br />

                <div className="relative inline-block">
                  <input
                    className="w-[225px] h-[25px] border border-gray-400"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <span
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 cursor-pointer text-[18px] select-none"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </span>
                </div>
              </div>

              <br />

              {/* DEPARTMENT */}

              <div>
                <label>Department</label>
                <br />

                <select
                  className="w-[50%] h-[25px] border border-gray-400"
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                >
                  <option value="" disabled>
                    Select Department
                  </option>

                  <option value="cs">CS</option>
                  <option value="se">
                    Software Engineering
                  </option>
                  <option value="it">IT</option>
                  <option value="ee">
                    Electrical Engineering
                  </option>
                </select>
              </div>

              <br />

              {/* LOGIN BUTTON */}

              <button
                className="w-[40%] h-[30px] border-0 text-black bg-[rgb(164,0,159)]"
                type="submit"
              >
                Login
              </button>
            </form>

            {/* CREATE ACCOUNT */}

            <div className="mr-[57%] mt-[2px]">
              <p>Don't have an account?</p>

              <button
                className="border border-gray-400"
                onClick={() => {
                  setShowSignup(true);
                  setMessage("");
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (

          /* =========================
             SIGNUP FORM
          ========================= */

          <div className="mr-[56%]">
            <h3>Create Account</h3>

            <form onSubmit={handleSignup}>

              {/* SIGNUP USERNAME */}

              <input
                className="border border-gray-400"
                type="text"
                placeholder="Username"
                value={signupUsername}
                onChange={(e) =>
                  setSignupUsername(e.target.value)
                }
              />

              <br />
              <br />

              {/* SIGNUP PASSWORD */}

              <input
                className="border border-gray-400"
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) =>
                  setSignupPassword(e.target.value)
                }
              />

              <br />
              <br />

              {/* SIGNUP DEPARTMENT */}

              <select
                className="w-[50%] h-[25px] border border-gray-400"
                value={signupDepartment}
                onChange={(e) =>
                  setSignupDepartment(e.target.value)
                }
              >
                <option value="" disabled>
                  Select Department
                </option>

                <option value="cs">CS</option>
                <option value="se">
                  Software Engineering
                </option>
                <option value="it">IT</option>
                <option value="ee">
                  Electrical Engineering
                </option>
              </select>

              <br />
              <br />

              {/* CREATE ACCOUNT */}

              <button
                className="border border-gray-400"
                type="submit"
              >
                Create Account
              </button>

              <br />
              <br />

              {/* BACK */}

              <button
                className="border border-gray-400"
                type="button"
                onClick={() => {
                  setShowSignup(false);
                  setMessage("");
                }}
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        <br />

        <p>{message}</p>
      </div>
    </div>
  );
}

export default Login;