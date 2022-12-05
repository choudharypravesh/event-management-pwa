'use strict';
var eventsModel = require('../models/events');
var usersModel = require('../models/users');
var logger = require('../logger');
var eventTag = require('../eventTag');
var mailer = require('../mailer');

function getEventTag(callback) {
    var tag = eventTag.encode(new Date().getTime())
    eventsModel.checkEventTag(tag, function(err, data) {
        if (!data) {
            callback(tag);
        } else {
            getEventTag(callback);
        }
    });
}

module.exports = {
    getAllEvents: function getAllEvents(req, res, next) {
        logger.info(req.user);
        eventsModel.getAllEvents(function(err, results) {
            if (err) {
                logger.error(err);
                res.status(500).send({});
            } else {
                var eventList = [];
                results.forEach(function(data) {
                    eventList.push({
                        eventId: data._id.toString(),
                        eventName: data.eventName,
                        eventDate: data.eventDate
                    });
                });
                res.status(200).send({
                    status: true,
                    message: 'all events data',
                    data: eventList
                });
            }
        });

    },
    createEvent: function createEvent(req, res, next) {
        var reqBody = JSON.parse(req.body.data);
        var eventHandle = null;
        getEventTag(function(handle) {
            eventHandle = handle;
            if (req.user) {
                var userId = req.user._id.toString(); //"585ba922f47c297a24ba78c8"
                var eventDetails = {
                    eventName: reqBody.eventName,
                    eventHandle: eventHandle,
                    eventDetails: reqBody.eventDetails,
                    eventDate: reqBody.eventDate,
                    userId: userId,
                    eventUsers: [userId],
                    isPremium: false
                };
                logger.debug('create event request', eventDetails);
                usersModel.findUser(userId, function(err, result) {
                    if (err) {
                        logger.error(err);
                    } else {
                        if (result) {
                            eventsModel.createEvent(eventDetails, function(err) {
                                if (err) {
                                    logger.error(err);
                                    res.status(500).send({});
                                } else {
                                    mailer({
                                        type: 'user',
                                        email: req.user.email,
                                        title: eventDetails.eventName,
                                        handle: eventDetails.eventHandle
                                    }, function() {
                                        // body...
                                    });
                                    res.status(200).send({
                                        status: true,
                                        message: 'event created',
                                        data: {
                                            eventName: eventDetails.eventName,
                                            eventHandle: eventDetails.eventHandle,
                                            eventDetails: reqBody.eventDetails,
                                            isPremium: false,
                                            liveEvents: eventDetails.subEvent,
                                            eventDate: reqBody.eventDate
                                        }
                                    });
                                }
                            });
                        } else {
                            logger.debug('invalid user id', userId);
                            res.status(200).send({
                                status: false,
                                message: 'event not created'
                            });
                        }
                    }
                });
            } else {
                res.status(401).send({ status: false, message: 'unauthorised request', data: {} });
            }
        });
    },
    fetchEventDetails: function fetchEventDetails(req, res, next) {
        let eventId = req.query.eventId;
        logger.debug('fetch event details', eventId);
        eventsModel.fetchEventDetails(eventId, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500).send({});
            } else {
                result.eventId = eventId;
                res.status(200).send({
                    status: true,
                    message: 'event details',
                    data: result
                });
            }
        });
    },
    searchHandle: function searchHandle(req, res, next) {
        let eventHandle = req.query.eventHandle;
        logger.debug('fetch event Handle details', eventHandle);
        eventsModel.fetchEventByHandle(eventHandle, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500).send({});
            } else {
                if (result) {
                    result.liveEvents = [];
                    result.futureEvents = [];
                    result.doneEvents = [];
                    // result.eventId = result._id;
                    // delete result._id;
                    // logger.debug('result type', typeof result, result);
                    result.subEvent.forEach(function(subEvent) {
                        let now = new Date();
                        let todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                        let tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
                        if ((result.eventTimestamp >= todayStart && tomorrowStart < tomorrowStart) || subEvent.isDefault === true) {
                            result.liveEvents.push(subEvent);
                        } else if (result.eventTimestamp >= tomorrowStart) {
                            result.futureEvents.push(subEvent);
                        } else if (result.eventTimestamp < todayStart) {
                            result.doneEvents.push(subEvent);
                        } else {
                            result.doneEvents.push(subEvent);
                        }
                        // logger.debug(result.liveEvents, result.doneEvents, result.futureEvents);
                    });
                    delete result.subEvent;
                    res.status(200).send({
                        status: true,
                        message: 'event handle details',
                        data: result
                    });
                } else {
                    res.send({
                        status: false,
                        message: 'event not found',
                        data: {}
                    });
                }
            }
        });

    },
    searchHandleAMP: function searchHandle(req, res, next) {
        let eventHandle = req.query.eventHandle;
        logger.debug('fetch event Handle details', eventHandle);
        eventsModel.fetchEventByHandle(eventHandle, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500).send({});
            } else {
                if (result) {
                    result.liveEvents = [];
                    result.futureEvents = [];
                    result.doneEvents = [];
                    // result.eventId = result._id;
                    // delete result._id;
                    // logger.debug('result type', typeof result, result);
                    result.subEvent.forEach(function(subEvent) {
                        let now = new Date();
                        let todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                        let tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
                        if ((result.eventTimestamp >= todayStart && tomorrowStart < tomorrowStart) || subEvent.isDefault === true) {
                            result.liveEvents.push(subEvent);
                        } else if (result.eventTimestamp >= tomorrowStart) {
                            result.futureEvents.push(subEvent);
                        } else if (result.eventTimestamp < todayStart) {
                            result.doneEvents.push(subEvent);
                        } else {
                            result.doneEvents.push(subEvent);
                        }

                        // logger.debug(result.liveEvents, result.doneEvents, result.futureEvents);
                    });
                    delete result.subEvent;
                    res.cookie('eventDetails', JSON.parse(JSON.stringify(result)), {maxAge: 32503656600000, httpOnly: false});
                    if (!req.user) {
                        res.redirect("/s/sign-in");
                    } else {
                        if (!result.isPremium) {
                           res.redirect("/s/create-profile");
                        } else {
                            res.redirect("/s/select-event");
                        }
                    }
                } else {
                    res.send({
                        status: false,
                        message: 'event not found',
                        data: {}
                    });
                }
            }
        });

    },
    updateEvent: function updateEvent(req, res, next) {
        let reqBody = JSON.parse(req.body);
        let eventId = reqBody.eventId;
        if (req.user) {
            var eventDetails = {
                eventName: reqBody.eventName,
                eventDate: reqBody.eventDate
            };
            logger.debug('update event', eventDetails);
            eventsModel.updateEvent(eventId, eventDetails, function(err, rowsAffected) {
                if (err) {
                    logger.error(err);
                    res.status(500).send();
                    res.status(401).send({ status: false, message: 'unauthorised request', data: {} });
                } else {

                    res.status(200).send({
                        status: (rowsAffected.nModified === 1) ? true : false,
                        message: (rowsAffected.nModified === 1) ? "event updated" : "event not updated"
                    });
                }
            });
        } else {
            res.status(401).send({ status: false, message: 'unauthorised request', data: {} });
        }


    },
    joinEvent: function joinEvent(req, res, next) {
        let reqBody = JSON.parse(req.body.event);
        let eventId = reqBody.eventId;

        /*let userId = reqBody.userId;
         console.log('join event request', reqBody, eventId, userId)*/
        if (req.user) {
            let userId = req.user._id.toString();

            logger.debug('join event request', eventId, userId);
            usersModel.findUser(userId, function(err, result) {
                if (err) {
                    console.log("error")
                    logger.error(err);
                } else {
                    console.log("not error")
                    logger.debug(result);
                    if (result) {
                        eventsModel.joinEvent(eventId, userId, function(err, result) {
                            if (err) {
                                logger.error(err);
                            } else {
                                logger.debug('result', result);
                                res.status(200).send({
                                    status: (result !== null) ? true : false,
                                    message: (result !== null) ? 'event joined' : 'event not joined',
                                });
                            }
                        });
                    } else {
                        res.status(200).send({
                            status: false,
                            message: 'invalid User',
                        });
                    }
                }
            });
        } else {
            res.status(401).send({ status: false, message: 'unauthorised request', data: {} });
        }

    },
    addSubEvent: function(req, res, next) {
        let reqBody = JSON.parse(req.body.data);
        let subEventName = reqBody.subEventName;
        let subEventId = reqBody.eventId;
        let subEventTimestamp = reqBody.eventTimestamp;
        // logger.debug(reqBody);
        if (req.user) {
            eventsModel.makePremiumEvent(subEventId, subEventName, subEventTimestamp, function(err, data) {
                if (err) {
                    logger.error(err);
                    next(err);
                } else {
                    logger.debug('got sub data', data);
                    if (data) {
                        logger.info('default');
                        res.send({
                            status: (data) ? true : false,
                            message: (data) ? 'sub event added' : 'sub event not added'
                        });
                    } else {
                        logger.info('fallback');
                        eventsModel.addSubEvent(subEventId, subEventName, subEventTimestamp, function(err, data) {
                            if (err) {
                                logger.error(err);
                                next(err);
                            } else {
                                res.send({
                                    status: (data) ? true : false,
                                    message: (data) ? 'sub event added' : 'sub event not added'
                                });
                            }
                        });
                    }
                }
            });
        } else {
            res.status(401).send({ status: false, message: 'unauthorised request', data: {} });
        }
    }
};
