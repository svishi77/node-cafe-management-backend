const express = require('express');
const connection = require('../connection');
const router = express.Router();
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res) => {
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);

    var query = "insert into bill (name,uuid,email,contact,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?)";
    connection.query(query, [orderDetails.name, generateUuid, orderDetails.email, orderDetails.contact, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, results) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
                productDetails: productDetailsReport,
                name: orderDetails.name,
                email: orderDetails.email,
                contact: orderDetails.contact,
                paymentMethod: orderDetails.paymentMethod,
                totalAmount: orderDetails.totalAmount,
            }, (err, results) => {
                // console.log("Error"+err)
                // console.log("Results"+results)
                if (err) {
                    console.log("Testing:")
                    return res.status(500).json(err);
                } else {
                    pdf.create(results).toFile('./generated_pdf/' + generateUuid + ".pdf", function (err, data) {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({ uuid: generateUuid });
                        }
                    });
                }
            })
        } else {
            return res.status(500).json(err);
        }
    });
});

router.post('/getPdf', auth.authenticateToken, function (req, res) {
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/' + orderDetails.uuid + '.pdf';
    if (fs.existsSync(pdfPath)) {
        res.contentType('application/pdf');
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contact: orderDetails.contact,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount,
        }, (err, results) => {
            if (err) {
                console.log("Testing:")
                return res.status(500).json(err);
            } else {
                pdf.create(results).toFile('./generated_pdf/' + orderDetails.uuid + ".pdf", function (err, data) {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        res.contentType('application/pdf');
                        fs.createReadStream(pdfPath).pip(res);
                    }
                });
            }
        })
    }
});

router.get('/getBills', auth.authenticateToken, (req, res) => {
    var query = "select *from bill order by id DESC";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
});

router.delete('/delete/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    var query = "delete from bill where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(400).json({ message: "Bill id does not exists!" });
            }
            return res.status(200).json({ message: "Bill deleted successfully" });
        } else {
            return res.status(500).json(err);
        }
    })
});

module.exports = router;