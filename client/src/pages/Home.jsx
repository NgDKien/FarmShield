import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const Home = () => {
    return (
        <div className="font-main flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                {/* Content Grid */}
                <div className="flex-1 p-4 lg:p-8 overflow-auto">
                    {/* First Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12 mb-6 lg:mb-12">
                        <NavLink to="/carpark" className="block">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Bãi xe</p>
                            <div className="w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg"></div>
                        </NavLink>

                        <NavLink to="/cong-khu-trung">
                            <p className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Cổng khu khử trùng</p>
                            <div className="w-full aspect-video lg:aspect-[16/10] bg-blue-100 rounded-lg"></div>
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