import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const Home = () => {
    return (
        <>
            <div className="font-main flex">
                <Sidebar />

                <div className="w-full flex flex-col">
                    <Header />
                    <div className="flex justify-between gap-[47.5px] pl-[33.5px] pr-[33.5px] pt-[30px]">
                        <NavLink to="/carpark">
                            <p className="text-[25px] font-semibold pb-[9px]">Bãi xe</p>
                            <div className="w-[541px] h-[305px] bg-[#D5E1FF]"> </div>
                        </NavLink>
                        <div>
                            <p className="text-[25px] font-semibold pb-[9px]">Cổng khu khử trùng</p>
                            <div className="w-[541px] h-[305px] bg-[#D5E1FF]"> </div>
                        </div>
                    </div>
                    <div className="flex justify-between gap-[47.5px] pl-[33.5px] pr-[33.5px] mt-[53px]">
                        <NavLink to="/qtrinh-khu-trung">
                            <p className="text-[25px] font-semibold pb-[9px]">Phòng khử trùng</p>
                            <div className="w-[541px] h-[305px] bg-[#D5E1FF]"> </div>
                        </NavLink>
                        <div>
                            <p className="text-[25px] font-semibold pb-[9px]">Phòng cách ly</p>
                            <div className="w-[541px] h-[305px] bg-[#D5E1FF]"> </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home
