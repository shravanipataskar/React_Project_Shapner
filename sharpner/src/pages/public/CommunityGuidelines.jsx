
import '../../styles/pages/community-guidelines.css';

const guidelines = [
  'Respectful behavior is required',
  'Negativity / trolling is not allowed',
  'Consistency and discipline are important',
  'Having a learning mindset is essential',
];

export default function CommunityGuidelines() {
  return (
    <main className="community-page">
      <section className="community-section">
        <div className="community-container">
          <h1 className="community-title">
            <span aria-hidden="true">🤝</span>
            Community Guidelines
          </h1>

          <ul className="community-points">
            {guidelines.map((guideline) => (
              <li key={guideline}>{guideline}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

