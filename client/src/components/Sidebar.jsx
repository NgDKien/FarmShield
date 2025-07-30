import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../app/sidebarSlice'

const Sidebar = () => {
    const dispatch = useDispatch()
    const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen)

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }

    return (
        <div
            className={`${isSidebarOpen
                    ? 'w-40 sm:w-48 md:w-56 lg:w-64'
                    : 'w-16'
                } h-screen border-r border-gray-300 flex-shrink-0 transition-all duration-300 ease-in-out bg-white flex flex-col`}
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
                <div className="flex flex-col justify-between flex-1 px-4 pb-4">
                    {/* Top: Avatar + Menu */}
                    <div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-300 rounded-full" />
                            <p className="font-semibold text-blue-600 text-base mt-2 text-center">
                                Nguyen Van A
                            </p>
                        </div>

                        <div className="mt-4 space-y-2">
                            {[
                                { icon: 'trang_chu', label: 'Trang chủ' },
                                { icon: 'phuong_tien', label: 'Phương tiện' },
                                { icon: 'cong_khu_trung', label: 'Cổng khử trùng' },
                                { icon: 'quy_trinh', label: 'Quy trình khử trùng' },
                                { icon: 'phong_cach_ly', label: 'Phòng cách ly' },
                                { icon: 'quet_mat', label: 'Camera quét mặt' },
                                { icon: 'people', label: 'Quản lý tài khoản GSV' }
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center p-2 transition-all duration-200 hover:bg-blue-50 cursor-pointer group relative overflow-hidden rounded-lg"
                                >
                                    <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-200"></div>
                                    <img
                                        src={`/src/assets/${item.icon}.svg`}
                                        className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0"
                                    />
                                    <p className="text-sm font-medium group-hover:text-blue-600 transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: Logout */}
                    <div className="pt-4">
                        <div className="flex items-center p-2 transition-all duration-200 hover:bg-red-50 cursor-pointer group relative overflow-hidden rounded-lg">
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
        </div>
    )
}

export default Sidebar
