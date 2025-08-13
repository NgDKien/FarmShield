const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const upload = require('../config/multer');
const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } catch (error) {
            console.error(`Error deleting file ${filePath}:`, error);
        }
    }
};

const register = asyncHandler(async (req, res) => {
    // Sử dụng multer middleware
    upload.single('avatar')(req, res, async (err) => {
        try {
            // Xử lý lỗi multer
            if (err) {
                if (err instanceof multer.MulterError) {
                    switch (err.code) {
                        case 'LIMIT_FILE_SIZE':
                            return res.status(400).json({
                                success: false,
                                message: "File ảnh quá lớn (tối đa 5MB)"
                            });
                        case 'LIMIT_FILE_COUNT':
                            return res.status(400).json({
                                success: false,
                                message: "Chỉ được upload 1 file ảnh"
                            });
                        case 'LIMIT_UNEXPECTED_FILE':
                            return res.status(400).json({
                                success: false,
                                message: "Field name không đúng. Sử dụng 'avatar'"
                            });
                        default:
                            return res.status(400).json({
                                success: false,
                                message: "Lỗi upload file: " + err.message
                            });
                    }
                }

                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            // Lấy dữ liệu từ request
            const { fullname, account, password } = req.body;

            // Validation các trường bắt buộc
            if (!account || !password || !fullname) {
                // Xóa file đã upload nếu validation fail
                if (req.file) {
                    deleteFile(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng điền đầy đủ thông tin (fullname, account, password)"
                });
            }

            // Kiểm tra độ dài password
            if (password.length < 6) {
                if (req.file) {
                    deleteFile(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                });
            }

            // Kiểm tra user đã tồn tại
            const existingUser = await User.findOne({ account: account.trim() });
            if (existingUser) {
                if (req.file) {
                    deleteFile(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: "Tài khoản đã tồn tại!"
                });
            }

            // Tạo object user data
            const userData = {
                fullname: fullname.trim(),
                account: account.trim(),
                password,
            };

            // Thêm avatar path nếu có file upload
            if (req.file) {
                userData.avatar = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
            }

            // Tạo user mới
            const newUser = await User.create(userData);

            // Response success
            return res.status(201).json({
                success: true,
                message: "Đăng ký thành công!",
                data: {
                    fullname: newUser.fullname,
                    account: newUser.account,
                    avatar: newUser.avatar,
                    avatarUrl: newUser.avatarUrl,
                }
            });

        } catch (error) {
            // Xóa file đã upload nếu có lỗi database
            if (req.file) {
                deleteFile(req.file.path);
            }

            console.error('Register error:', error);
            return res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra trong quá trình đăng ký: " + error.message
            });
        }
    });
});

const login = asyncHandler(async (req, res) => {
    const { account, password } = req.body
    if (!account || !password)
        return res.status(400).json({
            sucess: false,
            mes: 'Missing inputs'
        })
    // plain object
    const response = await User.findOne({ account })
    if (response && await response.isCorrectPassword(password)) {
        // Tách password và role ra khỏi response
        const { password, role, ...userData } = response.toObject()
        // Tạo access token
        const accessToken = generateAccessToken(response._id, role)
        // Tạo refresh token
        const refreshToken = generateRefreshToken(response._id)
        // Lưu refresh token vào database
        await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true })
        // Lưu refresh token vào cookie
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    } else {
        throw new Error('Invalid credentials!')
    }
})

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: true,
        rs: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Lấy token từ cookies
    const cookie = req.cookies
    // Check xem có token hay không
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies')
    // Check token có hợp lệ hay không
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
    })
})

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken)
        throw new Error("No refresh token in cookies")
    // Xóa refresh token ở db
    await User.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        { refreshToken: "" },
        { new: true }
    )
    // Xóa refresh token ở cookie trình duyệt
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    })
    return res.status(200).json({
        success: true,
        mes: "Logout is done",
    })
})

