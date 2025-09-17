import axios from '../axios'

export const apiRegister = (data) => axios({
    url: '/user/register',
    method: 'post',
    data
})

export const apiLogin = (data) => axios({
    url: '/user/login',
    method: 'post',
    data
})

export const apiGetCurrent = () => axios({
    url: '/user/current',
    method: 'get',
})

export const apiUpdateUser = (id, data) => axios({
    url: `/user/update/${id}`,
    method: 'put',
    data
});

export const getAllUsers = () => axios({
    url: '/user/all',
    method: 'get'
})

export const deleteUser = (userId) => axios({
    url: `/user/del/${userId}`,
    method: 'delete'
});