function ChannelsSection() {
  return (
    <section className="channels-section">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="section-title">OUR CHANNELS</h2>
          <div className="title-line"></div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="channel-card">
              <img
                src="/assets/images/marathi-channel.png"
                className="img-fluid channel-image"
                alt="Sharpner Marathi"
              />

              <div className="channel-content">
                <h4>Marathi Channel</h4>
                <p>
                  Creative storytelling, comedy sketches and kids acting
                  content for Marathi audiences.
                </p>

                <div className="channel-stats">
                  <div>
                    <i className="fas fa-users"></i>
                    <span>365K+</span>
                  </div>

                  <div>
                    <i className="fas fa-play-circle"></i>
                    <span>125K+</span>
                  </div>
                </div>

                <div className="channel-links">
                  <a
                    href="https://www.youtube.com/@sharpnerWorld"
                    className="btn btn-youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sharpner World on YouTube"
                  >
                    <i className="fab fa-youtube"></i>
                    YouTube
                  </a>

                  <a
                    href="https://www.instagram.com/sharpnerworld/"
                    className="btn btn-instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sharpner World on Instagram"
                  >
                    <i className="fab fa-instagram"></i>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="channel-card">
              <img
                src="/assets/images/hindi-channel.png"
                className="img-fluid channel-image"
                alt="Sharpner Hindi"
              />

              <div className="channel-content">
                <h4>Hindi Channel</h4>
                <p>
                  Entertaining stories, educational experiments and creative
                  reels for young creators.
                </p>

                <div className="channel-stats">
                  <div>
                    <i className="fas fa-users"></i>
                    <span>16.4K+</span>
                  </div>

                  <div>
                    <i className="fas fa-play-circle"></i>
                    <span>110K+</span>
                  </div>
                </div>

                <div className="channel-links">
                  <a
                    href="https://www.youtube.com/@sharpnerWorld"
                    className="btn btn-youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sharpner World on YouTube"
                  >
                    <i className="fab fa-youtube"></i>
                    YouTube
                  </a>

                  <a
                    href="https://www.instagram.com/sharpnerworld/"
                    className="btn btn-instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sharpner World on Instagram"
                  >
                    <i className="fab fa-instagram"></i>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChannelsSection