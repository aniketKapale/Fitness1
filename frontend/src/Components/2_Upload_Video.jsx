import { useState, useEffect } from "react";
import axios from "axios";

const UploadVideo = () => {
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      setLoading(true); // Set loading state to true
      setError(null); // Clear any previous errors

      // Make the API request to process the video
      const response = await axios.post(
        "http://localhost:5000/process-video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const { videoUrl } = response.data;
      console.log("Processed video URL:", videoUrl);
      setProcessedVideoUrl(videoUrl); // Set the processed video URL
      setLoading(false); // Set loading state to false
    } catch (error) {
      console.error("Error uploading and processing video:", error);
      setError("Error processing video. Please try again.");
      setLoading(false); // Set loading state to false even in case of error
    }
  };

  // useEffect to run when processedVideoUrl changes
  useEffect(() => {
    if (processedVideoUrl) {
      console.log("Processed video URL changed:", processedVideoUrl);
      // Any additional actions to take when the URL changes can go here
    }
  }, [processedVideoUrl]); // Dependency array to watch for changes in processedVideoUrl

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileUpload} />
      {loading && <p>Processing video, please wait...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display processed video once URL is available */}
      {processedVideoUrl && (
        <div>
          <h3>Processed Video:</h3>
          <video key={processedVideoUrl} width="640" height="480" controls>
            <source src={processedVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Hardcoded video example (ensure the path is correct) */}
    </div>
  );
};

export default UploadVideo;
