import axios from '../axios'

export const apiRegister = (data) => axios({
    url: 'http://localhost:5000/api/user/register',
    method: 'post',
    data
})

export const apiLogin = (data) => axios({
    url: 'http://localhost:5000/api/user/login',
    method: 'post',
    data
})

export const apiGetCurrent = () => axios({
    url: 'http://localhost:5000/api/user/current',
    method: 'get',
})