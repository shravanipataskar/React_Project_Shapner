import { useEffect, useState } from 'react'
import { videosApi } from '../../services/api.js'

function getVideoTitle(video) {
  const savedTitle = String(video.title || '').trim()
  if (savedTitle) {
    return savedTitle
  }

  return String(video.type || '').toLowerCase() === 'short'
    ? 'Untitled short'
    : 'Untitled video'
}

function LatestVideosSection() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadVideos() {
      try {
        const response = await videosApi.getPublicAll({ status: 1 })
        if (active) {
          setVideos(Array.isArray(response?.data) ? response.data.slice(0, 6) : [])
        }
      } catch (error) {
        console.error('Unable to load homepage videos:', error)
        if (active) {
          setHasError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadVideos()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="home-videos-section content-section">
      <div className="home-videos-container">
        <header className="home-videos-heading">
          <h2>Latest Videos</h2>
          <p>Watch the latest content from Sharpner.</p>
        </header>

        {loading ? (
          <p className="home-videos-message" role="status">
            Loading videos...
          </p>
        ) : hasError ? (
          <p className="home-videos-message" role="alert">
            Videos are temporarily unavailable.
          </p>
        ) : videos.length === 0 ? (
          <p className="home-videos-message">
            No videos are available right now.
          </p>
        ) : (
          <div className="home-videos-grid">
            {videos.map((video) => (
              <a
                className="home-video-card"
                href={video.video_url}
                key={video.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                {video.thumbnail ? (
                  <img
                    className="home-video-thumbnail"
                    src={video.thumbnail}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="home-video-thumbnail home-video-placeholder" aria-hidden="true">
                    ▶
                  </span>
                )}
                <span className="home-video-title">{getVideoTitle(video)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LatestVideosSection
