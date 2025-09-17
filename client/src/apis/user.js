import axios from '../axios'

export const apiRegister = (data) => axios({
<<<<<<< HEAD
    url: 'http://localhost:5000/api/user/register',
=======
    url: '/user/register',
>>>>>>> origin/yolo_tracking
    method: 'post',
    data
})

export const apiLogin = (data) => axios({
<<<<<<< HEAD
    url: 'http://localhost:5000/api/user/login',
=======
    url: '/user/login',
>>>>>>> origin/yolo_tracking
    method: 'post',
    data
})

export const apiGetCurrent = () => axios({
<<<<<<< HEAD
    url: 'http://localhost:5000/api/user/current',
=======
    url: '/user/current',
>>>>>>> origin/yolo_tracking
    method: 'get',
})

export const apiUpdateUser = (id, data) => axios({
<<<<<<< HEAD
    url: `http://localhost:5000/api/user/update/${id}`,
=======
    url: `/user/update/${id}`,
>>>>>>> origin/yolo_tracking
    method: 'put',
    data
});

export const getAllUsers = () => axios({
<<<<<<< HEAD
    url: 'http://localhost:5000/api/user/all',
=======
    url: '/user/all',
>>>>>>> origin/yolo_tracking
    method: 'get'
})

export const deleteUser = (userId) => axios({
<<<<<<< HEAD
    url: `http://localhost:5000/api/user/del/${userId}`,
=======
    url: `/user/del/${userId}`,
>>>>>>> origin/yolo_tracking
    method: 'delete'
});