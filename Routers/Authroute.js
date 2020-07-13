const express = require('express');
const UserLogin = require('../Models/User');
const auth = require('../Middleware/Auth');
var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();
const UserDetails = require('../Models/UserDetails');
const collegeController = require('./collegeController')

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
            const userDetails = new UserDetails({
                'id': user._id,
                'username': user.username,
            'email': user.email,
            'name': user.name,
            })
            await userDetails.save();
            const userid = user._id;
            const useremail = user.email;
            res.status(200).json({ userid, useremail, token })
            // res.status(200).json({ user, token })
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
            UserLogin.update(
                {'email':user.email},
                {$set:{
                    'isVerified': true
                }}).then((val)=>{
                // console.log(val);
                UserDetails.update({ 'email':user.email }, { $set: { 'verified': true } }).then((value)=>{
                    console.log(val);
                    res.status(200).json({"message":"verified"});
                }) 
                
            })
              
        }
        else{
            console.log({"message":"Not verified"});
        }
    }
    catch(error){
        res.status(400).json({ error: error.message})
    }
})

router.post('/api/users/updatepassword',auth,async(req,res)=>{
    try {
        const {email,cPassword,nPassword} = req.body;
        const user = await req.user;
        const isPasswordMatch = await bcrypt.compare(cPassword, user.password)
        if (!isPasswordMatch) {
            return res.status(401).send({error: 'Incorrect current Password'});
        }
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'});
        }
        const hasedPassword = await bcrypt.hash(nPassword, 8)
        UserLogin.update({'email':user.email},{$set:{'password':hasedPassword}}).then((val)=>{
            // console.log(val);
            res.status(200).json({message:"success"})
        })
        res.status(200).json({message: "success"});
    } catch (error) {
        res.status(500).send(error.message)
    }
})



router.post('/api/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        console.log(email);
        console.log(password);
        const user = await UserLogin.findOne({ email} );
        if (!user) {
            throw new Error('Invalid login credentials')
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        console.log(isPasswordMatch);
        if (!isPasswordMatch) {
            throw new Error('Invalid login credentials')
        }
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken();
        // const userDetails = await UserDetails.findOne({email});
        // if (!userdetails) {
        //     return res.status(404).send("The email doesn't exists")
        // }
        const userid = user._id;
        const useremail = user.email;
        const isVerified = user.isVerified;
        res.status(200).json({userid, useremail, token,isVerified})
        // res.status(200).json({ user,userDetails, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

})
router.post('/api/users/userdetails',auth,async (req,res)=>{
    try{
        const {imageUrl,gender,collegeName,collegeId,designation,bio} = req.body;
        const user = await req.user;
        // console.log(user);
        console.log(collegeName);
        UserDetails.update({email: user.email},{$set:{
            'userid': user._id,
            'bio': bio,
            'imageUrl': imageUrl,
            'name': user.name,
            'gender': gender,
            'collegeName': collegeName,
            'designation': designation
        }
            
        }).then(val =>{
            console.log(val);
            UserDetails.findOne({email: user.email}).then(userDetails =>{
                console.log(userDetails);
                res.status(200).json({userDetails});
            })
            
        })
        
    }
    catch(err){
        res.status(400).json({ error: err.message }) 
    }
})

// router.post('/api/users/userdetails2',auth,(req,res)=>{
//     try{

//         const {image,bio} = req.body;
//         const user = req.user;
//         console.log(user);
//         UserLogin.update(
//             {'email':user.email},
//             {$set:
//                 {'bio': bio,
//                 'imageUrl': image
//             }}).then((val)=>{
//                 console.log(val);
//                 res.status(200).json({message:"success"})
//             })
//     }
//     catch(err){
//         res.status(400).json({ error: err.message }) 
//     }
// })

router.get('/api/users/me', auth, async(req, res) => {
    // View logged in user profile
    try{
        const user = req.user;
        console.log(user.email);
       const userDetails = await UserDetails.findOne({email:user.email})
       console.log(userDetails);
       res.status(200).json(userDetails);
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
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


router.post('/api/users/check',auth, async (req, res) => {
    try {
        const userdetails = await UserDetails.findOne({ userid: req.body.id })
        if (!userdetails) {
            return res.status(404).send("The user id doesn't exists")
        }
        if (userdetails.collegeId == null || userdetails.imageUrl == null) {
            return res.status(402).send("empty");
        }
        if (userdetails.verified != true) {
            return res.status(401).send("empty");
        }
        if (userdetails.collegeId != null && userdetails.imageUrl != null && userdetails.verified != false) {
            return res.status(403).send("empty");
        }
        console.log("Checked")

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem in check');
    }
})
router.post('/api/users/check_fill',auth, async (req, res) => {
    try {
        UserDetails.updateOne({ 'userid': req.body.id }, { $set: { 'collegeId': req.body.college, 'imageUrl': req.body.image_url } }).then((val)=>{
            console.log(val);
        })

        console.log("Checked")
        res.status(200).send("success");

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem in check');
    }
})
router.post('/api/users/otpverified',auth, async (req, res) => {
    try {
        const userdetails = await UserDetails.findOne({ otp: req.body.otp })
        if (!userdetails) {
            return res.status(404).send("The otp doesn't exists")
        }
        res.status(200).send("Verified")
        console.log("Verified")
        UserDetails.updateOne({ otp: req.body.otp }, { $set: { 'otp': '000000' } }).then((val)=>{
            console.log(val);
        })
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})
router.post('/api/users/emailverify',auth, async (req, res) => {
    try {
        const { email } = req.body;
        const otp = await otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        const userdetails = await UserDetails.findOne({ email: email })
        if (!userdetails) {
            return res.status(404).send("The email doesn't exists")
        } else {
            const msg = {
                to: email,
                from: 'nani.punepalli@gmail.com', // Use the email address or domain you verified above
                subject: 'OTP to verify your mail',
                text: `${otp}`,
                html: `<h1>your otp is ${otp}</h1>`,
            };
            try {
                await sgMail.send(msg);
                UserDetails.updateOne({ 'email': email }, { $set: { 'otp': otp } }).then((val)=>{
                    console.log(val);
                })
                res.status(200).json({ otp });
            } catch (error) {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            }
        }
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})

router.post('/api/users/emailverified',auth, async (req, res) => {
    try {
        const user = await req.user;

        UserDetails.updateOne({ otp: req.body.otp }, { $set: { 'verified': true } }).then((val)=>{
            console.log(val);
        })
        UserLogin.update(
            {'email':user.email},
            {$set:{
                'isVerified': true
            }})
        const userdetails = await UserDetails.findOne({ otp: req.body.otp })
        if (!userdetails) {
            return res.status(404).send("The otp doesn't exists")
        }
        res.status(300).send("Verified")
        console.log("Verified")
        UserDetails.updateOne({ otp: req.body.otp }, { $set: { 'otp': '000000' } }).then((val)=>{
            console.log(val);
        })
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})

router.route('/colleges')
    .get(collegeController.index)

module.exports = router
