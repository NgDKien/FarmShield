import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const QuanLyCamera = () => {
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [editcam, setEditcam] = useState(null);
    const [cams, setCams] = useState([
        {
            id: 1,
            name: 'Camera 1',
            location: 'Mock location data',
            url: 'http://farm-shield/...',
            status: 'ON',
        },
    ]);

    const handleEditClick = (cam) => {
    };

    return (
        <div className="font-inter flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <div className="flex-1 overflow-y-auto bg-[#F8F9FD]">
                    <section className="p-6">
                        {/* Title + Add Button */}
                        <div className="max-w-[1200px] mx-auto flex justify-between items-center mb-4">
                            <h2 className="text-[32px] font-semibold text-black">
                                Danh sách Camera hiện có
                            </h2>
                        </div>

                        {/* Table */}
                        <div className="w-full max-w-[1200px] mx-auto p-4 rounded-[20px] border border-[#D6DDEA] bg-white">
                            {/* Table header */}
                            <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] text-2xl font-semibold text-black mb-2">
                                <div className="text-center">Tên Camera</div>
                                <div className="text-center">Vị trí</div>
                                <div className="text-center">URL</div>
                                <div className="text-center">Trạng thái</div>
                                <div className="text-center"></div>
                            </div>

                            <div className="w-full h-px bg-[#939393] mb-2"></div>

                            {/* Table rows */}
                            {cams.map((cam, index) => (
                                <div key={cam.id}>
                                    <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] items-center text-xl text-black py-3">
                                        <div className="text-center break-words">{cam.name}</div>
                                        <div className="text-center break-words">{cam.location}</div>
                                        <div className="text-center break-words">{cam.url}</div>
                                        <div className="text-center break-words">{cam.status}</div>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => handleEditClick(cam)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EFF3FF] border border-gray-300 hover:bg-[#dce7ff] transition"
                                            >
                                                <img src="/src/assets/chinh_sua.svg" alt="Edit" className="w-7 h-7" />
                                            </button>
                                        </div>
                                    </div>
                                    {index < cams.length - 1 && (
                                        <div className="w-full h-px bg-[#e3e3e3]"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default QuanLyCamera
