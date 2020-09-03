const express = require('express');
const UserLogin = require('../Models/User');
const auth = require('../Middleware/Auth');
var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();
const UserDetails = require('../Models/UserDetails');
const collegeController = require('./collegeController');
var Grid = require('gridfs-stream');
const { route } = require('./ChatRoute');
const Files = require('../Models/Files');
const md5 = require('md5');
// const ProfilePics = require('../Models/ProfilePics');


router.get('/api',(req,res)=>{
    res.send("server is working");
})

router.post('/api/check_username', async (req,res)=>{
    try{
        const {username} = req.body;
        const user = await UserLogin.findOne({username: username})
        if(user){
            res.status(200).json({message: "user already exists"});
        }
        else{
            res.status(200).json({message: "no user found"});
        }
    }
    catch(error){
        res.status(400).json({ error: error.message})
    }
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
                'user_id': user._id,
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

router.post('/api/users/sendverificationemail',async (req,res)=>{
    try{
        const {email} = req.body;
        console.log(email);
        const otp = await otpGenerator.generate(4, {upperCase: false, specialChars: false,alphabets: false });
        const user = await UserLogin.findOne({email:email});
        const msg = {
            to: email,
            from: 'support@ellipseapp.com', // Use the email address or domain you verified above
            subject: 'Ellipse OTP Authentication',
            text: `${otp}`,
            html: `<h1>your otp is ${otp}</h1>`,
          };
          try {
            await sgMail.send(msg);
            UserLogin.updateOne({'email':email},{$set:{'otp': otp}}).then((val)=>{
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
                    'is_verified': true
                }}).then((val)=>{
                // console.log(val);
                UserDetails.update({ 'email':user.email }, { $set: { 'verified': true } }).then((value)=>{
                    console.log(val);
                    res.status(200).json({"message":"verified"});
                }) 
                
            })
              
        }
        else{
            res.status(400).json({"message":"Not verified"});
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


router.post('/api/users/forgotpassword',async(req,res)=>{
    try {
        const {email,otp,nPassword} = req.body;
        console.log(email)
        const user = await UserLogin.findOne({'email':email})
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'});
        }
        // console.log(otp == user.otp);
        // console.log(user.otp)
        if(user.otp == otp){
            const hasedPassword = await bcrypt.hash(nPassword, 8)
        UserLogin.updateOne({'email':email},{$set:{'password':hasedPassword}}).then((val)=>{
            // console.log(val);
            res.status(200).json({message:"success"})
        })
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})



router.get('/api/users/getuser',auth,async(req,res)=>{
    try{
        const userDetails = await UserDetails.findOne({user_id:req.query.id})
        res.send({'name': userDetails.name,'image': userDetails.profile_pic})
    }
    catch (error) {
        res.status(400).json({ error: error.message })
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
        const isVerified = user.is_verified;
        res.status(200).json({userid, useremail, token,isVerified})
        // res.status(200).json({ user,userDetails, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

})
router.post('/api/users/userdetails',auth,async (req,res)=>{
    try{
        const {gender,college_id,designation,bio} = req.body;
        const user = await req.user;
        console.log(user);
        // console.log(collegeName);
        // console.log(imageUrl);
        console.log(college_id);
        const college = await Colleges.findOne({ _id: college_id });
        console.log(college);
        UserDetails.updateOne({email: user.email},{$set:{
            'user_id': user._id,
            'bio': bio,
            'name': user.name,
            'gender': gender,
            'college_name': college.name,
            'designation': designation,
            'college_id': college_id
        }
            
        }).then(val =>{
            res.status(200).json({message: "success"});
        })
        
    }
    catch(err){
        res.status(400).json({ error: err.message }) 
    }
})

router.post('/api/users/updateprofile',auth,async (req,res)=>{
    try{
        const {name,email,username,gender,college_id,designation,bio} = req.body;
        const user = await req.user;
        const college = await Colleges.findOne({ _id: college_id });
        UserDetails.updateOne({email: user.email},{$set:{
            'bio': bio,
            'name': name,
            'username': username,
            'gender': gender,
            'college_name': college.name,
            'designation': designation,
            'college_id': college_id,
        }
            
        }).then(val =>{
            res.status(200).json({message: "success"});
        })
    }
    catch(err){
        res.status(400).json({ error: err.message }) 
    }
})

router.post('/api/users/uploadimage', auth, async (req, res) => {
    const user = req.user;
    const fileName = user._id + md5(Date.now())
    const userDetails = await UserDetails.findOne({user_id: user._id});
    if(userDetails.profile_pic != null){
        Files.deleteFile(userDetails.profile_pic,(result)=>{
            Files.saveFile(req.files.image, userDetails.profile_pic, user._id,"userprofilepic", function (err, result) {
                if (!err) {
                    res.status(200).json({
                        status: 'success',
                        code: 200,
                        message: 'image added successfully',
                    })
                }
                else {
                    res.status(400).json({
                        status: 'error',
                        code: 500,
                        message: err
                    })
                }
            });
        })
    }
    else{
        Files.saveFile(req.files.image, fileName, user._id,"userprofilepic", function (err, result) {
            if (!err) {
                // console.log("aaxd")
                UserDetails.updateOne({ user_id: user._id  }, { $set: { 'profile_pic': fileName } }).then((value) => {
                    console.log("done");
                    res.status(200).json({
                        status: 'success',
                        code: 200,
                        message: 'image added successfully',
                    })
                })
            }
            else {
                res.status(400).json({
                    status: 'error',
                    code: 500,
                    message: err
                })
            }
        });
    }
})




router.get('/api/users/me', auth, async(req, res) => {
    // View logged in user profile
    try{
        const user = req.user;
        // console.log(user.email);
       const userDetails = await UserDetails.findOne({email:user.email})
    //    console.log(userDetails);
       var list =[userDetails];
       res.status(200).json(list);
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

// router.post('/api/users/logoutall', auth, async(req, res) => {
//     // Log user out of all devices
//     try {
//         req.user.tokens.splice(0, req.user.tokens.length)
//         await req.user.save()
//         res.send()
//     } catch (error) {
//         res.status(500).send(error.message)
//     }
// })


router.post('/api/users/check', auth, async (req, res) => {
    try {
        const userdetails = await UserDetails.findOne({ user_id: req.body.id })
        if (!userdetails) {
            return res.status(404).send("The user id doesn't exists")
        }
        if (userdetails.verified == false) {
            return res.status(401).send("empty");
        }
        if (userdetails.college_id == null || userdetails.profile_pic == null) {
            return res.status(402).send("empty");
        }

        if (userdetails.college_id != null && userdetails.profile_pic != null && userdetails.verified != false) {
            const user = req.user;
            const userDetails = await UserDetails.findOne({ email: user.email })
            const college_id=userDetails.college_id
            return res.status(403).send(college_id);
        }
        console.log("Checked")

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem in check');
    }
})



router.post('/api/users/check_fill',auth, async (req, res) => {
    try {
        const colleges = await Colleges.findOne({ _id: req.body.college })
        const cname =colleges.name
        UserDetails.updateOne({ 'userid': req.body.id }, { $set: { 'college_id': req.body.college,'college_name':cname, 'profile_pic': req.body.image_url,'bio': req.body.bio,'designation': req.body.designation } }).then((val)=>{
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
router.post('/api/users/emailverify',async (req, res) => {
    try {
        const email = req.query.email;
        const otp = await otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        const userdetails = await UserDetails.findOne({ email: email })
        if (!userdetails) {
            return res.status(404).send("The email doesn't exists")
        } else {
            const msg = {
                to: email,
                from: 'support@ellipseapp.com', // Use the email address or domain you verified above
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
        await UserLogin.updateOne(
            {'email':user.email},
            {$set:{
                'is_verified': true
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
router.post('/api/users/emailverified_forgot_password', async (req, res) => {
    try {
        const otp = req.query.otp;
        const userdetails = await UserDetails.findOne({ otp: otp })
        if (!userdetails) {
            return res.status(404).send("The otp doesn't exists")
        }
        res.status(200).send("Verified")
        console.log("Verified")
        UserDetails.updateOne({ otp: otp }, { $set: { 'otp': '000000' } }).then((val)=>{
            console.log(val);
        })
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})
router.post('/api/users/reset_password',async(req,res)=>{
    try {
        const {email,password} = req.body;
        console.log(email)
        const user = await UserLogin.findOne({'email':email})
        if (!user) {
            return res.status(401).send({error: 'Reset failed'});
        }
            const hasedPassword = await bcrypt.hash(password, 8)
        UserLogin.updateOne({'email':email},{$set:{'password':hasedPassword}}).then((val)=>{
            res.status(200).json({message:"success"})
        })
       
    } catch (error) {
        res.status(500).send(error.message)
    }
})
router.route('/api/colleges')
    .get(collegeController.index)

module.exports = router
