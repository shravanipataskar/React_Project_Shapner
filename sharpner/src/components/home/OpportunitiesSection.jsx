import { Link } from 'react-router-dom'

function OpportunitiesSection() {
  return (
    <section className="join-section">
      <div className="join-title-image">
        <img src="/assets/images/Let.png" alt="Let's join us" />
      </div>

      <div className="join-cards">
        <Link to="/give-audition" className="join-card yellow-card">
          <div className="card-content">
            <h3>
              BE FEATURED <br />
              IN SHARPNER <br />
              VIDEOS
            </h3>
            <button>APPLY NOW</button>
          </div>
        </Link>

        <Link to="/join-dhol-pathak" className="join-card orange-card">
          <div className="card-content">
            <h3>
              JOIN THE <br />
              DHOL <br />
              PATHAK
            </h3>

            <button>JOIN NOW            </button>
          </div>

          <img src="/assets/images/dhol.png" className="dhol-img" alt="" />
        </Link>

        <Link to="/submit-idea" className="join-card blue-card">
          <div className="card-content">
            <h3>
              SUBMIT YOUR <br />
              CREATIVE <br />
              IDEA
            </h3>

            <button>SUBMIT NOW</button>
          </div>

          <img src="/assets/images/creative.png" className="creative-img" alt="" />
        </Link>
      </div>
    </section>
  )
}

export default OpportunitiesSection