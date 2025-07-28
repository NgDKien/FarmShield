import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { NavLink } from 'react-router-dom'

const QuyTrinhKT = () => {
    return (
        <>
            <div className="font-main flex">
                <Sidebar />

                <div className="w-full flex flex-col">
                    <Header />
                    <NavLink to="/" className="ml-[33px] mt-[10px]">
                        <span className='font-medium text-[13px] underline'>Trở lại trang chủ</span>
                    </NavLink>
                    <div className="ml-[33px] mt-[40px]">
                        <p className='text-[32px] font-semibold mb-[9px]'>Bãi xe</p>
                        <div className='flex'>
                            <div className='w-[770px] h-[484px] bg-[#D5E1FF] mr-[60px]'></div>
                            <div className=' w-[330px] h-[484px] rounded-[20px] border-[#9A9A9A] border-[0.5px]'>
                                <div className='flex flex-col items-center justify-center mt-[45px]'>
                                    <p className='text-[20px] font-semibold mb-[25px]'>Tủ cảm biến UV</p>

                                    {/* Bật: #30EB23, Tắt: #FF0000 */}
                                    <div className='flex gap-[25px] mb-[40px]'>
                                        <div className='flex justify-center items-center w-[30px] h-[30px] border-[#9A9A9A] border-[0.5px] rounded-full'>
                                            <div className='w-[18px] h-[18px] bg-[#CECECE] rounded-full'></div>
                                        </div>
                                        <div className='flex justify-center items-center w-[30px] h-[30px] border-[#9A9A9A] border-[0.5px] rounded-full'>
                                            <div className='w-[18px] h-[18px] bg-[#CECECE] rounded-full'></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='pl-[25px]'>
                                    <p className='font-semibold text-[15px] mb-[20px]'>Lịch sử trạng thái cảm biến</p>
                                    <p className='text-[15px] mb-[10px]'>[10:15] Tắt</p>
                                    <p className='text-[15px] mb-[10px]'>[10:15] Tắt</p>
                                    <p className='text-[15px] mb-[40px]'>[10:15] Tắt</p>

                                    <div className='flex items-center mb-[40px]'>
                                        <p className='font-semibold text-[20px] pr-[25px]'>Rửa tay</p>
                                        <div className='flex justify-center items-center w-[25px] h-[25px] border-[#9A9A9A] border-[0.5px] rounded-[5px] bg-[#F5F5F5]'>
                                            <img src="/src/assets/check.svg" className='hidden' />
                                        </div>
                                    </div>

                                    <div className='flex'>
                                        <p className='font-semibold text-[20px] pr-[25px]'>Thay đồ bảo hộ</p>
                                        <div className='flex justify-center items-center w-[25px] h-[25px] border-[#9A9A9A] border-[0.5px] rounded-[5px] bg-[#F5F5F5]'>
                                            <img src="/src/assets/check.svg" className='hidden' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default QuyTrinhKT
