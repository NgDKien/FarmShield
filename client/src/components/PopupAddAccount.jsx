import React, { useState, useEffect } from 'react';
import { apiRegister, apiUpdateUser } from '../apis/user';
import Swal from 'sweetalert2';

const PopupAddAccount = ({ isOpen, onClose, onConfirm, editAccount }) => {
    const [avatar, setAvatar] = useState(null); //URL for image preview
    const [avatarFile, setAvatarFile] = useState(null); // Actual file for upload
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (editAccount) {
                setAvatar(editAccount.avatar || null);
                setAvatarFile(null);
                setFullname(editAccount.fullname || '');
                setRole(editAccount.role || '');
                setUsername(editAccount.username || '');
                setPassword('');
            } else {
                setAvatar(null);
                setAvatarFile(null);
                setFullname('');
                setRole('');
                setUsername('');
                setPassword('');
            }
            setErrors({});
        }
    }, [isOpen, editAccount]);

    // Avatar upload
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
            setAvatarFile(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!fullname.trim()) {
            newErrors.fullname = 'Vui lòng nhập họ và tên';
        }

        if (!role) {
            newErrors.role = 'Vui lòng chọn vị trí';
        }

        if (!username.trim()) {
            newErrors.username = 'Vui lòng nhập tên tài khoản';
        }

        // In edit mode, password is optional
        if (!editAccount) {
            if (!password) {
                newErrors.password = 'Vui lòng nhập mật khẩu';
            } else if (password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }
        } else {
            if (password && password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (editAccount) {
                const formData = new FormData();
                formData.append('fullname', fullname.trim());
                formData.append('account', username.trim());

                // Map role từ frontend sang backend
                const backendRole = role === 'Giám sát viên' ? 'GSV' : 'Admin';
                formData.append('role', backendRole);

                // Chỉ thêm password nếu người dùng nhập mới
                if (password) {
                    formData.append('password', password);
                }

                // Thêm avatar nếu có file mới
                if (avatarFile) {
                    formData.append('avatar', avatarFile);
                }

                console.log('=== DEBUG UPDATE USER ===');
                console.log('editAccount.id:', editAccount.id);
                console.log('FormData contents:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                console.log('Đang gọi API update user...');

                const response = await apiUpdateUser(editAccount.id, formData);

                console.log('Raw API update response:', response);
                console.log('Response type:', typeof response);
                console.log('Response keys:', Object.keys(response || {}));

                // Do axios interceptor đã unwrap response.data, nên response chính là data từ server
                if (response && response.success === true) {
                    // Thành công - cập nhật dữ liệu local
                    const updatedAccount = {
                        ...editAccount,
                        fullname: response.data.fullname,
                        role: role, // Giữ role hiển thị cho frontend
                        username: response.data.account,
                        // Sử dụng avatarUrl đã có full path từ server
                        avatar: response.data.avatarUrl || editAccount.avatar,
                    };

                    onConfirm(updatedAccount);
                    onClose();

                    // Hiển thị thông báo thành công
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: response.message || 'Cập nhật tài khoản thành công!',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    // Xử lý lỗi từ server
                    console.log('Update failed - response:', response);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: response?.message || 'Có lỗi xảy ra khi cập nhật tài khoản',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d33'
                    });
                }
            } else {
                // Thêm mới tài khoản - gọi API Register (giữ nguyên code cũ)
                const formData = new FormData();
                formData.append('fullname', fullname.trim());
                formData.append('account', username.trim());
                formData.append('password', password);

                // Thêm avatar nếu có
                if (avatarFile) {
                    formData.append('avatar', avatarFile);
                }

                const response = await apiRegister(formData);

                if (response && response.success === true) {
                    // Thành công - gọi callback với dữ liệu từ server  
                    const newAccount = {
                        id: Date.now(), // Tạo ID tạm
                        fullname: response.data.fullname,
                        role: 'Giám sát viên',
                        username: response.data.account,
                        password: '********',
                        avatar: response.data.avatarUrl,
                    };

                    onConfirm(newAccount);
                    onClose();

                    // Hiển thị thông báo thành công bằng SweetAlert2
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: response.message || 'Đăng ký tài khoản thành công!',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    // Xử lý lỗi từ server
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: response?.message || 'Có lỗi xảy ra khi đăng ký tài khoản',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d33'
                    });
                }
            }
        } catch (error) {
            console.error('=== ERROR DETAILS ===');
            console.error('Full error object:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);

            // Xử lý lỗi bằng SweetAlert2
            let errorMessage = 'Có lỗi không xác định xảy ra!';

            // Do axios interceptor, lỗi cũng được unwrap
            // Kiểm tra error trực tiếp (đã là error.response.data từ interceptor)
            if (error && error.message) {
                errorMessage = error.message;
            } else if (error && error.success === false && error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: errorMessage,
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-4 mb-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <input
                            type="text"
                            placeholder="Họ và tên"
                            className={`w-full px-4 py-2 border rounded ${errors.fullname ? 'border-red-500' : ''}`}
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            disabled={loading}
                        />
                        {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
                    </div>

                    <div className="relative">
                        <select
                            className={`w-full px-4 py-2 border border-gray-800 rounded font-normal appearance-none ${role === '' ? 'text-gray-400' : 'text-gray-800'} ${errors.role ? 'border-red-500' : ''}`}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                        >
                            <option value="" disabled hidden>Chọn vị trí</option>
                            <option value="Giám sát viên">Giám sát viên</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Tên tài khoản"
                            className={`w-full px-4 py-2 border rounded ${errors.username ? 'border-red-500' : ''}`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder={editAccount ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                            className={`w-full px-4 py-2 border rounded ${errors.password ? 'border-red-500' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                </form>

                {/* Buttons */}
                <div className="flex justify-between">
                    <button
                        className="bg-gray-100 px-6 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-[#5888FF] text-white px-6 py-2 rounded hover:bg-[#2C61E6] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {loading ? 'Đang xử lý...' : (editAccount ? 'Lưu' : 'Xác nhận')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupAddAccount;