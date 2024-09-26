from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import os
from process_frame import ProcessFrame  # Assuming you have this module for frame processing
from thresholds import get_thresholds_beginner  # Assuming you have this module for thresholds
from utils import get_mediapipe_pose  # Assuming you have this module for pose estimation

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes

# Path to save processed videos in the frontend folder
FRONTEND_VIDEOS_FOLDER = os.path.abspath(os.path.join(app.root_path, '..', 'frontend', 'public', 'videos'))
if not os.path.exists(FRONTEND_VIDEOS_FOLDER):
    os.makedirs(FRONTEND_VIDEOS_FOLDER)
    print(f"Created directory: {FRONTEND_VIDEOS_FOLDER}")

# Initialize ProcessFrame and MediaPipe Pose
thresholds = get_thresholds_beginner()
pose = get_mediapipe_pose()
process_frame = ProcessFrame(thresholds)

@app.route('/process-video', methods=['POST'])
def process_video():
    # Check if the video file is in the request
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'No video file selected'}), 400

    # Save video file temporarily
    temp_video_path = os.path.join(FRONTEND_VIDEOS_FOLDER, 'temp_video.mp4')
    video_file.save(temp_video_path)
    print(f"Saved uploaded video to: {temp_video_path}")

    # Process video
    cap = cv2.VideoCapture(temp_video_path)
    if not cap.isOpened():
        return jsonify({'error': 'Error opening video file'}), 500

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Delete existing processed video if it exists
    processed_video_path = os.path.join(FRONTEND_VIDEOS_FOLDER, 'processed_video.mp4')
    if os.path.exists(processed_video_path):
        try:
            os.remove(processed_video_path)
            print(f"Deleted existing video: {processed_video_path}")
        except PermissionError as e:
            print(f"PermissionError while deleting video: {e}")
            return jsonify({'error': 'Unable to delete existing processed video'}), 500

    out = cv2.VideoWriter(processed_video_path, fourcc, fps, (width, height))
    print(f"Processing video frames and writing to: {processed_video_path}")

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Process frame
            processed_frame, _ = process_frame.process(frame, pose)
            out.write(processed_frame)
    finally:
        # Ensure resources are released in the event of an exception
        cap.release()  # Make sure the video capture object is released
        out.release()  # Make sure the video writer object is released

    # Check if the processed video exists
    if not os.path.exists(processed_video_path):
        return jsonify({'error': 'Processed video was not created'}), 500

    processed_video_size = os.path.getsize(processed_video_path)
    print(f"Processed video created: {processed_video_size} bytes")

    # Return the URL of the processed video (absolute URL to avoid path issues)
    processed_video_url = f'http://localhost:5000/videos/processed_video'
    return jsonify({'message': 'Video processed successfully', 'videoUrl': processed_video_url})

@app.route('/videos/<path:filename>', methods=['GET'])
def serve_video(filename):
    # Debugging info
    print(f"Serving video from directory: {FRONTEND_VIDEOS_FOLDER}")
    print(f"Requested video file: {filename}")
    return send_from_directory(FRONTEND_VIDEOS_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
