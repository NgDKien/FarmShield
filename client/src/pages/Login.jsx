import React from 'react'
import { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom'
import { apiLogin } from '../apis/user'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import path from '../ultils/path'
import { login } from '../app/userSlice'
import { useDispatch } from 'react-redux'
import { Quantum } from 'ldrs/react'
import 'ldrs/react/Quantum.css'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [payload, setPayload] = useState({
        account: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = useCallback(async () => {
        console.log('Thông tin đăng nhập:', payload);

        if (!payload.account || !payload.password) {
            alert("Vui lòng nhập đủ thông tin đăng nhập!")
            return;
        }

        const rs = await apiLogin(payload)
        console.log('API Response:', rs) // Thêm dòng này
        console.log('rs.success:', rs.success)
        if (rs.success) {
            setIsLoading(true)
            setTimeout(() => {
                dispatch(login({ isLoggedIn: true, token: rs.accessToken, userData: rs.userData }))
                navigate(`/${path.HOME}`)
            }, 2000)
        } else Swal.fire('Oops!', rs.mes, 'error')

    }, [payload])

    const handleInputChange = (field) => (e) => {
        setPayload(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    return (
        <div className='bg-[#f8f9fd] min-h-screen flex items-center justify-center'>
            <div className="flex flex-col items-center justify-center bg-white border-[0.5px] border-gray-300 shadow-lg rounded-[20px] py-[110px] px-[22px] w-fit text-center gap-[76px]">
                <div className="flex flex-col items-center justify-center gap-[2px] p-5 relative w-fit">
                    <h2 className="relative self-stretch font-inter -mt-px font-semibold text-black text-[20px] text-center mb-8">
                        Welcome to
                    </h2>
                    <img src="/src/assets/FarmShield.svg" className=" h-8 lg:h-10" />
                </div>
                <div className="flex flex-col gap-5 relative items-start">
                    <div className="w-[376px] h-12 relative">
                        <input
                            type="text"
                            placeholder="Tài khoản"
                            value={payload.account}
                            onChange={handleInputChange('account')}
                            className="font-inter w-full h-full px-4 py-[13px] rounded-[4px] border border-gray-300 text-gray-700 placeholder-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-[#003BD0]"
                        />
                    </div>

                    <div className="w-[376px] h-12 relative ">
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={payload.password}
                            onChange={handleInputChange('password')}
                            className="font-inter w-full h-full px-4 py-[13px] rounded-[4px] border border-gray-300 text-gray-700 placeholder-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-[#003BD0]"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-[376px] h-12 relative bg-[#5888ff] text-white font-inter font-semibold px-6 py-2 rounded-md hover:bg-[#8BACFF] focus:outline-none focus:bg-[#2C61E6]"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
            {isLoading && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
                    <Quantum
                        size="140"
                        speed="1.7"
                        color="#5BE176"
                    />
                </div>
            )}
        </div>
    )
}

export default Login
