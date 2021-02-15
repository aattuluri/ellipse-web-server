const express = require('express');
const md5 = require('md5');
var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const https = require('https');
// var Grid = require('gridfs-stream');

const UserLogin = require('../Models/User');
const auth = require('../Middleware/Auth');
const UserDetails = require('../Models/UserDetails');
const collegeController = require('./collegeController');
const Files = require('../Models/Files');
const LoginActivity = require('../Models/LoginActivity');
// const { route } = require('./ChatRoute');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();
// var os = require("os");
// var geoip = require('geoip-lite');


router.post('/api/verify_recaptcha', async (req, res) => {
    console.log(req.body.recaptcha_token);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    // const data = JSON.stringify({

    // });
    const r = https.request(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_SITE_KEY}&response=${req.body.recaptcha_token}`, options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
            const parsedData = JSON.parse(d);
            // console.log(parsedData);
            res.json(parsedData);
        })
    })
    r.on('error', (error) => {
        console.error(error)
    })
    // r.write(data)
    r.end()

}, [])


//route to ping for api if it is working
router.get('/api', async (req, res) => {
    const ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
    console.log(ip);
    // console.log(req.connection.remoteAddress);
    // console.log(req.headers['x-forwarded-for'])
    // console.log(req.headers['x-forwarded-for'][0])
    // var ip = '192.168.0.101';
    // var geo = await geoip.lookup(ip);
    // console.log(geo);
    res.send("server is working");
})

router.get('/api/get_version', (req, res) => {
    res.status(200).json({ version_name: "1.0.2", required: true });
})


//route to check if username already exists 
router.post('/api/check_username', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await UserLogin.findOne({ username: username })
        if (user) {
            res.status(200).json({ message: "user already exists" });
        }
        else {
            res.status(401).json({ message: "no user found" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to check if email is already registered

router.post('/api/check_email_exists', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserLogin.findOne({ email: email })
        if (user) {
            res.status(200).json({ message: "email already exists" });
        }
        else {
            res.status(201).json({ message: "no user found" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//route for user signup
router.post('/api/users/signup', async (req, res) => {
    // Create a new user
    try {
        const { email , designation} = req.body;
        // console.log(designation);
        const user = await UserLogin.findOne({ email: email });
        if (!user) {
            const user = new UserLogin(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            const userDetails = new UserDetails({
                'user_id': user._id,
                'username': user.username,
                'email': user.email,
                'name': user.name,
                'designation': designation
            })
            await userDetails.save();
            const userid = user._id;
            const useremail = user.email;
            res.status(200).json({ userid, useremail, token });
            console.log(req.connection.remoteAddress);
            const ipAdress = req.connection.remoteAddress;
            const loginActivity = new LoginActivity();
            loginActivity.user_id = user._id;
            loginActivity.ip_address = ipAdress;
            if (req.body.type === "browser") {
                loginActivity.type = req.body.type;
                loginActivity.browser_name = req.body.browser_name;
                loginActivity.device_os = req.body.device_os;
                loginActivity.status = "success";
                loginActivity.save();
            }
            else if (req.body.type === "app") {
                loginActivity.type = req.body.type;
                loginActivity.device_os = req.body.device_os;
                loginActivity.device_name = req.body.device_name;
                loginActivity.status = "success";
                loginActivity.save();
            }
            // res.status(200).json({ user, token })
        }
        else {
            res.status(401).json({ error: "email is already registered" })
        }

    } catch (error) {
        res.status(400).json(error.message)
    }
})

// router.get('/api/testemail', async (req, res) => {
//     const msg = {
//         to: 'lalithpunepalli@gmail.com',
//         from: { "email": 'support@ellipseapp.com', 'name': "Ellipse Support" }, // Use the email address or domain you verified above
//         // subject: 'Information',
//         //     text: 'Nothing 2',
//         //     html: `<h1>testing</h1><h2>nothing</h2>`,
//         templateId: 'd-c3456f977aca444cb52e0ad002d737d8',
//         dynamic_template_data: {
//             subject: "important",
//             pre_header: "important",
//             title: "nothing 2",
//             content: "nothing 3",
//         },
//     };
//     await sgMail.send(msg);
//     res.send("success")
// })


//roite to send verification mail
router.post('/api/users/sendverificationemail', async (req, res) => {
    try {
        const { email } = req.body;
        // console.log(email);
        const otp = await otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false });
        const user = await UserLogin.findOne({ email: email });
        if (user) {
            const msg = {
                to: email,
                from: { "email": 'support@ellipseapp.com', 'name': "Ellipse Support" }, // Use the email address or domain you verified above
                // templateId: 'd-25c76e60f9f146b78dc11e2ad9bdb62f',
                subject: 'OTP Verifiation',
                // text: 'https://staging.ellipseapp.com/home',
                html: `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>OTP Verification</title>
                </head>
                <body>
                    <div style="background-color: #00bdaa;border-radius: 30px;padding: 20px;">
                        <h1 style="text-align: center;font-size: 2.5em;color: #000000;">EllipseApp</h1>
                        <div style="background-color: #ffffff;text-align: center;border-radius: 30px;padding: 20px;">
                            <h3 style="text-align: center;color: #000000;">Your OTP is</h3>
                            <h1 style="text-align: center;font-size: 4.5em;color: #000000;">${otp}</h1>
                            <a href="https://ellipseapp.page.link/app" style="text-decoration: none;color: #000000;margin: auto;background-color: #00bdaa;height: 50px;width: 100px;border-radius: 20px;padding: 10px;">Open App</a>
                        </div>
                    </div>
                </body>
                </html>`,
                // dynamic_template_data: {
                //     OTP: otp
                // },
            };
            try {
                await sgMail.send(msg);
                UserLogin.updateOne({ 'email': email }, { $set: { 'otp': otp } }).then((val) => {
                    // console.log(val);
                })
                res.status(200).json({ message: "success" });
            } catch (error) {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            }
        }
        else {
            res.status(401).json({ message: "user not found" });
        }

    }
    catch (error) {
        res.status(400).json(error.message);
    }
})


//roite to send verification mail with auth
router.post('/api/users/sendverificationemailwithauth', auth, async (req, res) => {
    try {
        const user = req.user;
        const otp = await otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false });
        if (user) {
            const msg = {
                to: user.email,
                from: { "email": 'support@ellipseapp.com', 'name': "Ellipse Support" }, // Use the email address or domain you verified above
                templateId: 'd-25c76e60f9f146b78dc11e2ad9bdb62f',
                dynamic_template_data: {
                    OTP: otp
                },
            };
            try {
                await sgMail.send(msg);
                UserLogin.updateOne({ 'email': user.email }, { $set: { 'otp': otp } }).then((val) => {
                    console.log(val);
                })
                res.status(200).json({ message: "success" });
            } catch (error) {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            }
        }
        else {
            res.status(401).json({ message: "user not found" });
        }

    }
    catch (error) {
        res.status(400).json(error.message);
    }
})

//roputer to verify the otp
router.post('/api/users/verifyotp', auth, async (req, res) => {
    try {
        const { otp, email } = req.body;
        const user = await req.user;
        if (user.otp == otp) {
            // console.log("Verified");
            UserLogin.updateOne(
                { 'email': user.email },
                {
                    $set: {
                        'is_verified': true
                    }
                }).then((val) => {
                    // console.log(val);
                    UserDetails.updateOne({ 'email': user.email }, { $set: { 'verified': true } }).then((value) => {
                        // console.log(val);
                        res.status(200).json({ "message": "verified" });
                    })

                })

        }
        else {
            res.status(400).json({ "message": "Not verified" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//route to update password with current password
router.post('/api/users/updatepassword', auth, async (req, res) => {
    try {
        const { email, cPassword, nPassword } = req.body;
        const user = await req.user;
        const isPasswordMatch = await bcrypt.compare(cPassword, user.password)
        if (!isPasswordMatch) {
            return res.status(401).send({ error: 'Incorrect current Password' });
        }
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
        }
        const hasedPassword = await bcrypt.hash(nPassword, 8)
        UserLogin.updateOne({ 'email': user.email }, { $set: { 'password': hasedPassword } }).then((val) => {
            // console.log(val);
            res.status(200).json({ message: "success" })
        })
        // res.status(200).json({message: "success"});
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//route to change password with otp
router.post('/api/users/forgotpassword', async (req, res) => {
    try {
        const { email, otp, nPassword } = req.body;
        // console.log(email)
        const user = await UserLogin.findOne({ 'email': email })
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
        }
        // console.log(otp == user.otp);
        // console.log(user.otp)
        if (user.otp == otp) {
            const hasedPassword = await bcrypt.hash(nPassword, 8)
            UserLogin.updateOne({ 'email': email }, { $set: { 'password': hasedPassword } }).then((val) => {
                // console.log(val);
                res.status(200).json({ message: "success" })
            })
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})


//route to get the userdetails
router.get('/api/users/getuser', auth, async (req, res) => {
    try {
        const userDetails = await UserDetails.findOne({ user_id: req.query.id })
        res.send({ 'name': userDetails.name, 'image': userDetails.profile_pic })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to login
router.post('/api/users/login', async (req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body;
        console.log(req.connection.remoteAddress);
        const ipAdress = req.connection.remoteAddress;
        const loginActivity = new LoginActivity();
        const user = await UserLogin.findOne({ email });
        if (!user) {
            throw new Error('Invalid login credentials')
        }
        loginActivity.user_id = user._id;
        loginActivity.ip_address = ipAdress;
        if (req.body.type === "browser") {
            loginActivity.type = req.body.type;
            loginActivity.browser_name = req.body.browser_name;
            loginActivity.device_os = req.body.device_os;
        }
        else if (req.body.type === "app") {
            loginActivity.type = req.body.type;
            loginActivity.device_os = req.body.device_os;
            loginActivity.device_name = req.body.device_name;
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            loginActivity.status = "failed";
            loginActivity.save()
            return res.status(401).send({ error: 'Invalid login credentials' })
        }
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }
        const token = await user.generateAuthToken();
        // const userDetails = await UserDetails.findOne({email});
        // if (!userdetails) {
        //     return res.status(404).send("The email doesn't exists")
        // }
        const userid = user._id;
        const useremail = user.email;
        const isVerified = user.is_verified;
        res.status(200).json({ userid, useremail, token, isVerified });
        loginActivity.status = "success";
        loginActivity.save();
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

})

//route to post the user details
router.post('/api/users/userdetails', auth, async (req, res) => {
    try {
        const { gender, college_id, bio } = req.body;
        const user = await req.user;
        const college = await Colleges.findOne({ _id: college_id });
        UserDetails.updateOne({ email: user.email }, {
            $set: {
                'user_id': user._id,
                'bio': bio,
                'name': user.name,
                'gender': gender,
                'college_name': college.name,
                // 'designation': designation,
                'college_id': college_id
            }

        }).then(val => {
            res.status(200).json({ message: "success" });
        })

    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})


//route to update the user profile details
router.post('/api/users/updateprofile', auth, async (req, res) => {
    try {
        const { name, email, username, gender, college_id, designation, bio } = req.body;
        const user = await req.user;
        const college = await Colleges.findOne({ _id: college_id });
        UserDetails.updateOne({ email: user.email }, {
            $set: {
                'bio': bio,
                'name': name,
                'username': username,
                'gender': gender,
                'college_name': college.name,
                'designation': designation,
                'college_id': college_id,
            }

        }).then(val => {
            UserLogin.updateOne({ email: user.email }, {
                $set: {
                    'name': name,
                    'username': username
                }
            }).then(val => {
                res.status(200).json({ message: "success" });
            })

        })
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})


//route to add and update profile image for user
router.post('/api/users/uploadimage', auth, async (req, res) => {
    const user = req.user;
    const fileName = user._id + md5(Date.now())
    const userDetails = await UserDetails.findOne({ user_id: user._id });
    if (userDetails.profile_pic != null) {
        Files.deleteFile(userDetails.profile_pic, (result) => {
            Files.saveFile(req.files.image, userDetails.profile_pic, user._id, "userprofilepic", function (err, result) {
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
    else {
        Files.saveFile(req.files.image, fileName, user._id, "userprofilepic", function (err, result) {
            if (!err) {
                // console.log("aaxd")
                UserDetails.updateOne({ user_id: user._id }, { $set: { 'profile_pic': fileName } }).then((value) => {
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



//view loggedin profile
router.get('/api/users/me', auth, async (req, res) => {
    try {
        const user = req.user;
        // console.log(user.email);
        const userDetails = await UserDetails.findOne({ email: user.email })
        //    console.log(userDetails);
        var list = [userDetails];
        res.status(200).json(list);
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})


//route for logout
router.post('/api/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Log user out of all devices
router.post('/api/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(500).send(error.message)
    }
})



//route to check the details in mobile application whether details are filled
router.post('/api/users/check', auth, async (req, res) => {
    try {
        const userdetails = await UserDetails.findOne({ user_id: req.body.id })
        if (!userdetails) {
            return res.status(404).send("The user id doesn't exists")
        }
        if (userdetails.verified == false) {
            return res.status(401).send("empty");
        }
        else if(userdetails.verified == true){
            return res.status(200).send("empty");  
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem in check');
    }
})

router.post('/api/users/updateCollege', auth, async (req, res) => {
    try {
        const colleges = await Colleges.findOne({ _id: req.body.college })
        const cname = colleges.name
        UserDetails.updateOne({ 'user_id': req.body.id }, { $set: { 'college_id': req.body.college, 'college_name': cname} }).then((val) => {
          
        })
        res.status(200).send("success");

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem');
    }
})

router.post('/api/users/check_fill', auth, async (req, res) => {
    try {
        const colleges = await Colleges.findOne({ _id: req.body.college })
        const cname = colleges.name
        UserDetails.updateOne({ 'userid': req.body.id }, { $set: { 'college_id': req.body.college, 'college_name': cname, 'profile_pic': req.body.image_url, 'bio': req.body.bio, 'designation': req.body.designation } }).then((val) => {
            // console.log(val);
        })

        // console.log("Checked")
        res.status(200).send("success");

    } catch (e) {
        console.log(e)
        res.status(500).send('There was a problem in check');
    }
})

//route to verify otp in mobile application
router.post('/api/users/otpverified', auth, async (req, res) => {
    try {
        const userdetails = await UserDetails.findOne({ otp: req.body.otp })
        if (!userdetails) {
            return res.status(404).send("The otp doesn't exists")
        }
        res.status(200).send("Verified")
        // console.log("Verified")
        UserDetails.updateOne({ otp: req.body.otp }, { $set: { 'otp': '0000' } }).then((val) => {
            console.log(val);
        })
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})

//route for sending the email in mobile application
router.post('/api/users/emailverify', async (req, res) => {
    try {
        const email = req.query.email;
        const otp = await otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false });
        const userdetails = await UserDetails.findOne({ email: email })
        if (!userdetails) {
            return res.status(404).send("The email doesn't exists")
        } else {
            const msg = {
                to: email,
                from: { "email": 'support@ellipseapp.com', 'name': "Ellipse Support" }, // Use the email address or domain you verified above
                templateId: 'd-25c76e60f9f146b78dc11e2ad9bdb62f',
                dynamic_template_data: {
                    OTP: otp
                },
            };
            try {
                await sgMail.send(msg);
                UserDetails.updateOne({ 'email': email }, { $set: { 'otp': otp } }).then((val) => {
                    // console.log(val);
                    res.status(200).json({ otp });
                })

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

//route for otp verification in mobile application
router.post('/api/users/emailverified', auth, async (req, res) => {
    try {
        const user = await req.user;

        UserDetails.updateOne({ otp: req.body.otp }, { $set: { 'verified': true } }).then((val) => {
            console.log(val);
        })
        await UserLogin.updateOne(
            { 'email': user.email },
            {
                $set: {
                    'is_verified': true
                }
            })
        const userdetails = await UserDetails.findOne({ otp: req.body.otp })
        if (!userdetails) {
            return res.status(404).send("The otp doesn't exists")
        }
        res.status(300).send("Verified")
        // console.log("Verified")
        UserDetails.updateOne({ otp: req.body.otp }, { $set: { 'otp': '000000' } }).then((val) => {
            // console.log(val);
        })
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})

//route for forgot password in mobile application
router.post('/api/users/emailverified_forgot_password', async (req, res) => {
    try {
        const otp = req.query.otp;
        const userdetails = await UserDetails.findOne({ otp: otp })
        if (!userdetails) {
            return res.status(404).send("The otp doesn't exists")
        }
        res.status(200).send("Verified")
        // console.log("Verified")
        UserDetails.updateOne({ otp: otp }, { $set: { 'otp': '000000' } }).then((val) => {
            console.log(val);
        })
    }
    catch (error) {
        res.status(400).json(error.message);
    }
})

//route to reset password in mobile application
router.post('/api/users/reset_password', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)
        const user = await UserLogin.findOne({ 'email': email })
        if (!user) {
            return res.status(401).send({ error: 'Reset failed' });
        }
        const hasedPassword = await bcrypt.hash(password, 8)
        UserLogin.updateOne({ 'email': email }, { $set: { 'password': hasedPassword } }).then((val) => {
            res.status(200).json({ message: "success" })
        })

    } catch (error) {
        res.status(500).send(error.message)
    }
})

//route fro all the colleges
router.route('/api/colleges')
    .get(collegeController.index)

module.exports = router
