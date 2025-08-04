import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../app/sidebarSlice'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    const dispatch = useDispatch()
    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen)

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    return (
        <div className={`${isSidebarOpen ? 'w-60 lg:w-60 md:w-48 sm:w-40' : 'w-16'
            } min-h-screen border-r border-gray-300 flex-shrink-0 transition-all duration-300 ease-in-out`}>
            <div className="flex justify-end p-4 lg:p-5">
                <img
                    src="/src/assets/menu.svg"
                    className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={handleToggleSidebar}
                />
            </div>

            {isSidebarOpen && (
                <div className="px-4 pt-6">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 bg-gray-300 rounded-full"></div>
                        <p className="font-semibold text-blue-600 text-lg lg:text-xl xl:text-2xl mt-4 text-center px-2">
                            Nguyen Van A
                        </p>
                    </div>

                    <div className="flex flex-col mt-8 lg:mt-12 space-y-3">
                        <NavLink to="/" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/trang_chu.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Trang chủ
                            </p>
                        </NavLink>

                        <NavLink to="/carpark" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/phuong_tien.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Phương tiện
                            </p>
                        </NavLink>

                        <NavLink to="/cong-khu-trung" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/cong_khu_trung.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Cổng khử trùng
                            </p>
                        </NavLink>

                        <NavLink to="/qtrinh-khu-trung" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/quy_trinh.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Quy trình khử trùng
                            </p>
                        </NavLink>

                        <NavLink to="/phong-cach-ly" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/phong_cach_ly.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Phòng cách ly
                            </p>
                        </NavLink>

                        <NavLink to="/camera-faceid" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/people.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Camera quét mặt
                            </p>
                        </NavLink>

                        <NavLink to="/quan-ly-gsv" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/people.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                Quản lý tài khoản GSV
                            </p>
                        </NavLink>

                        <NavLink className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-red-50 cursor-pointer group relative overflow-hidden rounded-lg">
                            <div className="absolute right-0 top-0 h-full w-1 bg-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img src="/src/assets/log_out.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                            <p className="text-sm lg:text-base font-medium group-hover:text-red-600 transition-colors duration-200">
                                Đăng xuất
                            </p>
                        </NavLink>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sidebar