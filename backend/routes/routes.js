const express = require('express');
const router = express.Router()
const userController = require('../controllers/userController')


router.get('/',userController.getUser)
router.post('/login',userController.login)
router.get('/user/:id',userController.getUser)
router.post('/register',userController.registerUser)


module.exports = router;