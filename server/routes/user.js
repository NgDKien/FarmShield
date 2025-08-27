const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/register', ctrls.register)
router.post('/login', ctrls.login)
router.put('/update/:id', [verifyAccessToken, isAdmin], ctrls.updateUser);
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.get('/all', [verifyAccessToken, isAdmin], ctrls.getAllUsers);
router.delete('/del/:userId', [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.post('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout', ctrls.logout)

module.exports = router