const user = require("../model/userModel");
const cart = require("../model/cartModel");
const productCollection = require("../model/productModel");
const categoryCollection = require("../model/categoryModel");
const wishListCollection = require("../model/wishlistModel");
const orderCollection = require("../model/orderModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const category = require("../model/categoryModel");
const { ObjectId } = mongoose.Types;
const uuid = require("uuid");
const walletTransaction = require("../model/walletTransactionModel");

require("dotenv").config();

function cartCout(userId) {
    return new Promise(async (resolve, reject) => {
        let cartData = await cart.findOne({ user: ObjectId(userId) });
        if (cartData) {
            var count = cartData.products.length;
            resolve(count);
        } else {
            var count = 0;
            resolve(count);
        }
    });
}

module.exports = {
    userSignup: (req, res, next) => {
        try {
            let Err = req.session.signupErr;
            let signData = req.session.signupData;
            let user = req.session.user;
            if (user) {
                res.redirect("/");
            } else {
                res.render("user/signup", { Err, signData, login: true });
                req.session.signupErr = null;
                req.session.signupData = null;
            }
        } catch (err) {
            next(err);
        }
    },

    userSignupSubmit: async (req, res, next) => {
        try {
            function generateOTP() {
                return Math.floor(100000 + Math.random() * 900000);
            }

            let userData = req.body;
            let userExist = await user.findOne({ email: userData.email });

            if (userExist) {
                req.session.signupErr = "User Email already exists";
                req.session.signupData = req.body;
                return res.redirect("/signup");
            }

            userData.password = await bcrypt.hash(userData.password, 10);
            let otp = generateOTP();

            let newUser = {
                username: userData.username,
                phone: userData.phone,
                email: userData.email,
                gender: userData.gender,
                password: userData.password,
                status: true,
                verified: false,
                key: otp,
                otpCreatedAt: new Date(),
            };

            let insertedUser = await user.insertOne(newUser);

            req.session.user = req.body;
            req.session.user._id = insertedUser._id;

            let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });

            let mailOptions = {
                from: "coza.store.connect@gmail.com",
                to: newUser.email,
                subject: "Coza Store OTP",
                text: `${otp} is your Coza Store Signup code. Do not share OTP with anyone.`,
            };

            mailTransporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error("OTP Email Error:", err);
                    req.session.signupErr = "Failed to send OTP. Please try again.";
                    return res.redirect("/signup");
                } else {
                    console.log("OTP Sent Successfully");
                    req.session.otp = otp;
                    req.session.otpData = req.body;
                    req.session.otpUser = newUser;
                    return res.redirect("/otp-signup");
                }
            });
        } catch (err) {
            next(err);
        }
    },

    otpSignup: (req, res) => {
        let otp = req.session.otp;
        let data = req.session.otpData;
        let err = req.session.otpErr;
        let invalid = req.session.InvalidOtp;
        res.render("user/otp-verify", { otp, data, err, invalid, login: true });
        req.session.otpErr = null;
    },

    otpSignupPost: async (req, res, next) => {
        try {
            let email = req.session.otpData.email;
            let userExist = await user.findOne({ email: email });

            if (!userExist) {
                req.session.InvalidOtp = "User not found. Please sign up again.";
                return res.redirect("/signup");
            }

            let storedOtp = userExist.key;
            let userOtp = req.body.otp;

            // Check if OTP has expired (e.g., 5 minutes)
            let otpExpiryTime = new Date(userExist.otpCreatedAt.getTime() + 5 * 60000);
            if (new Date() > otpExpiryTime) {
                req.session.InvalidOtp = "OTP has expired. Please request a new one.";
                return res.redirect("/otp-signup");
            }

            if (storedOtp == userOtp) {
                await user.updateOne({ email: userExist.email }, { $set: { verified: true } });
                await user.updateOne({ email: userExist.email }, { $unset: { key: 1 } });

                req.session.user = userExist;
                req.session.user.verified = true;

                // Clear OTP-related session data
                req.session.otp = null;
                req.session.otpData = null;
                req.session.otpUser = null;

                return res.redirect("/");
            } else {
                req.session.InvalidOtp = "Invalid OTP. Please try again.";
                return res.redirect("/otp-signup");
            }
        } catch (err) {
            next(err);
        }
    },

    userLogin: (req, res) => {
        let data = req.session.loginData;
        let Err = req.session.loginErr;

        let userExist = req.session.user;
        if (userExist) {
            res.redirect("/");
        } else {
            res.render("user/login", { Err, data, login: true });
            req.session.loginErr = null;
            req.session.loginData = null;
            req.session.resetPassErr = null;
            req.session.forgotErr = null;
            req.session.forgotSuccess = null;
            req.session.forgotErr = null;
            req.session.forgotOTP = null;
            req.session.otpForEmail = null;
        }
    },

    userLoginPost: async (req, res, next) => {
        try {
            let userData = req.body;
            let userExist = await user.findOne({ email: userData.email });
            let response;
            if (userExist) {
                if (!userExist.verified){
                    response = "Your account is not verified. Try OTP login or Contact us";
                    req.session.loginErr = response;
                    req.session.loginData = req.body;
                    res.redirect("/login");
                }
                else if (userExist.status && userExist.verified) {
                    bcrypt.compare(userData.password, userExist.password).then((status) => {
                        if (status) {
                            req.session.user = userExist;
                            res.redirect("/");
                        } else if (userData.password == "") {
                            response = "Password Field required";
                            req.session.loginErr = response;
                            req.session.loginData = req.body;
                            res.redirect("/login");
                        } else {
                            response = "Invalid Password";
                            req.session.loginErr = response;
                            req.session.loginData = req.body;
                            res.redirect("/login");
                        }
                    });
                } else {
                    response = "Your account is banned by admin. Please connect with our helpline";
                    req.session.loginErr = response;
                    req.session.loginData = req.body;
                    res.redirect("/login");
                }
            } else if (userData.email == "") {
                response = "Email Field required";

                req.session.loginErr = response;
                req.session.loginData = req.body;
                res.redirect("/login");
            } else {
                response = "Invalid Email";

                req.session.loginErr = response;
                req.session.loginData = req.body;
                res.redirect("/login");
            }
        } catch (err) {
            next(err);
        }
    },

    userLogout: (req, res) => {
        req.session.user = null;
        res.redirect("/login");
    },

    otpLogin: (req, res) => {
        let userExist = req.session.user;
        if (userExist) {
            res.redirect("/");
        } else {
            otp = req.session.otp;
            data = req.session.otpData;
            let err = req.session.otpErr;
            let invalid = req.session.InvalidOtp;
            res.render("user/otp-login", { otp, data, err, invalid, login: true });
            req.session.otpErr = null;
        }
    },

    sendOTP: async (req, res, next) => {
        try {
            let data = req.body;
            let response = {};
            let userExist = await user.findOne({ email: data.email });
            if (userExist) {
                if (userExist.status) {
                    otpEmail = userExist.email;
                    response.otp = OTP();

                    let otp = response.otp;
                    let mailTransporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD,
                        },
                    });

                    let details = {
                        from: "coza.store.connect@gmail.com",
                        to: otpEmail,
                        subject: "Coza Store OTP",
                        text: otp + " is your Coza Store verification code. Do not share OTP with anyone ",
                    };

                    mailTransporter.sendMail(details, (err) => {
                        if (err) {
                            console.log("otpp-error" + err);
                        } else {
                            console.log("OTP Sent Successfully ");
                        }
                    });

                    function OTP() {
                        let OTP = Math.random() * 1000000;
                        OTP = Math.floor(OTP);
                        return OTP;
                    }
                    response.user = userExist;
                    response.status = true;

                    req.session.otp = response.otp;
                    req.session.otpData = req.body;
                    req.session.otpUser = response.user;
                    res.redirect("/otp-login");
                } else {
                    response.err = "User Email is Banned. Please Contact us";
                    req.session.otpErr = response.err;
                    req.session.otpData = req.body;
                    res.redirect("/otp-login");
                }
            } else {
                // response.err = "User Email not registered"
                req.session.otpErr = "User Email not registered";
                req.session.otpData = req.body;
                res.redirect("/otp-login");
            }
        } catch (err) {
            next(err);
        }
    },

    otpLoginPost: async (req, res, next) => {
        let otp = req.session.otp;
        let data = req.body;
        let userOtp = data.otp;
        let userData = req.session.otpUser;
        let userExist = await user.findOne({ email: data.email });
        if (otp == userOtp) {
            req.session.user = userData;
            req.session.otp = null;
            await user.updateOne({ email: userExist.email }, { $set: { verified: true } });
            await user.updateOne({ email: userExist.email }, { $unset: { key: 1 } });
            res.redirect("/");
        } else {
            response = "Invalid OTP ";
            req.session.InvalidOtp = response;
            res.redirect("/otp-login");
        }
    },

    homePage: async (req, res, next) => {
        try {
            let userExist = req.session.user;
            let products = await productCollection.find({ status: true }).sort({ _id: -1 }).limit(4).toArray();
            console.log(products);
            let cartCount = 0;
            if (userExist) {
                cartCount = await cartCout(req.session.user._id);
            }
            res.render("user/index", { user: req.session.user, products, cartCount });
        } catch (err) {
            next(err);
        }
    },

    userProfile: async (req, res, next) => {
        try {
            let userId = req.session.user._id;
            let userData = await user.findOne({ _id: ObjectId(userId) });
            let cartCount = 0;
            if (req.session?.user) {
                cartCount = await cartCout(req.session.user._id);
            }
            res.render("user/profile", { user: req.session.user, userData, cartCount });
        } catch (err) {
            next(err);
        }
    },

    updateUserData: async (req, res, next) => {
        try {
            let userData = req.body;
            let userId = req.session.user._id;
            user.updateOne(
                { _id: ObjectId(userId) },
                {
                    $set: {
                        username: userData.username,
                        phone: userData.phone,
                    },
                }
            );
            res.redirect("/profile");
        } catch (err) {
            next(err);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            let upass = req.session.pass;
            let response = req.session.res;
            let Err = req.session.verifyErr;
            let cartCount = 0;
            if (req.session?.user) {
                cartCount = await cartCout(req.session.user._id);
            }
            res.render("user/change-password", { user: req.session.user, upass, response, Err, cartCount });
            req.session.pass = null;
            req.session.res = null;
            req.session.verifyErr = null;
        } catch (err) {
            next(err);
        }
    },

    verifyPassword: async (req, res, next) => {
        try {
            let userId = req.session.user._id;
            let userData = await user.findOne({ _id: ObjectId(userId) });
            let Password = req.body;
            let response = {};
            bcrypt.compare(Password.password, userData.password).then((status) => {
                if (status) {
                    response.status = true;
                    req.session.pass = req.body.password;
                    req.session.res = response.status;
                    res.redirect("/change-password");
                } else if (Password.password == "") {
                    response.error = "Enter Password";
                    req.session.verifyErr = response.error;
                    res.redirect("/change-password");
                } else {
                    response.error = "Wrong Password";
                    req.session.verifyErr = response.error;
                    res.redirect("/change-password");
                }
            });
        } catch (err) {
            next(err);
        }
    },

    changePasswordPost: async (req, res, next) => {
        try {
            let password = req.body.newpass;
            let userId = req.session.user._id;

            let userData = await user.findOne({ _id: ObjectId(userId) });
            currPass = userData.password;
            bcrypt.compare(password, currPass).then(async (status) => {
                if (status) {
                    let Err = "Your new password cannot be the same as current password";
                    req.session.verifyErr = Err;
                    res.redirect("/change-password");
                } else {
                    password = await bcrypt.hash(password, 10);
                    user.updateOne(
                        { _id: ObjectId(userId) },
                        {
                            $set: {
                                password: password,
                            },
                        }
                    ).then(() => {
                        res.redirect("/");
                    });
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getUserAddress: async (req, res, next) => {
        try {
            let userId = req.session.user._id;
            let userData = await user.findOne({ _id: ObjectId(userId) });
            let address = userData.address;
            res.render("user/address", { address, user: req.session.user, address });
        } catch (err) {
            next(err);
        }
    },

    
    addAddress: (req, res) => {
        res.render("user/add-address", { user: req.session.user });
    },

    addUserAddress: async (req, res, next) => {
        try {
            let userId = req.session.user._id;
            let addressData = req.body;
            let count = uuid.v4();
            let address = {
                name: addressData.fname + " " + addressData.lname,
                address: addressData.address,
                town: addressData.town,
                pincode: addressData.pincode,
                state: addressData.state,
                phone: addressData.phone,
                email: addressData.email,
                index: count,
            };
            user.updateOne({ _id: ObjectId(userId) }, { $push: { address: address } });
            res.redirect("/address-manage");
        } catch (err) {
            next(err);
        }
    },

    deleteAddress: (req, res, next) => {
        let userId = req.session.user._id;
        let indexId = req.params.index;
        user.updateOne({ _id: ObjectId(userId) }, { $pull: { address: { index: indexId } } });
        res.redirect("/address-manage");
    },

    selectUserAddress: async (req, res, next) => {
        try {
            let userId = req.session.user._id;
            let userData = await user.findOne({ _id: ObjectId(userId) });
            let address = userData.address;
            res.render("user/select-address", { user: req.session.user, address });
        } catch (err) {
            next(err);
        }
    },

    showSelectedAddress: async (req, res, next) => {
        try {
            let userId = req.session.user._id;
            let id = req.params.id;
            let selAddress = await user
                .aggregate([
                    {
                        $match: { _id: ObjectId(userId) },
                    },
                    {
                        $unwind: "$address",
                    },
                    {
                        $match: { "address.index": id },
                    },
                ])
                .toArray();

            let data = selAddress[0].address;
            let name = selAddress[0].address.name;
            let arr = name.split(" ");

            let address = {
                fname: arr[0],
                lname: arr[1],
                address: data.address,
                town: data.town,
                pincode: data.pincode,
                state: data.state,
                phone: data.phone,
                email: data.email,
            };
            req.session.address = address;
            res.redirect("/place-order");
        } catch (err) {
            next(err);
        }
    },

    editAddress: async (req, res, next) => {
        try {
            let addId = req.params.id;
            let userId = req.session.user._id;
            let address = await user
                .aggregate([
                    {
                        $match: { _id: ObjectId(userId) },
                    },
                    {
                        $unwind: "$address",
                    },
                    {
                        $match: { "address.index": addId },
                    },
                ])
                .toArray();
            let Address = address[0].address;
            let arr = Address.name.split(" ");
            Address.fname = arr[0];
            Address.lname = arr[1];
            res.render("user/edit-address", { Address });
        } catch (err) {
            next(err);
        }
    },

    updateAddress: (req, res) => {
        console.log(req.body);
        let address = req.body;
        let userId = req.session.user._id;
        let index = req.params.id;
        user.updateMany(
            { _id: ObjectId(userId), "address.index": index },
            {
                $set: {
                    "address.$.name": address.fname + " " + address.lname,
                    "address.$.address": address.address,
                    "address.$.town": address.town,
                    "address.$.pincode": address.pincode,
                    "address.$.state": address.state,
                    "address.$.phone": address.phone,
                    "address.$.email": address.email,
                },
            }
        );
        res.redirect("/address-manage");
    },

    forgotPass: (req, res) => {
        let err = req.session.forgotErr;
        let email = req.session.otpForEmail;
        let resetErr = req.session.resetPassErr;
        console.log("sent", req.session.forgotOTP);
        let OTP = req.session.forgotOTP;
        let success = req.session.forgotSuccess;
        res.render("user/forgot-password", { login: true, err, OTP, email, success, resetErr });
        req.session.forgotErr = null;
    },

    forgotVerify: async (req, res, next) => {
        try {
            let email = req.body.email;
            let userExist = await user.findOne({ email: email });
            let response = {};
            if (userExist) {
                if (userExist.status) {
                    otpEmail = userExist.email;
                    req.session.otpForEmail = otpEmail;
                    response.otp = OTP();

                    let otp = response.otp;
                    let mailTransporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD,
                        },
                    });

                    let details = {
                        from: "coza.store.connect@gmail.com",
                        to: otpEmail,
                        subject: "Coza Store",
                        text:
                            otp + " is your Coza Store verification code for reset password. Do not share OTP with anyone ",
                    };

                    mailTransporter.sendMail(details, (err) => {
                        if (err) {
                            console.log("otp-error" + err);
                        } else {
                            console.log("OTP Sent Successfully ");
                        }
                    });

                    function OTP() {
                        let OTP = Math.random() * 1000000;
                        OTP = Math.floor(OTP);
                        return OTP;
                    }
                }
                req.session.forgotOTP = response.otp;
            } else {
                console.log("jhf");
                req.session.forgotErr = "Invalid Email";
            }
            res.redirect("/forgot-password");
        } catch (err) {
            next(err);
        }
    },

    verifyForgotOtp: (req, res, next) => {
        let Otp = req.body.otp;
        let currOTP = req.session.forgotOTP;
        console.log(Otp, currOTP);
        if (Otp == currOTP) {
            req.session.forgotSuccess = true;
        } else {
            req.session.forgotErr = "Invalid Otp";
        }
        res.redirect("/forgot-password");
    },

    resetPassword: async (req, res, next) => {
        try {
            let email = req.session.otpForEmail;
            let password = req.body.password;
            let passwordRegx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$/gm;

            if (passwordRegx.test(password) == false) {
                req.session.resetPassErr = "Password should contain Atleast one uppercase, one lowercase and one number";
                res.redirect("/forgot-password");
            } else {
                password = await bcrypt.hash(password, 10);
                user.updateOne(
                    { email: email },
                    {
                        $set: {
                            password: password,
                        },
                    }
                );
                res.redirect("/login");
            }
        } catch (err) {
            console.log(err);
        }
    },

    aboutUs: async (req, res) => {
        try {
            let cartCount = 0;
            let userExist = req.session.user;
            if (userExist) {
                cartCount = await cartCout(req.session.user._id);

                let userId = req.session.user._id;
                let wallets = await walletTransaction.find({ userId: ObjectId(userId) });

                console.log(wallets);
                res.render("user/about", { user: req.session.user, cartCount });
            } else res.render("user/about");
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },

    contact: async (req, res) => {
        try {
            let cartCount = 0;
            let userExist = req.session.user;
            if (userExist) {
                cartCount = await cartCout(req.session.user._id);

                let userId = req.session.user._id;
                let wallets = await walletTransaction.find({ userId: ObjectId(userId) });

                console.log(wallets);
                res.render("user/contact", { user: req.session.user, cartCount });
            } else res.render("user/contact");
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },

    contactPost: (req, res, next) => {
        try {
            let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });

            let details = {
                from: "coza.store.connect@gmail.com",
                to: "coza.store.connect@gmail.com",
                subject: req.body.sub,
                html: `<p>Email : ${req.body.email} </p> <p>Phone : ${req.body.phone}</p> <p> Message : ${req.body.msg}</p>`,
            };

            mailTransporter.sendMail(details, (err) => {
                if (err) {
                    console.log("" + err);
                } else {
                    console.log("mail Sent Successfully ");
                }
            });
            res.redirect("/contact");
        } catch (err) {
            next(err);
        }
    },

    printInvoice: async (req, res) => {
        console.log("Invoice");
        let orderId = req.params.id;
        let order = await orderCollection.findOne({ _id: ObjectId(orderId) });
        console.log(order);
        res.render("user/invoice", { login: true, order });
    },

    wallet: async (req, res) => {
        try {
            let cartCount = 0;
            let userExist = req.session.user;
            if (userExist) {
                cartCount = await cartCout(req.session.user._id);
            }
            let userId = req.session.user._id;
            let wallets = await walletTransaction.find({ userId: ObjectId(userId) });
            console.log(wallets);
            res.render("user/wallet", { user: req.session.user, wallets, cartCount });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
};
