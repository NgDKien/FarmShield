import React from 'react'

const Login = () => {
    return (
        <div className='bg-[#f8f9fd] min-h-screen flex items-center justify-center'>
            <div class="flex flex-col items-center justify-center bg-white border-[0.5px] border-gray-300 shadow-lg rounded-[20px] py-[110px] px-[22px] w-fit text-center gap-[76px]">
                <div class="flex flex-col items-center justify-center gap-[2px] p-5 relative w-fit">
                    <h2 class="relative self-stretch font-inter -mt-px font-semibold text-black text-[20px] text-center">
                        Welcome to
                    </h2>
                    <h1 class="self-stretch text-center font-racing text-[64px] bg-gradient-to-b from-[#D9E4FF] to-[#003BD0] bg-clip-text text-transparent relative w-[345px]">
                        FarmShield
                    </h1>
                </div>
                <div class="flex flex-col gap-5 relative items-start">
                    <div class="w-[376px] h-12 relative">
                        <input
                            type="text"
                            placeholder="Tài khoản"
                            class="font-inter w-full h-full px-4 py-[13px] rounded-[4px] border border-gray-300 text-gray-700 placeholder-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-[#003BD0]"
                        />
                    </div>

                    <div class="w-[376px] h-12 relative ">
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            class="font-inter w-full h-full px-4 py-[13px] rounded-[4px] border border-gray-300 text-gray-700 placeholder-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-[#003BD0]"
                        />
                    </div>
                    <button class="w-[376px] h-12 relative bg-[#5888ff] text-white font-inter font-semibold px-6 py-2 rounded-md hover:bg-[#8BACFF] focus:outline-none focus:bg-[#2C61E6]">
                        Đăng nhập
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Login
