ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -preset veryfast -tune zerolatency -crf 23 -f rtsp -rtsp_transport tcp rtsp://:8554/webcam
