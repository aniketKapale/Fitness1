import { useState } from 'react';
import axios from 'axios';

const UploadVideo = () => {
    const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);

        try {
            setLoading(true); // Set loading state to true
            setError(null); // Clear any previous errors

            const response = await axios.post('http://localhost:5000/process-video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { videoUrl } = response.data;
            setProcessedVideoUrl(videoUrl); // Set the processed video URL
            setLoading(false); // Set loading state to false
        } catch (error) {
            console.error('Error uploading and processing video:', error);
            setError('Error processing video. Please try again.');
            setLoading(false); // Set loading state to false even in case of error
        }
    };

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleFileUpload} />
            {loading && <p>Processing video, please wait...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {processedVideoUrl && (
                <div>
                    <h3>Processed Video:</h3>
                    <video width="640" height="480" controls>
                        <source src={'/videos/processed_video.mp4'} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            <div>
            <h3>Processed Video:</h3>
                    <video width="640" height="480" controls>
                        <source src={'/videos/processed_video.mp4'} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
            </div>
        </div>
    );
};

export default UploadVideo;
