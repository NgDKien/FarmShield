import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const BaiXe = () => {
    return (
        <>
            <div className="font-main flex">
                <Sidebar />

                <div className="w-full flex flex-col">
                    <Header />
                    <NavLink to="/" className="ml-[33px] mt-[10px]">
                        <span className='font-medium text-[13px] underline'>Trở lại trang chủ</span>
                    </NavLink>
                    <div class="ml-[33px] mt-[40px]">
                        <p className='text-[32px] font-semibold mb-[9px]'>Bãi xe</p>
                        <div className='flex'>
                            <div className='w-[770px] h-[484px] bg-[#D5E1FF] mr-[60px]'></div>
                            <div className='flex flex-col items-center justify-center w-[330px] h-[484px] rounded-[20px] border-[#9A9A9A] border-[0.5px]'>
                                <p className='text-[20px] font-semibold'>Số xe trong bãi hiện tại:</p>
                                <div className='text-[36px] font-extrabold text-[#003BD0]'>100</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BaiXe
