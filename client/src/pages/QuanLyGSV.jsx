import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PopupAddAccount from '../components/PopupAddAccount';
import DeleteConfirmPopup from '../components/DeleteConfirmPopup';

const QuanLyGVS = () => {
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [accounts, setAccounts] = useState([
        {
            id: 1,
            fullname: 'Nguyễn Văn B',
            role: 'Giám sát viên',
            username: 'nguyenvanb',
            password: '12345678',
        },
    ]);
    const [editAccount, setEditAccount] = useState(null);

    const handleAddOrEditAccount = (accountData) => {
        if (editAccount) {
            setAccounts((prev) =>
                prev.map((acc) =>
                    acc.id === accountData.id ? { ...acc, ...accountData } : acc
                )
            );
        } else {
            setAccounts((prev) => [...prev, { ...accountData, id: Date.now() }]);
        }
        setEditAccount(null);
        setShowAddPopup(false);
    };

    const handleDeleteAccount = () => {
        setAccounts((prev) => prev.slice(1));
        setShowDeletePopup(false);
    };

    const handleEditClick = (account) => {
        setEditAccount(account);
        setShowAddPopup(true);
    };

    return (
        <div className="font-inter flex min-h-screen overflow-hidden">
            {/* Sidebar cố định chiều cao */}
            <div className="h-screen">
                <Sidebar />
            </div>

            {/* Khu vực nội dung bên phải */}
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                {/* Header cố định */}
                <div className="shrink-0">
                    <Header />
                </div>

                {/* Nội dung chính có thể scroll */}
                <div className="flex-1 overflow-y-auto bg-[#F8F9FD]">
                    <section className="p-6">
                        {/* Title + Add Button */}
                        <div className="max-w-[1200px] mx-auto flex justify-between items-center mb-4">
                            <h2 className="text-[32px] font-semibold text-black">
                                Danh sách tài khoản của giám sát viên
                            </h2>
                            <button
                                onClick={() => {
                                    setEditAccount(null);
                                    setShowAddPopup(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#999] rounded-[7px] hover:bg-gray-50"
                            >
                                <img src="/src/assets/plus.svg" alt="Add icon" className="w-8 h-8" />
                                <span className="text-[#003BD0] text-2xl font-semibold">Thêm</span>
                            </button>
                        </div>

                        {/* Table */}
                        <div className="w-full max-w-[1200px] mx-auto p-4 rounded-[20px] border border-[#D6DDEA] bg-white">
                            {/* Table header */}
                            <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] text-2xl font-semibold text-black mb-2">
                                <div className="text-center">Họ và tên</div>
                                <div className="text-center">Vị trí</div>
                                <div className="text-center">Tài khoản</div>
                                <div className="text-center">Mật khẩu</div>
                                <div className="text-center"></div>
                            </div>

                            <div className="w-full h-px bg-[#939393] mb-2"></div>

                            {/* Table rows */}
                            {accounts.map((account, index) => (
                                <div key={account.id}>
                                    <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] items-center text-xl text-black py-3">
                                        <div className="text-center break-words">{account.fullname}</div>
                                        <div className="text-center break-words">{account.role}</div>
                                        <div className="text-center break-words">{account.username}</div>
                                        <div className="text-center break-words">{account.password}</div>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => handleEditClick(account)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EFF3FF] border border-gray-300 hover:bg-[#dce7ff] transition"
                                            >
                                                <img src="/src/assets/chinh_sua.svg" alt="Edit" className="w-7 h-7" />
                                            </button>

                                            <button
                                                onClick={() => setShowDeletePopup(true)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EFF3FF] border border-gray-300 hover:bg-[#dce7ff] transition"
                                            >
                                                <img src="/src/assets/delete.svg" alt="Delete" className="w-7 h-7" />
                                            </button>
                                        </div>
                                    </div>
                                    {index < accounts.length - 1 && (
                                        <div className="w-full h-px bg-[#e3e3e3]"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Popups */}
                        <PopupAddAccount
                            isOpen={showAddPopup}
                            onClose={() => {
                                setEditAccount(null);
                                setShowAddPopup(false);
                            }}
                            onConfirm={handleAddOrEditAccount}
                            editAccount={editAccount}
                        />

                        <DeleteConfirmPopup
                            isOpen={showDeletePopup}
                            onCancel={() => setShowDeletePopup(false)}
                            onConfirm={handleDeleteAccount}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default QuanLyGVS;
