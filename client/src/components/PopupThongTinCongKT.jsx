import React from 'react'

const PopupThongTinCongKT = ({ isOpen, onClose }) => {
    return (
        <div
            id="popupDetail"
            className={`${isOpen ? 'flex' : 'hidden'
                } fixed inset-0 bg-black/50 z-50 items-center justify-center`}
        >
            <div className="w-[434px] h-[567px] bg-white rounded-[20px] overflow-hidden border border-solid border-[#999999] relative flex items-center justify-center">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-4xl font-bold text-gray-500 hover:text-black"
                >
                    &times;
                </button>

                <div className="flex flex-col w-[314px] items-center gap-[23px]">
                    <div className="relative self-stretch mt-[-1.00px] font-interr font-semibold text-[#000000] text-2xl text-center tracking-[0] leading-normal">
                        Thông tin chi tiết
                    </div>

                    <div className="relative w-[186px] h-[212px] bg-[#999999]"></div>

                    <div className="flex flex-col w-full items-center gap-1.5 relative flex-[0_0_auto]">
                        <div className="relative self-stretch mt-[-1.00px] font-interr font-semibold text-[#000000] text-[24px] text-center tracking-[0] leading-normal">
                            Nguyễn Văn B
                        </div>

                        <div className="relative self-stretch font-interr font-normal text-[#000000] text-xl text-center tracking-[0] leading-normal">
                            Nhân viên
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                        <div className="flex h-[54px] items-center justify-between px-[19px] py-0 relative self-stretch w-full bg-[#d5e1ff] rounded-[10px] overflow-hidden">
                            <div className="relative w-fit font-interr text-[22px] font-semibold text-[#000000] text-2xl tracking-[0] leading-normal">
                                Giờ vào
                            </div>
                            <div className="relative w-fit font-interr text-[22px] font-normal text-[#000000] text-2xl tracking-[0] leading-normal">
                                10:45
                            </div>
                        </div>

                        <div className="flex h-[54px] items-center justify-between px-[19px] py-0 relative self-stretch w-full bg-[#d5e1ff] rounded-[10px] overflow-hidden">
                            <div className="relative w-fit font-interr text-[22px] font-semibold text-[#000000] text-2xl tracking-[0] leading-normal">
                                Giờ ra
                            </div>
                            <div className="relative w-fit font-interr font-normal text-[22px] text-[#000000] text-2xl tracking-[0] leading-normal">
                                10:45
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopupThongTinCongKT