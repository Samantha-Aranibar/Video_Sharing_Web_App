var express = require('express');
var router = express.Router();
const{doesUsernameExist, doesEmailExist, validateEmail, validatePassword, validateUsername, checkLogin, isLoggedIn, isNotLoggedIn, isMyProfile} = require('../middleware/validate');
const db = require('../conf/database');
const bcrypt = require('bcrypt');


//tenia 10 lineas creo

const videoObserver = new IntersectionObserver(function (entries) {
    document.getElementById()
});
////////////////////////////////////////////////////////////
