import React from 'react'

const Alert = () => {
    return (
        <div className='flex justify-center items-center w-[491px] bg-white border-[#9A9A9A] border-[1px] rounded-[20px]'>
            <div className='flex flex-col items-center py-10'>
                <div className='flex justify-center items-center bg-[#FF0000] rounded-full w-[50px] h-[50px]'>
                    <p className='font-semibold text-[40px] text-white'>!</p>
                </div>
                <p className='mt-7 font-semibold text-[#FF0000] text-[24px]'>Cảnh báo</p>
                <div className='text-center mt-5 mb-7 font-medium text-[20px] w-[354px]'>Nhân viên Nguyễn Văn A chưa rửa tay</div>
                <button className='rounded-[9px] border-[#9A9A9A] border-[0.5px] bg-[#D9E4FF] px-9 py-1'>Close</button>
            </div>
        </div>
    )
}

export default Alert
