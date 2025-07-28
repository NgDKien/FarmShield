import React from 'react'

const Sidebar = () => {
    return (
        <div className="w-[243px] h-[1024px] border-r-[0.5px] border-[#d3cdcd]">
            <img src="/src/assets/menu.svg" className='pl-[183px] pt-[20px]' />
            <div className="w-[243px] pt-[30px]">
                <div className="flex flex-col items-center">
                    <div className="w-[150px] h-[150px] bg-[#D9D9D9] rounded-full"></div>
                    <p className="font-semibold text-[#003BD0] text-[25px] mt-[20px]">Nguyen Van A</p>
                </div>
                <div className="flex flex-col pl-[28px] mt-[50px]">
                    <div className="flex mb-[20px] p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/trang_chu.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">Trang chủ</p>
                    </div>
                    <div className="flex mb-[20px] p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/phuong_tien.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">Phương tiện</p>
                    </div>
                    <div className="flex mb-[20px] p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/cong_khu_trung.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">Cổng khử trùng</p>
                    </div>
                    <div className="flex mb-[20px] p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/quy_trinh.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">Quy trình khử trùng</p>
                    </div>
                    <div className="flex mb-[20px] p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/phong_cach_ly.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">Phòng cách ly</p>
                    </div>
                    <div className="flex mb-[20px] p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/people.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">Quản lý tài khoản GSV</p>
                    </div>
                    <div className="flex p-2 transition-all duration-200 hover:bg-red-50 cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1 bg-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                        <img src="/src/assets/log_out.svg" className="mr-[18px] w-[24px] h-[24px] transition-transform duration-200 group-hover:scale-110" />
                        <p className="text-[15px] font-medium group-hover:text-red-600 transition-colors duration-200">Đăng xuất</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar