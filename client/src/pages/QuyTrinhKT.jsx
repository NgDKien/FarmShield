import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { CameraFeed, RegisProgess } from '../components';
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { handleCheckFaceToRegister, handleStopCheckFaceToRegister, fetchQuarantineData } from '../services/faceDetectionApi'

const QuyTrinhKT = () => {
    const [isCheckingOn, setIsCheckingOn] = useState(false);
    const { currentCameraId, currentCameraRtspUrl } = useSelector(state => state.camera);

    const handleToggleButtonClick = async () => {
        setIsCheckingOn(prev => !prev);
        if (!isCheckingOn) {
            alert('Turning on tracking');
            try {
                const response = await handleCheckFaceToRegister(currentCameraId, currentCameraRtspUrl);
                console.log("Face checking started:", response);
            } catch (error) {
                console.error("Failed to stop face checking:", error);
                setIsCheckingOn(false);
                alert("Failed to start face checking. Please try again.");
            }
        } else {
            try {
                const response = await handleStopCheckFaceToRegister(currentCameraId, currentCameraRtspUrl);
                console.log("Face checking started:", response);
                alert('Turning off face checking and registration');
            } catch (error) {
                console.error("Failed to stop face checking:", error);
                setIsCheckingOn(true);
                alert("Failed to stop face checking. Please try again.");
            }
        }
    };

    return (
        <div className="font-main flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <NavLink to="/" className="ml-4 lg:ml-8 mt-2 lg:mt-3 inline-block">
                    <span className='font-medium text-xs lg:text-sm underline hover:text-blue-600 transition-colors'>
                        Trở lại trang chủ
                    </span>
                </NavLink>

                <div className="px-4 lg:px-8 mt-6 lg:mt-10 pb-8">
                    <p className='text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4 lg:mb-6'>
                        Quy trình khử trùng
                    </p>

                    <div className='flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-12'>
                        {/* Video/Camera Area */}
                        <div className="relative flex-1 aspect-video lg:aspect-[16/10] min-h-[300px] lg:min-h-[400px] xl:min-h-[484px] mr-2">
                            <CameraFeed
                                cameraId={currentCameraId}
                                rtspUrl={currentCameraRtspUrl}
                                altText="Cổng khu khử trùng Video Feed"
                                className="w-full h-full"
                            />
                            <button
                                className={`absolute top-4 right-4 z-10 text-white p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 text-sm font-bold
                                            ${isCheckingOn ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}
                                        `}
                                onClick={handleToggleButtonClick}
                            >
                                {isCheckingOn ? 'Turn Off' : 'Turn On'}
                            </button>
                        </div>

                        {/* Control Panel */}
                        <div className='w-full xl:w-80 2xl:w-96'>
                            <div className='h-auto xl:h-[484px] rounded-xl lg:rounded-2xl border border-gray-400 bg-white shadow-sm p-4 lg:p-6'>
                                {/* UV Sensor Section */}
                                <div className='flex flex-col items-center mt-4 mb-8 lg:mb-10'>
                                    <p className='text-lg lg:text-xl font-semibold mb-6 mt-3 text-center'>
                                        Tủ cảm biến UV
                                    </p>

                                    {/* Status Indicators */}
                                    <div className='flex gap-6 mb-3'>
                                        <div className='flex justify-center items-center w-8 h-8 border border-gray-400 rounded-full'>
                                            <div className='w-5 h-5 bg-gray-300 rounded-full'></div>
                                        </div>
                                        <div className='flex justify-center items-center w-8 h-8 border border-gray-400 rounded-full'>
                                            <div className='w-5 h-5 bg-gray-300 rounded-full'></div>
                                        </div>
                                    </div>
                                </div>

                                {/* History Section */}
                                <div className='mb-8'>
                                    <p className='font-semibold text-sm lg:text-base mb-4'>
                                        Lịch sử trạng thái cảm biến
                                    </p>
                                    <div className='space-y-2 text-sm lg:text-base text-gray-700'>
                                        <p>[10:15] Tắt</p>
                                        <p>[10:15] Tắt</p>
                                        <p>[10:15] Tắt</p>
                                    </div>
                                </div>

                                {/* Checklist Section */}
                                <div className='space-y-6'>
                                    <div className='flex items-center justify-between'>
                                        <p className='font-semibold text-lg lg:text-xl'>Rửa tay</p>
                                        <div className='flex justify-center items-center w-6 h-6 lg:w-7 lg:h-7 border border-gray-400 rounded bg-gray-100'>
                                            <img src="/src/assets/check.svg" className='w-4 h-4 hidden' alt="check" />
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <p className='font-semibold text-lg lg:text-xl'>Thay đồ bảo hộ</p>
                                        <div className='flex justify-center items-center w-6 h-6 lg:w-7 lg:h-7 border border-gray-400 rounded bg-gray-100'>
                                            <img src="/src/assets/check.svg" className='w-4 h-4 hidden' alt="check" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuyTrinhKT