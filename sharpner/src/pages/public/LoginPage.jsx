
import React, { useState } from "react";
import "../../styles/pages/LoginPage.css";

const LOGO_URL = "https://sharpner.co.in/assets/img/Logo3.png";

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
    <div className="admin-login-page">
      {/* Header */}
      <header className="admin-login-header">
        <a
          href="/"
          className="admin-login-brand"
          aria-label="Sharpner World home"
        >
          <img src={LOGO_URL} alt="Sharpner World" />
        </a>

        <nav className="admin-login-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/collaborate">Brand Deals</a>
        </nav>
      </header>

      {/* Main login section */}
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

      {/* Footer */}
      <footer className="admin-login-footer">
        <div className="admin-login-footer-main">
          <div className="admin-login-footer-brand">
            <h2>Sharpner World</h2>
            <p>A Movement Of Little Ones With Big Dreams</p>
          </div>

          <div className="admin-login-social">
            <span>Follow Us</span>

            <a
              href="https://www.youtube.com/@sharpnerWorld"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <span className="admin-social-youtube">▶</span>
            </a>

            <a
              href="https://www.instagram.com/sharpnerworld/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              ◎
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <span className="admin-social-facebook">f</span>
            </a>
          </div>

          <nav className="admin-login-footer-links" aria-label="Legal links">
            <a href="/legal">Privacy Policy</a>
            <a href="/terms-conditions">Terms &amp; Conditions</a>
            <a href="/child-safety-policy">Child Safety Policy</a>
            <a href="/community-guidelines">Community Guidelines</a>
          </nav>
        </div>

        <div className="admin-login-footer-bottom">
          <span>© 2026 AayojanAI. All Rights Reserved.</span>

          <span>
            Developed By <strong>AayojanAI</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}

