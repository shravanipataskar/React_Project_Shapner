import { useState } from "react";
import { apiFetch } from "../../services/apiClient.js";
import "../../styles/pages/CreativeIdeaSubmission.css";

const INITIAL_FORM = {
  name: '',
  instagram: '',
  reel_idea: '',
  hook_line: '',
  viral_reason: '',
  credit_permission: null,
};

const STEPS = [
  'Personal Info',
  'Idea Details',
  'Permission',
];

function CreativeIdeaSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: '',
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Please enter your name.';
      }
    }

    if (currentStep === 2) {
      if (!formData.reel_idea.trim()) {
        newErrors.reel_idea = 'Please describe your creative idea.';
      }

      if (!formData.hook_line.trim()) {
        newErrors.hook_line = 'Please enter a suggested hook.';
      }

      if (!formData.viral_reason.trim()) {
        newErrors.viral_reason =
          'Please explain why your idea will work.';
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 3));

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));

    setErrors({});

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.credit_permission === null) {
      setErrors({
        credit_permission: 'Please select Yes or No.',
      });

      return;
    }

    /*
     * API integration:
     *
     * Set VITE_IDEA_SUBMISSION_API in your .env file
     * to save the submission through your Laravel backend.
     *
     * Without this environment variable, the form uses
     * demonstration mode and does not save to the database.
     */

    const apiUrl = import.meta.env.VITE_IDEA_SUBMISSION_API;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (apiUrl) {
        const response = await apiFetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          let message = 'Unable to submit your idea. Please try again.';

          try {
            const result = await response.json();

            if (result.message) {
              message = result.message;
            }

            if (result.errors) {
              const serverErrors = {};

              Object.entries(result.errors).forEach(([key, value]) => {
                serverErrors[key] = Array.isArray(value)
                  ? value[0]
                  : value;
              });

              setErrors(serverErrors);
            }
          } catch {
            // Use the default error message.
          }

          throw new Error(message);
        }
      }

      // Open the success modal after a successful API response,
      // or immediately when running in demonstration mode.
      setShowSuccessModal(true);
    } catch (error) {
      if (error.message) {
        setErrors((previous) => ({
          ...previous,
          submit: error.message,
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setCurrentStep(1);
    setFormData({ ...INITIAL_FORM });
    setErrors({});

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <main className="creative-submission-page">
      <div className="creative-submission-container">

        {/* Page heading */}
        <header className="creative-submission-heading">
          <h1>💡 Submit Your Creative Idea</h1>

          <p>
            Share your creative ideas with us! Fill out the form below
            to submit your concept for consideration.
          </p>
        </header>

        {/* Main form layout */}
        <div className="creative-submission-layout">

          {/* Left: submission steps */}
          <aside className="creative-steps-card">
            <h2>Submission Steps</h2>

            <div className="creative-steps-list">
              {STEPS.map((step, index) => {
                const stepNumber = index + 1;
                const completed = currentStep > stepNumber;
                const active = currentStep === stepNumber;

                return (
                  <div
                    className={[
                      'creative-step',
                      active ? 'active' : '',
                      completed ? 'completed' : '',
                    ].filter(Boolean).join(' ')}
                    key={step}
                  >
                    <div className="creative-step-number">
                      {stepNumber}
                    </div>

                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Center: form */}
          <section className="creative-form-card">
            <form
              onSubmit={
                currentStep === 3
                  ? handleSubmit
                  : (event) => {
                      event.preventDefault();
                      handleNext();
                    }
              }
            >
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="creative-form-step">
                  <div className="creative-form-title">
                    <h2>Personal Information</h2>
                  </div>

                  <div className="creative-form-fields">

                    <div className="creative-field">
                      <label htmlFor="idea-name">
                        👤 Name <span>*</span>
                      </label>

                      <input
                        id="idea-name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(event) =>
                          updateField('name', event.target.value)
                        }
                        autoComplete="name"
                      />

                      {errors.name && (
                        <small className="creative-error">
                          {errors.name}
                        </small>
                      )}
                    </div>

                    <div className="creative-field">
                      <label htmlFor="idea-instagram">
                        📸 Instagram Username
                        <span className="creative-optional">
                          {' '}(Optional)
                        </span>
                      </label>

                      <input
                        id="idea-instagram"
                        type="text"
                        placeholder="@username"
                        value={formData.instagram}
                        onChange={(event) =>
                          updateField('instagram', event.target.value)
                        }
                      />

                      {errors.instagram && (
                        <small className="creative-error">
                          {errors.instagram}
                        </small>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="creative-form-step">
                  <div className="creative-form-title">
                    <h2>Idea Details</h2>
                  </div>

                  <div className="creative-form-fields">

                    <div className="creative-field">
                      <label htmlFor="idea-description">
                        💡 Your Creative Idea <span>*</span>
                      </label>

                      <textarea
                        id="idea-description"
                        rows="4"
                        placeholder="Describe your creative idea in detail..."
                        value={formData.reel_idea}
                        onChange={(event) =>
                          updateField('reel_idea', event.target.value)
                        }
                      />

                      {errors.reel_idea && (
                        <small className="creative-error">
                          {errors.reel_idea}
                        </small>
                      )}
                    </div>

                    <div className="creative-field">
                      <label htmlFor="idea-hook">
                        🎯 Suggested Hook <span>*</span>
                      </label>

                      <input
                        id="idea-hook"
                        type="text"
                        placeholder="Write a catchy hook for your idea"
                        value={formData.hook_line}
                        onChange={(event) =>
                          updateField('hook_line', event.target.value)
                        }
                      />

                      {errors.hook_line && (
                        <small className="creative-error">
                          {errors.hook_line}
                        </small>
                      )}
                    </div>

                    <div className="creative-field">
                      <label htmlFor="idea-reason">
                        🚀 Why will this work? <span>*</span>
                      </label>

                      <textarea
                        id="idea-reason"
                        rows="4"
                        placeholder="Explain why you think this idea will be great..."
                        value={formData.viral_reason}
                        onChange={(event) =>
                          updateField('viral_reason', event.target.value)
                        }
                      />

                      {errors.viral_reason && (
                        <small className="creative-error">
                          {errors.viral_reason}
                        </small>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="creative-form-step creative-permission-step">
                  <div className="creative-form-title">
                    <h2>Permission</h2>
                  </div>

                  <div className="creative-form-fields">
                    <div className="creative-field">
                      <label>
                        🎯 Can SHARPNER use this idea? <span>*</span>
                      </label>

                      <div className="creative-permission-options">

                        <label
                          className={[
                            'creative-radio-option',
                            formData.credit_permission === true
                              ? 'selected'
                              : '',
                          ].join(' ')}
                        >
                          <input
                            type="radio"
                            name="credit_permission"
                            checked={
                              formData.credit_permission === true
                            }
                            onChange={() =>
                              updateField('credit_permission', true)
                            }
                          />

                          <span>Yes</span>
                        </label>

                        <label
                          className={[
                            'creative-radio-option',
                            formData.credit_permission === false
                              ? 'selected'
                              : '',
                          ].join(' ')}
                        >
                          <input
                            type="radio"
                            name="credit_permission"
                            checked={
                              formData.credit_permission === false
                            }
                            onChange={() =>
                              updateField('credit_permission', false)
                            }
                          />

                          <span>No</span>
                        </label>

                      </div>

                      {errors.credit_permission && (
                        <small className="creative-error">
                          {errors.credit_permission}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submission error */}
              {errors.submit && (
                <div className="creative-submit-error" role="alert">
                  {errors.submit}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="creative-form-navigation">

                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="creative-previous-button"
                    onClick={handlePrevious}
                  >
                    ← Previous
                  </button>
                ) : (
                  <span />
                )}

                {currentStep < 3 ? (
                  <button
                    type="submit"
                    className="creative-next-button"
                  >
                    NEXT →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="creative-submit-button"
                    disabled={isSubmitting}
                  >
                    🎯 {isSubmitting ? 'SUBMITTING...' : 'SUBMIT IDEA'}
                  </button>
                )}

              </div>
            </form>
          </section>

          {/* Right: child image */}
          <aside className="creative-child-image">
            <img
              src="/assets/images/creative-idea-boy.png"
              alt="Young creative looking for inspiration"
            />
          </aside>

        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="idea-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleSuccessClose();
            }
          }}
        >
          <div
            className="idea-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="idea-success-title"
          >
            <div className="idea-success-icon">
              💡
            </div>

            <h2 id="idea-success-title">
              Idea Submitted!
            </h2>

            <p>
              Thank you for submitting your creative idea. Our team will
              review your idea soon.
            </p>

            <button
              type="button"
              className="idea-success-ok"
              onClick={handleSuccessClose}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default CreativeIdeaSubmission;