const API_BASE_URL = 'http://localhost:5000/api/face_detection';

export const streamVideoFeed = (cameraId, rtspUrl) => {
    const encodedRtspUrl = encodeURIComponent(rtspUrl);
    return `${API_BASE_URL}/video_feed/${cameraId}?url=${encodedRtspUrl}`;
};


