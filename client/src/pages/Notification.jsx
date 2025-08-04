import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Notification = () => {
    return (
        <div className="font-inter flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                {/* Phần nội dung chính, có scroll nội bộ */}
                <div className="w-full flex flex-col bg-[#F8F9FD] flex-grow overflow-y-auto">
                    <div className=" h-full px-4 md:px-[33px] py-6">
                        {/* All Notifications Header */}
                        <div className="flex flex-col w-full items-center gap-[17px]">
                            <div className="w-full text-center font-semibold text-black text-2xl md:text-[36px]">
                                All Notifications
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex flex-col items-center gap-[12px] w-full mt-[20px] max-w-[800px] mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_170px] grid-rows-2 gap-y-[4px] px-4 md:px-[32px] py-2 w-full bg-white rounded-[16px] border border-[#999999]">
                                {/* Tên */}
                                <div className="row-start-1 col-start-1 font-medium text-black text-base md:text-[20px]">
                                    Nguyễn Thị B
                                </div>

                                {/* Giờ */}
                                <div className="row-start-1 col-start-2 font-normal text-black text-base md:text-[20px] text-right pl-2 md:pl-[20px]">
                                    10:50
                                </div>

                                {/* Nội dung */}
                                <p className="row-start-2 col-start-1 font-normal text-black text-base md:text-[20px]">
                                    Chưa thay đồ bảo hộ
                                </p>

                                {/* Ngày */}
                                <div className="row-start-2 col-start-2 font-normal text-black text-base md:text-[20px] text-right pl-2 md:pl-[20px]">
                                    Hôm nay
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;
