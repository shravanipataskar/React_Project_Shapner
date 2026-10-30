import ChannelsSection from '../../components/home/ChannelsSection.jsx'
import HeroSection from '../../components/home/HeroSection.jsx'
import LatestVideosSection from '../../components/home/LatestVideosSection.jsx'
import OpportunitiesSection from '../../components/home/OpportunitiesSection.jsx'
import WhatFaqSection from '../../components/home/WhatFaqSection.jsx'

function HomePage() {
  return (
    <>
      <HeroSection />
      <OpportunitiesSection />
      <ChannelsSection />
      <LatestVideosSection />
      <WhatFaqSection />
    </>
  )
}

export default HomePage
