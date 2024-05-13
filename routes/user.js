const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

// Sign up API
router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                query = "insert into user(name,contact,email,password,status,role) values (?,?,?,?,'false','user')";
                connection.query(query, [user.name, user.contact, user.email, user.password, user.status, user.role], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully Register!" });
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({ message: "Email already Exist." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

// Login API
router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0 || result[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect Username or Password." });
            }
            else if (result[0].status == "false") {
                return res.status(401).json({ message: "Wait for Amdin Approval!" });
            } else if (result[0].password == user.password) {
                const response = { email: result[0].email, role: result[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                res.status(200).json({ token: accessToken })
            } else {
                return res.status(400).json({ message: "Something wnet wrong. Try again later," });
            }
        } else {
            return res.status(500).json(err);
        }
    })
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

// befor login Forgot password API
router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select email,password from user where email=?";
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                return res.status(200).json({ message: "Password sent Successfully to your email." });
            } else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: result[0].email,
                    subject: 'Password by Cafe Management System',
                    html: "<p><br>Your Login details for Cafe Management System</br><br><b>Email: </b>" + result.email + "<br><b>Password: </b>" + result[0].password + "<br><a href='http://localhost:4200/'>Click here to login</a></p>"
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                });
                return res.status(200).json({ message: "Password sent Successfully to your email." });

            }
        } else {
            return res.status(500).json(err);
        }
    })
})

// Get all data API
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    query = "select id,name,email,contact,status from user where role='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

// Update API
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                console.log(results.affectedRows);
                return res.status(404).json({ message: "Us er does not exist." });
            }
            return res.status(200).json({ message: "User Update Successfully." });
        } else {
            // console.log("500");
            return res.status(500).json(err);
        }
    })
})

// To check the Login Token API
router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "ture" });
})

// After login to Change Password API

router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select *from user where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        // console.log("Local Email: "+email);
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect old Password." });
            }
            else if (results[0].password == user.oldPassword) {
                query = "update user set password=? where email=?";
                // console.log("Old password: "+user.oldPassword)
                connection.query(query, [user.newPassword, email], (err, results) => {
                    // console.log("New Password"+user.newPassword);
                    if (!err) {
                        return res.status(200).json({ message: "Password Updated Successfully." });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({ message: "Something went wrong!. Please try again later." });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;