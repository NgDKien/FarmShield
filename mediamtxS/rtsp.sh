ffmpeg -f v4l2 -i /dev/video2 -c:v libx264 -preset veryfast -tune zerolatency -crf 17 -f rtsp -rtsp_transport tcp rtsp://:8554/webcam
