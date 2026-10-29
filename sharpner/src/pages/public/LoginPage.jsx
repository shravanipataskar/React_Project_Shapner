
import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import "../../styles/pages/LoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    // UI only: connect this form to your authentication API
    // before using it for real admin login.
    console.log("Login form submitted", {
      username: username.trim(),
    });

    setError("Authentication API is not connected yet.");
  };

  return (
    <AdminLayout pageClass="admin-login-dashboard">
      <main className="dashboard-main admin-login-main">
        <section className="admin-login-card">
          <div className="admin-login-heading">
            <h1>Admin Login</h1>
            <p>Welcome back, Sharpner Admin!</p>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-login-form-group">
              <label htmlFor="admin-username">Username</label>

              <input
                id="admin-username"
                type="text"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="admin-login-form-group">
              <label htmlFor="admin-password">Password</label>

              <div className="admin-login-password-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  className="admin-login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="21"
                    height="21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    {showPassword ? (
                      <>
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8" />
                        <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.4 3.8-1" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button className="admin-login-submit" type="submit">
              SIGN IN
            </button>
          </form>
        </section>
      </main>
    </AdminLayout>
  );
}
