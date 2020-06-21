const express = require('express');
const UserLogin = require('../Models/User');
const auth = require('../Middleware/auth');
var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();


router.get('/api',(req,res)=>{
    res.send("server is working");
})

router.post('/api/users/signup', async (req, res) => {
    // Create a new user
    try {
        const {email} = req.body;
        const user = await UserLogin.findOne({email:email});
        if(!user){
            const user = new UserLogin(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            res.status(200).json({ user, token })
        }
        else{
            res.status(401).json({error: "email is already registered"})
        }
        
    } catch (error) {
        res.status(400).json(error.message)
    }
})

router.post('/api/users/sendverificationemail',auth,async (req,res)=>{
    try{
        const {email} = req.body;
        const otp = await otpGenerator.generate(4, {upperCase: false, specialChars: false,alphabets: false });
        const user = await UserLogin.findOne({email:email});
        const msg = {
            to: email,
            from: 'nani.punepalli@gmail.com', // Use the email address or domain you verified above
            subject: 'Ellipse OTP Authentication',
            text: `${otp}`,
            html: `<h1>your otp is ${otp}</h1>`,
          };
          try {
            await sgMail.send(msg);
            UserLogin.update({'email':email},{$set:{'otp': otp}}).then((val)=>{
                console.log(val);
            })
            res.status(200).json({message:"success"});
          } catch (error) {
            console.error(error);
        
            if (error.response) {
              console.error(error.response.body)
            }
          }
    }
    catch(error){
        res.status(400).json(error.message);
    }
})

router.post('/api/users/verifyotp',auth, async (req,res)=>{
    try{
        const {otp,email} = req.body;
        const user = await req.user;
        if(user.otp == otp){
            // console.log("Verified");
            res.status(200).json({"message":"verified"});
            
        }
        else{
            console.log({"message":"Not verified"});
        }
    }
    catch(error){
        res.status(400).json({ error: error.message})
    }
})
 
router.post('/api/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        console.log(email);
        console.log(password);
        // User.findByCredentials
        
        // const user = await LoginUser.findByCredentials(email,password);
        const user = await UserLogin.findOne({ email} );
        console.log(user);
        if (!user) {
            throw new Error('Invalid login credentials')
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            throw new Error('Invalid login credentials')
        }
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.status(200).json({ user, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

})
router.post('/api/users/userdetails',auth,(req,res)=>{
    try{
        const {gender,college,designation} = req.body;
        const user = req.user;
        UserLogin.update(
            {'email':user.email},
            {$set:{
                'collegeName': college,
                'gender': gender,
                'designation': designation
            }}).then((val)=>{
            console.log(val);
            res.status(200).json({message:"success"})
        })


    }
    catch(err){
        res.status(400).json({ error: err.message }) 
    }
})

router.get('/api/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.json(req.user)
})

router.post('/api/users/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.status(200).json({message: "success"});
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post('/api/users/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router