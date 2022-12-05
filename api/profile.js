'use strict';
let userModel = require('../models/users');
let profileModel = require('../models/profile');
let eventsModel = require('../models/events');
let path = require('path')
let fs = require('fs');
let multer = require('multer');
let logger = require('../logger');
// let camelCase = require("../utils/camelcase")

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(process.env.constPath + "uploads/");
        cb(null, process.env.constPath + "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + '.jpg')
    }
});
let upload = multer({storage: storage});

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};


module.exports = {
    getAllProfiles: function (req, res, next) {
        if (req.user) {
            let userId = req.user._id.toString();
            profileModel.fetchUserProfiles(userId, function (err, result) {
                if (err) {
                    logger.error(err);
                    next(err);
                } else {
                    if (result) {
                        let responseData = result.map(function functionName(value) {
                            value.profileId = value._id;
                            delete value._id;
                            return value;
                        });
                        // logger.debug('out', responseData[0].profileId);
                        res.send({
                            status: true,
                            message: 'all user profiles',
                            data: responseData
                        });
                    } else {
                        res.send({
                            status: true,
                            message: 'all user profiles',
                            data: []
                        });
                    }
                }
            });
        } else {
            res.status(401).send({status: false, message: 'unauthorised request', data: {}});
        }
    },
    getEventProfiles: function (req, res, next) {
        let eventId = req.query.eventId;
        if (eventId) {
            let userId = (req.user) ? req.user._id.toString() : null;
            profileModel.fetchEventProfiles(eventId, userId, function (err, results) {
                if (err) {
                    logger.error('getEventProfiles', err);
                    next(err);
                } else {
                    res.send({status: true, message: 'event users found', data: results});
                }
            });
        } else {
            next('event id missing');
        }

    },
    createProfile: function (req, res, next) {
        let reqBody = JSON.parse(req.body.data);

        if (req.user) {
            let userId = req.user._id.toString();
            let profileDetails = {
                profileUserName: reqBody.profileUserName.toProperCase(),
                profileTag: reqBody.profileTag,
                profileImg: reqBody.profileImg,
                profileContact: reqBody.profileContact,
                profileDescription: reqBody.profileDescription,
                userId: userId,
                createDate: new Date().getTime(),
                profileEventIds: (reqBody.eventId) ? [reqBody.eventId] : []
            };
            console.log(profileDetails);
            console.log(profileDetails.profileUserName);
            userModel.findUser(userId, function (err, data) {
                if (err) {
                    logger.error(err);
                    next(err);
                } else {
                    if (data) {
                        profileModel.createProfile(profileDetails, function (err, profileData) {
                            if (err) {
                                logger.error(err);
                            } else {
                                res.send({status: true, message: 'event created Successful', data: profileData});
                            }
                        });
                    }
                }
            });
        } else {
            res.status(401).send({status: false, message: 'unauthorised request', data: {}});
        }

    },
    updateProfile: function (req, res, next) {
        let reqBody = JSON.parse(req.body.data);
        let profileId = reqBody.profileId;
        if (req.user) {
            let profileDetails = {};
            if (reqBody.profileUserName) {
                profileDetails.profileUserName = reqBody.profileUserName.toProperCase();
            }
            if (reqBody.profileTag) {
                profileDetails.profileTag = reqBody.profileTag;
            }
            if (reqBody.profileImg) {
                profileDetails.profileImg = reqBody.profileImg;
            }
            if (reqBody.profileDescription) {
                profileDetails.profileDescription = reqBody.profileDescription;
            }
            if (reqBody.profileContact) {
                profileDetails.profileContact = reqBody.profileContact;
            }
            profileModel.updateProfile(profileId, profileDetails, function (err, profile) {
                if (err) {
                    logger.error('update profile ', err);
                    next(err);
                } else {
                    res.send({status: true, message: 'updated', data: profile});
                }
            });
        } else {
            res.status(401).send({status: false, message: 'unauthorised request', data: {}});
        }
    },
    attachProfileEvent: function (req, res, next) {
        let reqBody = JSON.parse(req.body.data);
        let profileId = reqBody.profileId;
        let eventId = reqBody.eventId;
        if (!profileId || !eventId) {
            return next('parameter missing');
        }
        if (req.user) {
            let userId = req.user._id.toString();
            logger.debug('join event request', profileId, eventId);
            eventsModel.findSubEvent(eventId, function (err, result) {
                if (err) {
                    logger.error(err);
                    next(err);
                } else {
                    logger.debug('results', result);
                    if (result) {
                        profileModel.checkUserEvents(userId, eventId, function (err, result) {
                            if (err) {
                                logger.error(err);
                                next(err);
                            } else if (!result) {
                                profileModel.addProfileEvent(profileId, eventId, function (err, result) {
                                    if (err) {
                                        logger.error(err);
                                        next(err);
                                    } else {
                                        logger.debug('result', result);
                                        res.status(200).send({
                                            status: (result !== null) ? true : false,
                                            message: (result !== null) ? 'profile attached' : 'profile not attached'
                                        });
                                    }
                                });
                            } else {
                                res.send({
                                    status: false,
                                    message: 'user already has profile attached'
                                });
                            }
                        });

                    } else {
                        res.status(200).send({status: false, message: 'invalid event'});
                    }
                }
            });
        } else {
            res.status(401).send({status: false, message: 'unauthorised request', data: {}});
        }

    },
    leaveProfileEvents: function leaveProfileEvents(req, res, next) {
        let reqBody = JSON.parse(req.body.data);
        if (req.user) {
            let eventId = reqBody.eventId;
            let profileId = reqBody.profileId;
            logger.debug(reqBody);
            profileModel.leaveProfileEvent(profileId, eventId, function (err, data) {
                if (err) {
                    logger.error(err);
                    next(err);
                } else {
                    logger.debug(data);
                    res.send({
                        status: (data !== null) ? true : false,
                        message: (data) ? 'event leave successfully' : 'event leave unsuccessfully'
                    });
                }
            });
        } else {
            res.status(401).send({status: false, message: 'unauthorised request', data: {}});
        }
    },
    uploadPic: function (req, res, next) {
        console.log("coming here");
        if (req.user) {

            let profileId = req.headers["profileid"];

            if (!req.file)
                return next(new Error('Select a file!'))
            let file = req.file;

            let profileURL = "https://skippr.co/uploads/" + profileId + "_" + req.headers['datetime'] + "." + req.file.mimetype.split("/")[1]
            let profileDetails = {
                profileImg: profileURL
            };
            profileModel.updateProfile(profileId, profileDetails, function (err, profile) {
                if (err) {
                    console.log('update profile  err', err)
                    logger.error('update profile ', err);
                    next(err);
                } else {
                    console.log('update profile sucess ', profile)
                    logger.info('update profile ', profile);
                    res.send({
                        status: true,
                        message: 'profile pic uploaded successfully',
                        data: profileURL
                    });
                }
            });
        } else {
            console.log('REQ.USER NOT DEFINED')
        }

    }
};
