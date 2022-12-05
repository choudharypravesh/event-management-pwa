'use strict';
var userModel = require('../models/users');
var logger = require('../logger');
var mailer = require('../mailer');
module.exports = {

    getUserDetails: function(req, res, next) {
        var userDetails = req.user;
        res.send({
            status: (userDetails) ? true : false,
            'message': 'user details found',
            data: (userDetails) ? userDetails : {}
        });
        // var userDetails = req.body;
        //
        // userModel.createNewUser(userDetails, function(err, result) {
        //     if (err) {
        //         logger.error(err);
        //         res.status(500).send();
        //     } else {
        //         res.status(200).send({
        //             status: true,
        //             message: 'user created successfully',
        //             data: {
        //                 userId: result._id.toString(),
        //                 userName: result.name
        //             }
        //         });
        //    cc }
        // });
    },
    assignPremium: function(req, res, next) {
        var postData = req.body;
        var isPremium = postData.isPremium;
        console.log(req.user);
        if (true) {
            // var userId = req.user._id.ToString(); //'586a86176a139779107cfcdd'
            // userModel.updatePremium(userId, function(err, data) {
            //     if (err) {
            //         logger.error('assignPremium', err);
            //     } else {
            //         res.send({
            //             status: (data) ? true : false,
            //             message: (data) ? 'premium account assigned' : 'premium account not assigned',
            //             data: {}
            //         });
            //     }
            // });
            var toMail = 'soumitra@skippr.co';
            mailer({
                type: 'premiumUser',
                to: toMail,
                subject: 'Premium inquiry email: ' + new Date().toLocaleString('en-GB'),
                email: req.user.email,
                title: '',
                handle: ''
            }, function(err, response) {
                logger.debug(err, response);
                console.log("yo coming here ", err, response);
                res.send({ status: true, message: 'admin notified' })
            });
        } else {
            console.log("coming into 401 response");
            res.status(401).send({ status: false, message: 'unauthorised request', data: {} });
        }
    },
    signout: function(req, res, next) {
        req.logout();
        res.send({
            status: true,
            message: 'user signed out successfully'
        });

    }
};
