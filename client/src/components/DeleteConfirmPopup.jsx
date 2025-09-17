import React from 'react';

const DeleteConfirmPopup = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-[420px] text-center">
                <h2 className="text-xl font-semibold mb-8">Xác nhận xoá tài khoản này?</h2>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="w-[130px] bg-[#EFF3FF] text-[#2C61E6] px-6 py-2 rounded hover:bg-[#e0e7ff] transition"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-[130px] bg-[#2C61E6] text-white px-6 py-2 rounded hover:bg-[#1d4ed8] transition"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmPopup;
