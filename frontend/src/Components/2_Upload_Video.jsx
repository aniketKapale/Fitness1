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
      setLoading(true);
      setError(null);

      // Make the API request to process the video
      const response = await axios.post(
        "https://fitness1-mfoj.onrender.com/process-video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { videoUrl } = response.data;
      setProcessedVideoUrl(videoUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading and processing video:", error);
      setError("Error processing video. Please try again.");
      setLoading(false);
    }
  };

  // useEffect to run when processedVideoUrl changes
  useEffect(() => {
    if (processedVideoUrl) {
      console.log("Processed video URL changed:", processedVideoUrl);
    }
  }, [processedVideoUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6 py-12">
      <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Upload and Process Your Video
        </h1>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600 mb-6"
        />

        {loading && <p className="text-center text-yellow-400">Processing video, please wait...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        {processedVideoUrl && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Processed Video:</h3>
            <video
              key={processedVideoUrl}
              width="640"
              height="480"
              controls
              className="w-full h-auto rounded-lg shadow-lg"
            >
              <source src={processedVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVideo;
