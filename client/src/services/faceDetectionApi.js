const API_BASE_URL = 'http://localhost:5000/api/face_detection';

export const streamVideoFeed = (cameraId, rtspUrl) => {
    // For streaming video, you usually set the 'src' attribute of a video/img tag directly
    // to the API endpoint. This function will return the full URL.
    const encodedRtspUrl = encodeURIComponent(rtspUrl);
    return `${API_BASE_URL}/video_feed/${cameraId}?url=${encodedRtspUrl}`;
};


