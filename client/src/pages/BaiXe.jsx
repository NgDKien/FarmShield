import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const BaiXe = () => {
    return (
        <div className="font-inter flex min-h-screen overflow-hidden">
            {/* Sidebar cố định chiều cao màn hình */}
            <div className="h-screen">
                <Sidebar />
            </div>

            {/* Nội dung bên phải */}
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                {/* Header cố định chiều cao */}
                <div className="shrink-0">
                    <Header />
                </div>

                {/* Chỉ phần nội dung chính được scroll */}
                <div className="flex-1 overflow-y-auto bg-[#F8F9FD]">
                    <NavLink to="/" className="ml-4 lg:ml-8 mt-2 lg:mt-3 inline-block">
                        <span className="font-medium text-xs lg:text-sm underline hover:text-blue-600 transition-colors">
                            Trở lại trang chủ
                        </span>
                    </NavLink>

                    <div className="px-8 pb-8 bg-[#F8F9FD]">
                        <p className="text-[32px] font-semibold mb-[9px] text-center md:text-left">
                            Bãi xe
                        </p>

                        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-12">
                            {/* Video/Camera Area */}
                            <div className="flex-1 aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg min-h-[300px] lg:min-h-[400px] xl:min-h-[484px]" />

                            {/* Info Panel */}
                            <div className="w-full xl:w-80 2xl:w-96">
                                <div className="flex flex-col items-center justify-center h-64 lg:h-80 xl:h-[484px] rounded-xl lg:rounded-2xl border border-gray-400 bg-white shadow-sm">
                                    <p className="text-lg lg:text-xl font-semibold text-center px-4 mb-4">
                                        Số xe trong bãi hiện tại:
                                    </p>
                                    <div className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-blue-700">
                                        100
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

export default BaiXe
