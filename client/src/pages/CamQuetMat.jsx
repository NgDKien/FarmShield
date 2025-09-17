import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const CamQuetMat = () => {
    const [isSharing, setIsSharing] = useState(false)

    const toggleScreenShare = () => {
        setIsSharing(prev => !prev)
    }

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

                    <div className="flex items-center justify-center h-[824px] w-full px-8 my-4 ">
                        <div className="flex flex-col w-full max-w-[1131px] items-center justify-center relative">
                            <div className="mb-1 relative self-stretch font-semibold text-[#000000] text-[32px] leading-normal font-inter">
                                Camera quét mặt
                            </div>

                            <div className="relative self-stretch w-full h-[710px] bg-[#d5e1ff] rounded"></div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    className={`inline-flex items-center gap-2.5 overflow-hidden rounded justify-center bg-[#4A8BFF] text-white font-semibold font-interr ${isSharing ? 'px-[23px]' : 'px-[50px]'
                                        } py-[13px] transition hover:bg-[#2C61E6]`}
                                    onClick={toggleScreenShare}
                                >
                                    {isSharing ? 'Ngừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CamQuetMat
