import  { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import UploadVideo from './2_Upload_Video';
import { useNavigate } from 'react-router-dom';

const LiveStream = () => {
    const [downloadLink, setDownloadLink] = useState(null);
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const navigate = useNavigate();

    const handleStartCaptureClick = useCallback(() => {
        setRecordedChunks([]);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
            mimeType: "video/webm",
        });
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [webcamRef, setRecordedChunks]);

    const handleDataAvailable = useCallback(({ data }) => {
        if (data.size > 0) {
            setRecordedChunks((prev) => prev.concat(data));
        }
    }, []);

    const handleStopCaptureClick = useCallback(() => {
        mediaRecorderRef.current.stop();
    }, [mediaRecorderRef]);

    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            setDownloadLink(url);
        }
    }, [recordedChunks]);
    const redirectToUpload = () => {
        navigate('/upload');
    };

    return (
        <div>
            <h1>AI Fitness Trainer For Gym</h1>
            <Webcam ref={webcamRef} />
            <div>
                <button onClick={handleStartCaptureClick}>Start Capture</button>
                <button onClick={handleStopCaptureClick}>Stop Capture</button>
                <button onClick={handleDownload}>Download Video</button>
                <button onClick={redirectToUpload }>Upload Video</button>
            </div>
            {downloadLink && (
                <a href={downloadLink} download="output_live.webm">Download Captured Video</a>
            )}
        </div>
    );
};

export default LiveStream;
