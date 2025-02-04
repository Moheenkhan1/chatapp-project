const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const authMiddleware = require('../middleware/authMiddleware.js'); 
const Message = require('../models/messages.model.js');
const { getContacts , authHome } = require('../controllers/home.controller.js');

const router = express.Router();


router.post('/auth',authMiddleware,authHome)

router.get('/contacts', authMiddleware, getContacts);


module.exports = router;