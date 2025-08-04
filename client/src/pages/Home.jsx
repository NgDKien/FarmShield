import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'
import { streamVideoFeed } from '../services/faceDetectionApi';

const Home = () => {
    // Example camera ID and RTSP URL for "Cổng khu khử trùng"
    // IMPORTANT: Replace 'your_rtsp_url_here' with your actual RTSP URL
    const gateCameraId = 'camera-gate-001';
    const gateCameraRtspUrl = 'rtsp://localhost:8554/webcam'; // e.g., 'rtsp://your_ip:port/stream'
    const gateVideoFeedUrl = streamVideoFeed(gateCameraId, gateCameraRtspUrl);

    return (
        <div className="font-main flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {/* First Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12 mb-6 lg:mb-12">
                        <NavLink to="/carpark" className="block">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Bãi xe</p>
                            <div className="w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg"></div>
                        </NavLink>

                        <NavLink to="/cong-khu-trung">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Cổng khu khử trùng</p>

                            <div className="w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg overflow-hidden">
                                {gateCameraRtspUrl !== 'your_rtsp_url_here' ? (
                                    <img
                                        src={gateVideoFeedUrl}
                                        alt="Cổng khu khử trùng Video Feed"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <p className="text-center text-gray-500 p-4">
                                        Please update 'your_rtsp_url_here' in Home.jsx with a valid RTSP URL to see the video feed.
                                    </p>
                                )}
                            </div>



                        </NavLink>

                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12">
                        <NavLink to="/qtrinh-khu-trung" className="block">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Phòng khử trùng</p>
                            <div className="w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg"></div>
                        </NavLink>

                        <NavLink to="/phong-cach-ly">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Phòng cách ly</p>
                            <div className="w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg"></div>
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home