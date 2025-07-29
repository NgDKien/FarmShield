import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const BaiXe = () => {
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
                        Bãi xe
                    </p>

                    <div className='flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-12'>
                        {/* Video/Camera Area */}
                        <div className='flex-1 aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg min-h-[300px] lg:min-h-[400px] xl:min-h-[484px]'>
                            {/* Placeholder for video/camera feed */}
                        </div>

                        {/* Info Panel */}
                        <div className='w-full xl:w-80 2xl:w-96'>
                            <div className='flex flex-col items-center justify-center h-64 lg:h-80 xl:h-[484px] rounded-xl lg:rounded-2xl border border-gray-400 bg-white shadow-sm'>
                                <p className='text-lg lg:text-xl font-semibold text-center px-4 mb-4'>
                                    Số xe trong bãi hiện tại:
                                </p>
                                <div className='text-3xl lg:text-4xl xl:text-5xl font-extrabold text-blue-700'>
                                    100
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