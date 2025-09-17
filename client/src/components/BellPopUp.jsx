import React from 'react'

const Bellpopup = () => {
    return (
        <div className="bg-gray-100 p-6 flex justify-center min-h-screen">
            <div className="bg-white rounded-2xl p-4 w-full max-w-[600px]">
                {/* Item 1 - Active */}
                <div className="flex justify-between border-[0.5px] hover:bg-blue-100 rounded-2xl p-5 mb-4 border-[#c6c6c6]">
                    <div>
                        <div className="font-semibold text-lg">Nguyễn Thị B</div>
                        <div className="text-base">Chưa thay đồ bảo hộ</div>
                    </div>
                    <div className="flex flex-col items-end mt-2 sm:mt-0">
                        <div className="text-lg font-medium">10:50</div>
                        <div className="text-base">Hôm nay</div>
                    </div>
                </div>
                {/* Item 2 */}
                <div className="bg-white rounded-2xl hover:bg-blue-100 p-5 mb-4 flex justify-between border-[0.5px] border-[#c6c6c6]">
                    <div>
                        <div className="font-semibold text-lg">Nguyễn Thị B</div>
                        <div className="text-base">Chưa thay đồ bảo hộ</div>
                    </div>
                    <div className="flex flex-col items-end mt-2 sm:mt-0">
                        <div className="text-lg font-medium">10:50</div>
                        <div className="text-base">Hôm qua</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Bellpopup
