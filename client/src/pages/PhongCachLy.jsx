import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const PhongCachLy = () => {

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

                    <div className="flex flex-col items-center px-8 mb-5">
                        <div className="w-full max-w-[1200px]">
                            <p className="text-[32px] font-semibold mb-[9px] text-center md:text-left">
                                Phòng cách ly
                            </p>

                            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                                {/* Box bên trái */}
                                <div className="w-full max-w-[770px] h-[300px] md:h-[400px] lg:h-[484px] bg-[#D5E1FF] rounded-xl"></div>

                                {/* Box bên phải có kích cỡ giống Info Panel */}
                                <div className="w-full xl:w-80 2xl:w-96 h-64 lg:h-80 xl:h-[484px] bg-white rounded-[20px] overflow-hidden border border-[#999999] shadow-sm flex items-center justify-center">
                                    <div className="flex flex-col w-fit items-start gap-6">

                                        <div className="flex items-center gap-[19px]">
                                            <div className="w-[99px] font-inter font-semibold text-[#000000] text-lg">Họ và tên:</div>
                                            <div className="w-[170px] font-inter text-[#000000] text-lg">Nguyễn Văn Aaaaaaaaaaaaaa</div>
                                        </div>

                                        <div className="flex items-center">
                                            <div className="w-[118px] font-inter font-semibold text-[#000000] text-lg">Giờ bắt đầu:</div>
                                            <div className="w-[170px] font-inter text-[#000000] text-lg">10:45</div>
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <div className="w-[132px] font-inter font-semibold text-[#000000] text-lg">Ngày bắt đầu:</div>
                                            <div className="w-[150px] font-inter text-[#000000] text-lg">20/07/2025</div>
                                        </div>

                                        <div className="inline-flex items-center justify-center gap-[25px]">
                                            <div className="w-[169px] font-inter font-semibold text-[#000000] text-lg">Hoàn thành cách ly</div>

                                            <label className="inline-flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" className="pointer-events-none hidden peer" />
                                                <div className="w-5 h-5 border-2 border-gray-400 rounded-md peer-checked:bg-[#30EB23] peer-checked:border-[#30EB23] flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white hidden peer-checked:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Wrapper căn giữa */}
                        <div className="mt-[9px] w-full max-w-[1200px] p-4 rounded-[20px] border border-[#D6DDEA] bg-white">
                            {/* Table header */}
                            <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] text-2xl font-semibold text-black mb-2">
                                <div className="text-center">Họ và tên</div>
                                <div className="text-center">Ngày bắt đầu</div>
                                <div className="text-center">Ngày kết thúc</div>
                                <div className="text-center">Cách ly</div>
                            </div>

                            <div className="w-full h-px bg-[#D6DDEA] mb-2"></div>

                            {/* Scrollable table body */}
                            <div className="h-[300px] overflow-y-auto">
                                {/* State hoàn thành */}
                                <div className="table-row-wrapper">
                                    <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] items-center text-xl text-black mb-2">
                                        <div className="text-center break-words">Nguyễn Văn B</div>
                                        <div className="text-center break-words">20/07/2025</div>
                                        <div className="text-center break-words">22/07/2025</div>
                                        <div className="text-center">
                                            <div className="inline-block px-3 py-1 bg-[#30ea22] text-white text-sm font-semibold rounded-full">
                                                Hoàn thành
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-[#D6DDEA] mb-2"></div>
                                </div>

                                {/* State chưa hoàn thành */}
                                <div className="table-row-wrapper">
                                    <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] items-center text-xl text-black mb-2">
                                        <div className="text-center break-words">Nguyễn Văn B</div>
                                        <div className="text-center break-words">20/07/2025</div>
                                        <div className="text-center break-words">22/07/2025</div>
                                        <div className="text-center">
                                            <div className="inline-block px-3 py-1 bg-[#ff0000] text-white text-sm font-semibold rounded-full">
                                                Chưa hoàn thành
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-[#D6DDEA] mb-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhongCachLy
