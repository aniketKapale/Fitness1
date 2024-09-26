from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import os
import subprocess
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

    # Use MP4V codec for intermediate video
    fourcc = cv2.VideoWriter_fourcc(*'MP4V')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Path for intermediate and final processed video
    processed_video_path = os.path.join(FRONTEND_VIDEOS_FOLDER, 'processed_intermediate_video.mp4')
    final_processed_video_path = os.path.join(FRONTEND_VIDEOS_FOLDER, 'processed_video.mp4')

    # Remove existing processed videos
    for video in [processed_video_path, final_processed_video_path]:
        if os.path.exists(video):
            os.remove(video)

    out = cv2.VideoWriter(processed_video_path, fourcc, fps, (width, height))
    print(f"Processing video frames and writing to: {processed_video_path}")

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Process frame
            processed_frame, _ = process_frame.process(frame, pose)
            
            if processed_frame is None:
                continue

            # Ensure processed frame matches original dimensions
            if processed_frame.shape[0] != height or processed_frame.shape[1] != width:
                processed_frame = cv2.resize(processed_frame, (width, height))

            out.write(processed_frame)
    finally:
        cap.release()
        out.release()

    # Convert processed video to H.264 format using FFmpeg
    try:
        ffmpeg_command = r'ffmpeg -i "C:\\Users\\aziz aman\\OneDrive\\Desktop\\100x dev\\projects\\Fitness React\\frontend\\public\\videos\\processed_intermediate_video.mp4" -vcodec libx264 -acodec aac -strict -2 "C:\\Users\\aziz aman\\OneDrive\\Desktop\\100x dev\\projects\\Fitness React\\frontend\\public\\videos\\processed_video.mp4"'
        # ffmpeg_command = "ffmpeg -i C:\Users\aziz aman\OneDrive\Desktop\100x dev\projects\Fitness React\frontend\public\videos\processed_intermediate_video.mp4 -vcodec libx264 -acodec aac -strict -2 C:\Users\aziz aman\OneDrive\Desktop\100x dev\projects\Fitness React\frontend\public\videos\processed_video.mp4"
        subprocess.run(ffmpeg_command, shell=True, check=True)
        print(f"Converted video saved to: {final_processed_video_path}")
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e}")
        print(e)
        return jsonify({'error': 'Video conversion failed'}), 500

    # Check if the final processed video exists
    if not os.path.exists(final_processed_video_path):
        return jsonify({'error': 'Final processed video was not created'}), 500

    processed_video_size = os.path.getsize(final_processed_video_path)
    print(f"Final processed video created: {processed_video_size} bytes")

    # Return the URL of the processed video
    processed_video_url = f'http://localhost:5000/videos/processed_video.mp4'
    return jsonify({'message': 'Video processed and converted successfully', 'videoUrl': processed_video_url})

@app.route('/videos/<path:filename>', methods=['GET'])
def serve_video(filename):
    print(f"Serving video from directory: {FRONTEND_VIDEOS_FOLDER}")
    return send_from_directory(FRONTEND_VIDEOS_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
