const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken } = require('../middlewares/verifyToken')

router.post('/register', ctrls.register)
router.post('/login', ctrls.login)
router.put('/update/:id', ctrls.updateUser);
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.get('/all', ctrls.getAllUsers);
router.delete('/del/:userId', ctrls.deleteUser);
router.post('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)

module.exports = router