import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PopupAddAccount from '../components/PopupAddAccount';
import DeleteConfirmPopup from '../components/DeleteConfirmPopup';
import { getAllUsers, deleteUser } from '../apis/user';
import Swal from 'sweetalert2';

const QuanLyGVS = () => {
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [editAccount, setEditAccount] = useState(null); //Edit mode
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteAccountId, setDeleteAccountId] = useState(null);
    const [deleting, setDeleting] = useState(false); // State cho loading khi xóa

    // Fetch tất cả users khi component mount
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getAllUsers();

            if (response.success) {
                // Map dữ liệu từ API về format của component
                const mappedAccounts = response.data.map(user => ({
                    id: user._id,
                    fullname: user.fullname,
                    role: user.role === 'GSV' ? 'Giám sát viên' : user.role,
                    username: user.account,
                    avatar: user.avatar,
                    avatarUrl: user.avatarUrl,
                    password: user.password || 'N/A'
                }));

                setAccounts(mappedAccounts);
            } else {
                setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(
                error.message ||
                'Không thể kết nối đến server. Vui lòng thử lại sau.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrEditAccount = async (accountData) => {
        try {
            if (editAccount) { //edit mode
                setAccounts((prev) =>
                    prev.map((acc) =>
                        acc.id === accountData.id ? { ...acc, ...accountData } : acc
                    )
                );
            } else { //create mode
                await fetchAllUsers(); // Refresh list after success
            }
            setEditAccount(null);
            setShowAddPopup(false);
        } catch (error) {
            console.error('Error handling account:', error);
            setError('Có lỗi xảy ra khi xử lý tài khoản');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            if (deleteAccountId) {
                setDeleting(true);
                setError(null);

                // Gọi API xóa user
                const response = await deleteUser(deleteAccountId);

                if (response.success) {
                    // Xóa user khỏi state local
                    setAccounts((prev) => prev.filter(acc => acc.id !== deleteAccountId));

                    // Đóng popup và reset state
                    setDeleteAccountId(null);
                    setShowDeletePopup(false);

                    // Hiển thị thông báo thành công với SweetAlert
                    await Swal.fire({
                        icon: 'success',
                        title: 'Xóa thành công!',
                        text: response.message || 'Tài khoản đã được xóa thành công',
                        confirmButtonColor: '#003BD0',
                        confirmButtonText: 'OK',
                        timer: 3000,
                        timerProgressBar: true
                    });
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi xóa tài khoản');

                    // Hiển thị thông báo lỗi với SweetAlert
                    await Swal.fire({
                        icon: 'error',
                        title: 'Xóa thất bại!',
                        text: response.message || 'Có lỗi xảy ra khi xóa tài khoản',
                        confirmButtonColor: '#dc2626',
                        confirmButtonText: 'Thử lại'
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            const errorMessage = error.message || 'Không thể xóa tài khoản. Vui lòng thử lại sau.';
            setError(errorMessage);

            // Hiển thị thông báo lỗi với SweetAlert
            await Swal.fire({
                icon: 'error',
                title: 'Có lỗi xảy ra!',
                text: errorMessage,
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Đóng'
            });
        } finally {
            setDeleting(false);
        }
    };


    const handleEditClick = (account) => {
        setEditAccount(account);
        setShowAddPopup(true);
    };

    const handleDeleteClick = (accountId) => {
        setDeleteAccountId(accountId);
        setShowDeletePopup(true);
    };

    const handleRefresh = () => {
        fetchAllUsers();
    };

    const handleCloseError = () => {
        setError(null);
    };

    const handleCancelDelete = () => {
        setDeleteAccountId(null);
        setShowDeletePopup(false);
    };

    if (loading) {
        return (
            <div className="font-inter flex min-h-screen overflow-hidden">
                <div className="h-screen">
                    <Sidebar />
                </div>
                <div className="flex-1 flex flex-col min-w-0 h-screen">
                    <div className="shrink-0">
                        <Header />
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-[#F8F9FD]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-inter flex min-h-screen overflow-hidden">
            <div className="h-screen">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-screen">
                <div className="shrink-0">
                    <Header />
                </div>

                <div className="flex-1 overflow-y-auto bg-[#F8F9FD]">
                    <section className="p-6">
                        {/* Error Message */}
                        {error && (
                            <div className="max-w-[1200px] mx-auto mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                                <span>{error}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleRefresh}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        disabled={loading}
                                    >
                                        Thử lại
                                    </button>
                                    <button
                                        onClick={handleCloseError}
                                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Title + Add Button */}
                        <div className="max-w-[1200px] mx-auto flex justify-between items-center mb-4">
                            <h2 className="text-[32px] font-semibold text-black">
                                Danh sách tài khoản của giám sát viên ({accounts.length})
                            </h2>
                            <div className="flex gap-3">
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
                        </div>

                        {/* Table */}
                        <div className="w-full max-w-[1200px] mx-auto p-4 rounded-[20px] border border-[#D6DDEA] bg-white">
                            {/* Table header */}
                            <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] text-2xl font-semibold text-black mb-2">
                                <div className="text-left px-2">Họ và tên</div>
                                <div className="text-center">Vị trí</div>
                                <div className="text-center">Tài khoản</div>
                                <div className="text-center">Mật khẩu</div>
                                <div className="text-center">Thao tác</div>
                            </div>

                            <div className="w-full h-px bg-[#939393] mb-2"></div>

                            {/* Empty state */}
                            {accounts.length === 0 && !loading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-xl">Chưa có tài khoản nào</p>
                                    <button
                                        onClick={() => {
                                            setEditAccount(null);
                                            setShowAddPopup(true);
                                        }}
                                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Thêm tài khoản đầu tiên
                                    </button>
                                </div>
                            ) : (
                                /* Table rows */
                                accounts.map((account, index) => (
                                    <div key={account.id}>
                                        <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] items-center text-xl text-black py-3">
                                            <div className="text-left break-words px-2">
                                                {account.fullname}
                                            </div>
                                            <div className="text-center break-words">{account.role}</div>
                                            <div className="text-center break-words">{account.username}</div>
                                            <div className="text-center break-words">{account.password}</div>
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => handleEditClick(account)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EFF3FF] border border-gray-300 hover:bg-[#dce7ff] transition"
                                                    title="Chỉnh sửa"
                                                >
                                                    <img src="/src/assets/chinh_sua.svg" alt="Edit" className="w-7 h-7" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(account.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EFF3FF] border border-gray-300 hover:bg-[#dce7ff] transition"
                                                    title="Xóa"
                                                    disabled={deleting && deleteAccountId === account.id}
                                                >
                                                    {deleting && deleteAccountId === account.id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                                    ) : (
                                                        <img src="/src/assets/delete.svg" alt="Delete" className="w-7 h-7" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {index < accounts.length - 1 && (
                                            <div className="w-full h-px bg-[#e3e3e3]"></div>
                                        )}
                                    </div>
                                ))
                            )}
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
                            onSuccess={fetchAllUsers} // Refresh sau khi thêm thành công
                        />

                        <DeleteConfirmPopup
                            isOpen={showDeletePopup}
                            onCancel={handleCancelDelete}
                            onConfirm={handleDeleteAccount}
                            loading={deleting} // Truyền loading state cho popup
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default QuanLyGVS;
