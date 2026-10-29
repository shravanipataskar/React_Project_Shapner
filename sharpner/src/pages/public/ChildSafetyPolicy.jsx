
import '../../styles/pages/child-safety-policy.css';

const policySections = [
  {
    title: '1. Our Commitment',
    content:
      'SHARPNER is committed to creating a safe and respectful environment for all children participating in our creative activities, auditions, and content creation programs.',
  },
  {
    title: '2. Parental or Guardian Presence',
    content:
      'A parent or legal guardian must be present during all shoots, auditions, and activities involving children.',
  },
  {
    title: '3. Safe Working Environment',
    content:
      'All activities involving children are conducted in a supervised, safe, and respectful environment. We do not allow any unsafe or inappropriate behavior.',
  },
  {
    title: '4. Child Protection',
    content:
      'Children will never be asked to participate in content that is inappropriate, harmful, or unsafe.',
  },
  {
    title: '5. Working Hours Compliance',
    content:
      'All child participation will comply with applicable child protection laws and guidelines regarding working hours and school priorities.',
  },
  {
    title: '6. Reporting Concerns',
    content:
      'If you notice any behavior that may threaten the safety of a child, please contact our team immediately.',
  },
];

export default function ChildSafetyPolicy() {
  return (
    <main className="child-safety-page">
      <section className="legal-hero">
        <div className="legal-container">
          <h1>Child Safety Policy</h1>

          <p>
            Protecting the safety and well-being of children participating in
            SHARPNER activities.
          </p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-container">
          {policySections.map((section) => (
            <article className="legal-policy-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </article>
          ))}

          <p className="legal-last-updated">
            <strong>Last Updated:</strong> March 2026
          </p>
        </div>
      </section>
    </main>
  );
}

