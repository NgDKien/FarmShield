import React, { useState, useEffect } from 'react';

const PopupAddAccount = ({ isOpen, onClose, onConfirm, editAccount }) => {
    const [avatar, setAvatar] = useState(null);
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editAccount) {
                // Nếu là chỉnh sửa thì gán thông tin vào form
                setAvatar(editAccount.avatar || null);
                setFullname(editAccount.fullname || '');
                setRole(editAccount.role || '');
                setUsername(editAccount.username || '');
                setPassword(editAccount.password || '');
            } else {
                // Nếu là thêm mới thì reset form
                setAvatar(null);
                setFullname('');
                setRole('');
                setUsername('');
                setPassword('');
            }
        }
    }, [isOpen, editAccount]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };

    const handleConfirm = () => {
        const accountData = {
            id: editAccount?.id || Date.now(), // giữ ID cũ nếu chỉnh sửa
            fullname,
            role,
            username,
            password,
            avatar,
        };
        onConfirm(accountData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            id="popup-overlay"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div className="bg-white w-[600px] p-8 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold text-center mb-6">
                    {editAccount ? 'Chỉnh sửa tài khoản giám sát viên' : 'Thêm tài khoản giám sát viên mới'}
                </h2>

                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-[210px] h-[210px]">
                        <div className="w-full h-full bg-gray-300 rounded-full overflow-hidden relative">
                            {avatar && (
                                <img
                                    id="avatar-preview"
                                    src={avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <button
                            className="absolute bottom-0 right-0 -translate-x-5 bg-white border border-gray-400 text-black w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-gray-100"
                            title="Tải ảnh"
                            onClick={() => document.getElementById('avatar-upload').click()}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-4 mb-6" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        className="w-full px-4 py-2 border rounded"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />

                    <div className="relative">
                        <select
                            className={`w-full px-4 py-2 border border-gray-800 rounded font-normal appearance-none ${role === '' ? 'text-gray-400' : 'text-gray-800'
                                }`}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="" disabled hidden>Chọn vị trí</option>
                            <option value="Giám sát viên">Giám sát viên</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Tên tài khoản"
                        className="w-full px-4 py-2 border rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        className="w-full px-4 py-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </form>

                {/* Buttons */}
                <div className="flex justify-between">
                    <button
                        className="bg-gray-100 px-6 py-2 rounded hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-[#5888FF] text-white px-6 py-2 rounded hover:bg-[#2C61E6] transition-colors duration-200"
                        onClick={handleConfirm}
                    >
                        {editAccount ? 'Lưu' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupAddAccount;