const updateUser = asyncHandler(async (req, res) => {
    // Sử dụng multer middleware
    upload.single('avatar')(req, res, async (err) => {
        try {
            // Xử lý lỗi multer
            if (err) {
                if (err instanceof multer.MulterError) {
                    switch (err.code) {
                        case 'LIMIT_FILE_SIZE':
                            return res.status(400).json({
                                success: false,
                                message: "File ảnh quá lớn (tối đa 5MB)"
                            });
                        case 'LIMIT_FILE_COUNT':
                            return res.status(400).json({
                                success: false,
                                message: "Chỉ được upload 1 file ảnh"
                            });
                        case 'LIMIT_UNEXPECTED_FILE':
                            return res.status(400).json({
                                success: false,
                                message: "Field name không đúng. Sử dụng 'avatar'"
                            });
                        default:
                            return res.status(400).json({
                                success: false,
                                message: "Lỗi upload file: " + err.message
                            });
                    }
                }

                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            // Lấy ID từ params
            const { id } = req.params;

            // Kiểm tra ID hợp lệ
            if (!id) {
                if (req.file) {
                    deleteFile(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: "ID người dùng là bắt buộc"
                });
            }

            // Tìm user trong database
            const existingUser = await User.findById(id);
            if (!existingUser) {
                if (req.file) {
                    deleteFile(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng"
                });
            }

            // Lấy dữ liệu từ request
            const { fullname, account, role } = req.body;

            // Tạo object cập nhật
            const updateData = {};

            // Cập nhật fullname nếu có
            if (fullname !== undefined) {
                if (!fullname.trim()) {
                    if (req.file) {
                        deleteFile(req.file.path);
                    }
                    return res.status(400).json({
                        success: false,
                        message: "Họ tên không được để trống"
                    });
                }

                if (fullname.trim().length < 2 || fullname.trim().length > 100) {
                    if (req.file) deleteFile(req.file.path);
                    return res.status(400).json({
                        success: false,
                        message: "Họ tên phải từ 2-100 ký tự"
                    });
                }

                updateData.fullname = fullname.trim();
            }

            // Cập nhật account nếu có
            if (account !== undefined) {
                const trimmedAccount = account.trim().toLowerCase();

                if (!trimmedAccount) {
                    if (req.file) {
                        deleteFile(req.file.path);
                    }
                    return res.status(400).json({
                        success: false,
                        message: "Tài khoản không được để trống"
                    });
                }

                // Kiểm tra độ dài và format
                if (trimmedAccount.length < 3 || trimmedAccount.length > 50) {
                    if (req.file) deleteFile(req.file.path);
                    return res.status(400).json({
                        success: false,
                        message: "Tài khoản phải từ 3-50 ký tự"
                    });
                }

                // Kiểm tra định dạng account
                const accountRegex = /^[a-zA-Z0-9_-]+$/;
                if (!accountRegex.test(trimmedAccount)) {
                    if (req.file) deleteFile(req.file.path);
                    return res.status(400).json({
                        success: false,
                        message: "Tài khoản chỉ được chứa chữ cái, số, gạch dưới và gạch ngang"
                    });
                }

                // Kiểm tra tài khoản đã tồn tại (trừ user hiện tại)
                if (trimmedAccount !== existingUser.account) {
                    const duplicateUser = await User.findOne({
                        account: trimmedAccount,
                        _id: { $ne: id } // Loại trừ user hiện tại
                    });

                    if (duplicateUser) {
                        if (req.file) {
                            deleteFile(req.file.path);
                        }
                        return res.status(409).json({
                            success: false,
                            message: "Tài khoản đã tồn tại!"
                        });
                    }
                }

                updateData.account = trimmedAccount;
            }

            // Cập nhật role nếu có
            if (role !== undefined) {
                if (!["GSV", "Admin"].includes(role)) {
                    if (req.file) {
                        deleteFile(req.file.path);
                    }
                    return res.status(400).json({
                        success: false,
                        message: "Role không hợp lệ. Chỉ chấp nhận: GSV, Admin"
                    });
                }
                updateData.role = role;
            }

            // Xử lý avatar mới
            if (req.file) {
                // Xóa avatar cũ nếu có
                if (existingUser.avatar) {
                    deleteFile(existingUser.avatar);
                }

                updateData.avatar = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
            }

            // Cập nhật user
            const updatedUser = await User.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true, // Trả về document sau khi update
                    runValidators: true // Chạy validation
                }
            );

            if (!updatedUser) {
                if (req.file) {
                    deleteFile(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: "Không thể cập nhật người dùng"
                });
            }

            // Response success (password đã bị loại bỏ qua toJSON method)
            return res.status(200).json({
                success: true,
                message: "Cập nhật thông tin thành công!",
                data: updatedUser // toJSON sẽ tự động loại bỏ password và refreshToken
            });

        } catch (error) {
            // Xóa file đã upload nếu có lỗi database
            if (req.file) {
                deleteFile(req.file.path);
            }

            console.error('Update user error:', error);

            // Xử lý lỗi duplicate key (trường hợp race condition)
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Tài khoản đã tồn tại!"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra trong quá trình cập nhật"
            });
        }
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({})
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user nào trong hệ thống"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách users thành công",
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra trong quá trình lấy danh sách users: " + error.message
        });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        // Kiểm tra userId có được cung cấp không
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID người dùng"
            });
        }

        // Tìm user cần xóa
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Lưu thông tin avatar để xóa file sau
        const avatarPath = user.avatar;

        // Xóa user khỏi database
        await User.findByIdAndDelete(userId);

        // Xóa file avatar nếu có
        if (avatarPath) {
            deleteFile(avatarPath);
        }

        // Response success
        return res.status(200).json({
            success: true,
            message: "Xóa người dùng thành công!",
            data: {
                deletedUser: {
                    fullname: user.fullname,
                    account: user.account
                }
            }
        });

    } catch (error) {
        console.error('Delete user error:', error);

        // Xử lý lỗi ObjectId không hợp lệ
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "ID người dùng không hợp lệ"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra trong quá trình xóa người dùng: " + error.message
        });
    }
})

module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    updateUser,
    getAllUsers,
    deleteUser
}