import React, { useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { setCameraDetails } from '../app/cameraSlice';
import { CameraFeed } from '../components';

const Home = () => {
    const gateCameraId = 'camera-gate-001';
    const gateCameraRtspUrl = 'rtsp://localhost:8554/webcam';

    const { isLoggedIn, current } = useSelector(state => state.user)
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCameraDetails({
            cameraId: gateCameraId,
            rtspUrl: gateCameraRtspUrl
        }));
    }, [dispatch, gateCameraId, gateCameraRtspUrl]);

    console.log({ isLoggedIn, current })

    return (
        <div className="font-main flex overflow-hidden">
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
                            <CameraFeed
                                cameraId={gateCameraId}
                                rtspUrl={gateCameraRtspUrl}
                                altText="Cổng khu khử trùng Video Feed"
                            />
                        </NavLink>

                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12">
                        <NavLink to="/qtrinh-khu-trung" className="block">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Phòng khử trùng</p>
                            <CameraFeed
                                cameraId={gateCameraId}
                                rtspUrl={gateCameraRtspUrl}
                                altText="Cổng khu khử trùng Video Feed"
                            />
                            
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