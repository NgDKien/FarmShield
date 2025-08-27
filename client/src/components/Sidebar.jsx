import React, { useEffect, useState } from 'react'
import { toggleSidebar } from '../app/sidebarSlice'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCurrent } from '../app/userAsyncAction'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../app/userSlice'
import { Grid } from 'ldrs/react'
import 'ldrs/react/Grid.css'

const Sidebar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen)

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    const { isLoggedIn, current } = useSelector(state => state.user)

    useEffect(() => {
        if (isLoggedIn) dispatch(getCurrent())
    }, [dispatch, isLoggedIn])

    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = () => {
        setIsLoading(true)

        setTimeout(() => {
            dispatch(logout())
            navigate('/login')
        }, 3000)
    }


    return (
        <div
            className={`${isSidebarOpen
                ? 'w-40 sm:w-48 md:w-56 lg:w-64'
                : 'w-16'
                } min-h-screen border-r border-gray-300 flex-shrink-0 transition-all duration-300 ease-in-out bg-white flex flex-col`}
        >
            {/* Header */}
            <div className="flex justify-end p-4">
                <img
                    src="/src/assets/menu.svg"
                    className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={handleToggleSidebar}
                />
            </div>

            {isSidebarOpen && (
                <div className="px-4 pt-6">
                    <div className="flex flex-col items-center">
                        {current?.avatarUrl
                            ?
                            <img src={current?.avatarUrl} className="w-24 h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full object-cover" />
                            :
                            <img src="/src/assets/default_avatar.svg" className='w-24 h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full object-cover bg-amber-200' />
                        }
                        <p className="font-bold text-blue-600 text-lg lg:text-xl xl:text-2xl mt-4 text-center px-2">
                            {`${current?.fullname}`}
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

                        {current?.role === 'Admin' && (
                            <NavLink to="/quan-ly-gsv" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                                <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                                <img src="/src/assets/people.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                                <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                    Quản lý tài khoản GSV
                                </p>
                            </NavLink>
                        )}

                        {current?.role === "Admin" && (
                            <NavLink to="/quan-ly-camera" className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg">
                                <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                                <img src="/src/assets/quet_mat.svg" className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                                <p className="text-sm lg:text-base font-medium group-hover:text-blue-600 transition-colors duration-200 overflow-hidden text-ellipsis whitespace-nowrap">
                                    Quản lý Camera
                                </p>
                            </NavLink>
                        )}

                        <div
                            onClick={handleLogout}
                            className="flex items-center p-2 lg:p-3 transition-all duration-200 hover:bg-red-50 cursor-pointer group relative overflow-hidden rounded-lg"
                        >
                            <div className="absolute right-0 top-0 h-full w-1 bg-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                            <img
                                src="/src/assets/log_out.svg"
                                className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0"
                            />
                            <p className="text-sm font-medium group-hover:text-red-600 transition-colors">
                                Đăng xuất
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {isLoading && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
                    <Grid
                        size="140"
                        speed="1.5"
                        color="#5BE176"
                    />
                </div>
            )}
        </div>
    )
}

export default Sidebar
