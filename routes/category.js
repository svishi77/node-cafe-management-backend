const express = require('express');
const connection = require('../connection');
const router = express.Router();
const auth = require("../services/authentication");
const checkRole = require("../services/checkRole");

// Add Category API 
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let category = req.body;
    query = "insert into category (name) values(?)";
    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Category Added Successfully" })
        } else {
            return res.status(500).json(err);
        }
    })
});

// Get API for Category
router.get('/get', auth.authenticateToken, (req, res) => {
    var query = "select *from category order by name";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
});

// Udpate Category API
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query, [product.name, product.id], (err, results) => {
        if (!err) {
            if (results.effectedRows == 0) {
                return res.status(400).json({ message: "Category id does't exist" });
            }
            return res.status(200).json({ message: "Category Updated Successfully" })
        } else {
            return res.status(500).json(err);
        }
    })
});

module.exports = router;
