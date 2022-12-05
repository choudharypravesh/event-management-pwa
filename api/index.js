'use strict';
var express = require('express');
var router = express.Router();
var users = require('./users');
var profile = require('./profile');
var events = require('./events');
var multer = require('multer');
var path = require('path')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.constPath + "/uploads/");
    },
    filename: function (req, file, cb) {
        console.log(req.headers)
        let fileName = req.headers['profileid'] + "_" + req.headers['datetime'] + "." + file.mimetype.split("/")[1]
        console.log("FILE_NAME", fileName)
        cb(null, fileName)
    }
});
var upload = multer({storage: storage});

//Users
router.post('/users/getUserDetails', users.getUserDetails);
router.get('/signout', users.signout);
router.post('/users/assignPremium', users.assignPremium);
//events
router.get('/events/getAllEvents', events.getAllEvents);
router.post('/events/createEvent', events.createEvent);
router.get('/events/fetchEventDetails', events.fetchEventDetails);
router.post('/events/joinEvent', events.joinEvent);
router.post('/events/updateEvent', events.updateEvent);
router.post('/events/addSubEvent', events.addSubEvent);
router.get('/events/searchHandle', events.searchHandle);


//profiles
router.get('/profiles/getAllProfiles', profile.getAllProfiles);
router.get('/profiles/getEventProfiles', profile.getEventProfiles);
router.post('/profiles/leaveProfileEvents', profile.leaveProfileEvents);
router.post('/profiles/createProfile', profile.createProfile);
router.post('/profiles/updateProfile', profile.updateProfile);
router.post('/profiles/attachProfileEvent', profile.attachProfileEvent);
router.post('/profiles/uploadPic', upload.single('file'), profile.uploadPic);
module.exports = router;
