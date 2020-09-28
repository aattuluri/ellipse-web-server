const express = require('express');
// const md5 = require('md5');
// var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const AdminLogin = require('../Models/AdminLogin')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();


//user only when user is required to be created 

// router.post('/api/admin/signup', async (req, res) => {
//     try {
//         const adminLogin = new AdminLogin(req.body);
//         await adminLogin.save();
//         res.status(200).json({ "message": "success" })
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// })


//Signing in of the admin

router.post('/api/admin/signin', async (req, res) => {
    try {
        const { username, password } = req.body
        const admin = await AdminLogin.findOne({ username });
        if (!admin) {
            throw new Error('Invalid login credentials')
        }
        const isPasswordMatch = await bcrypt.compare(password, admin.password)

        if (!isPasswordMatch) {
            throw new Error('Invalid login credentials')
        }
        if (!admin) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }
        const token = await admin.generateAuthToken();
        
        res.status(200).json({ username,token})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})



module.exports = router