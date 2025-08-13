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

export const apiUpdateUser = (id, data) => axios({
    url: `http://localhost:5000/api/user/update/${id}`,
    method: 'put',
    data
});

export const getAllUsers = () => axios({
    url: 'http://localhost:5000/api/user/all',
    method: 'get'
})

export const deleteUser = (userId) => axios({
    url: `http://localhost:5000/api/user/del/${userId}`,
    method: 'delete'
});