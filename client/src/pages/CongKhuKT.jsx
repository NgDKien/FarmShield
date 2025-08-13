import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'
import { CameraFeed, RegisProgess } from '../components';
import { useSelector } from 'react-redux';
import { handleCheckFaceToRegister, handleStopCheckFaceToRegister } from '../services/faceDetectionApi'
import PopupThongTinCongKT from '../components/PopupThongTinCongKT'

const CongKhuKT = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [isCheckingOn, setIsCheckingOn] = useState(false);
    const { currentCameraId, currentCameraRtspUrl } = useSelector(state => state.camera);
    console.log("cameraID = " + currentCameraId + ", rtspUrl = " + currentCameraRtspUrl);

    const showPopup = () => {
        setIsPopupOpen(true)
    }

    const hidePopup = () => {
        setIsPopupOpen(false)
    }

    const handleToggleButtonClick = async () => {
        setIsCheckingOn(prev => !prev);
        if (!isCheckingOn) {
            alert('Turning on face checking and registration');
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
        <div className="font-inter flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                {/* Nội dung cuộn */}
                <div className="flex-1 overflow-y-auto bg-[#F8F9FD]">
                    <NavLink to="/" className="ml-4 lg:ml-8 mt-2 lg:mt-3 inline-block">
                        <span className="font-medium text-xs lg:text-sm underline hover:text-blue-600 transition-colors">
                            Trở lại trang chủ
                        </span>
                    </NavLink>

                    <div className='flex flex-col items-center px-8 mb-5'>
                        <div className="w-full max-w-[1200px]">
                            <p className="text-[28px] md:text-[32px] font-semibold mb-[9px] text-center md:text-left">
                                Cổng khu khử trùng
                            </p>

                            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                                {/* Box bên trái - Video Feed using CameraFeed component */}
                                <div className="relative flex-1 aspect-video lg:aspect-[16/10] min-h-[300px] lg:min-h-[400px] xl:min-h-[484px]">
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

                                {/* Info Panel */}
                                <div className='w-full lg:w-80 2xl:w-96 mt-6 lg:mt-0 lg:ml-6'>
                                    <div className='flex flex-col items-center justify-center h-64 lg:h-80 xl:h-[484px] rounded-xl lg:rounded-2xl border border-gray-400 bg-white shadow-sm'>
                                        <p className='text-lg lg:text-xl font-semibold text-center px-4 mb-4'>
                                            Số người đi vào hiện tại:
                                        </p>
                                        <div className='text-3xl lg:text-4xl xl:text-5xl font-extrabold text-blue-700'>
                                            100
                                        </div>
                                        <RegisProgess />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wrapper căn giữa */}
                        <div className="mt-[9px] w-full max-w-[1200px] mx-auto p-4 rounded-[20px] border border-[#D6DDEA] bg-white">
                            {/* Table header */}
                            <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] text-2xl font-semibold text-black mb-2">
                                <div className="text-center">Họ và tên</div>
                                <div className="text-center">Ngày ra vào</div>
                                <div className="text-center">Giờ vào</div>
                                <div className="text-center">Giờ ra</div>
                            </div>

                            <div className="w-full h-px bg-[#D6DDEA] mb-2"></div>

                            {/* Scrollable table body */}
                            <div className="h-[300px] overflow-y-auto">
                                {/* Repeatable rows */}
                                <div className="table-row-wrapper cursor-pointer" onClick={showPopup}>
                                    <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] items-center text-xl text-black mb-2">
                                        <div className="text-center break-words">Nguyễn Văn B</div>
                                        <div className="text-center break-words">20/07/2025</div>
                                        <div className="text-center break-words">15:30</div>
                                        <div className="text-center break-words">16:00</div>
                                    </div>
                                    <div className="w-full h-px bg-[#D6DDEA] mb-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Popup thông tin chi tiết */}
                    <PopupThongTinCongKT isOpen={isPopupOpen} onClose={hidePopup} />
                </div>
            </div>
        </div>
    )
}

export default CongKhuKT
