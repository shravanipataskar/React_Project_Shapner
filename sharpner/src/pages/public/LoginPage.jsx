
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../app/authContext.js";
import Footer from "../../components/layout/Footer.jsx";
import "../../styles/pages/LoginPage.css";

function LoginHeader() {
  return (
    <header className="login-header">
      <Link className="login-logo" to="/" aria-label="Sharpner home">
        <img src="/assets/images/Logo3.png" alt="Sharpner" />
      </Link>
      <nav className="login-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/collaborate">Brand Deals</Link>
      </nav>
    </header>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setSubmitting(true);

    try {
      await login(username.trim(), password);
      navigate("/admin/dashboard", { replace: true });
    } catch (loginError) {
      setError(
        loginError.status === 401
          ? "Invalid username or password."
          : "Unable to sign in right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <LoginHeader />
      <main className="admin-login-main">
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

          <form noValidate onSubmit={handleSubmit}>
            <div className="admin-login-form-group">
              <label htmlFor="admin-username">USERNAME</label>

              <input
                id="admin-username"
                type="text"
                name="username"
                placeholder="admin"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="admin-login-form-group">
              <label htmlFor="admin-password">PASSWORD</label>

              <div className="admin-login-password-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
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

            <button
              className="admin-login-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "SIGN IN"}
            </button>
          </form>
        </section>
      </main>
      <Footer isHomePage={false} />
    </div>
  );
}
