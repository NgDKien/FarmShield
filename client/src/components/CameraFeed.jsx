import React from 'react';
import { streamVideoFeed } from '../services/faceDetectionApi';

const CameraFeed = ({ cameraId, rtspUrl, altText, className }) => {
    const videoFeedUrl = cameraId && rtspUrl && rtspUrl !== 'your_rtsp_url_here'
        ? streamVideoFeed(cameraId, rtspUrl)
        : null;

    return (
        <div className={`w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg overflow-hidden flex items-center justify-center ${className || ''}`}>
            {videoFeedUrl ? (
                <img
                    src={videoFeedUrl}
                    alt={altText || "Video Feed"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <p className="text-center text-gray-500 p-4">
                    {rtspUrl === 'your_rtsp_url_here' ?
                        "Please update 'your_rtsp_url_here' with a valid RTSP URL to see the video feed." :
                        "No video feed available."
                    }
                </p>
            )}
        </div>
    );
};

export default CameraFeed;