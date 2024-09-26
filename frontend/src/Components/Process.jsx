import React from 'react'

function Process() {
  return (
    <div>
        <div>
        <video width="600" controls>
            <source src={'videos/output_video.mp4'} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
    </div>
  )
}

export default Process