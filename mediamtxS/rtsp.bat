@echo off
set "FFMPEG_EXE=C:\ffmpeg\bin\ffmpeg.exe"
set "WEBCAM_NAME=Integrated Camera"

echo Starting webcam stream to rtsp://localhost:8554/webcam...

"%FFMPEG_EXE%" -f dshow -i video="%WEBCAM_NAME%" -c:v libx264 -preset veryfast -tune zerolatency -crf 23 -f rtsp -rtsp_transport tcp rtsp://localhost:8554/webcam

echo.
echo FFmpeg stream finished.
pause