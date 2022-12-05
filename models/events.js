'use strict';
var Events = require('../schema').Events;
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = {
    createEvent: function createEvent(eventDetails, callback) {
        eventDetails.createDate = new Date();
        eventDetails.expireDate = eventDetails.createDate.getTime() + (24 * 60 * 60 * 1000);
        eventDetails.active = true;
        eventDetails.subEvent = [{
            subEventId: new ObjectId(),
            subEventName: eventDetails.eventName,
            subEventTimestamp: 0,
            isDefault: true
        }];
        var event = new Events(eventDetails);
        event.save(callback);
    },
    createDefaultEvent: function createEvent(eventDetails, callback) {
        eventDetails.createDate = new Date();
        eventDetails.expireDate = eventDetails.createDate.getTime() + (24 * 60 * 60 * 1000);
        eventDetails.active = true;
        eventDetails.subEvent = [{
            subEventId: new ObjectId(),
            subEventName: "Community",
            subEventTimestamp: 0,
            isDefault: true
        }];
        var event = new Events(eventDetails);
        event.save(callback);
    },
    updateEvent: function updateEvent(eventId, eventDetails, callback) {
        Events.update({
            _id: ObjectId(eventId)
        }, eventDetails, callback);
    },
    joinEvent: function joinEvent(eventId, userId, callback) {
        Events.findOneAndUpdate({
            "_id": ObjectId(eventId),
            eventUsers: {
                "$ne": userId,
                "active": true
            }
        }, {
            '$push': {
                'eventUsers': userId
            }
        }, callback);
    },
    getAllEvents: function getAllEvents(callback) {
        Events.find({}, {
            _id: 1,
            eventName: 1,
            eventDate: 1
        }, callback);
    },
    fetchEventDetails: function fetchEventDetails(eventId, callback) {
        Events.findOne({
            _id: ObjectId(eventId)
        }, {
            _id: 0,
            __v: 0
        }).lean().exec(callback);
    },
    fetchEventByHandle: function fetchEventByHandle(eventHandle, callback) {
        Events.findOne({
            eventHandle: eventHandle,
	    active:true
        }, {
            __v: 0
        }).lean().exec(callback);
    },
    disableExpiredEvents: function disableExpiredEvents(expireTime, callback) {
        Events.update({
            "isPremium": false,
            "active": true,
            "expireDate": {
                '$lte': expireTime
            }
        }, {
            active: false
        }, callback);
    },
    findEvent: function findEvents(eventId, callback) {
        Events.findOne({
            _id: ObjectId(eventId)
        }, callback);
    },
    findSubEvent: function findEvents(subEventId, callback) {
        Events.findOne({
            'subEvent.subEventId': ObjectId(subEventId)
        }, callback);
    },
    addSubEvent: function addSubEvent(eventId, subEventName, subEventTimestamp, callback) {

        Events.findOneAndUpdate({
            "_id": ObjectId(eventId),
        }, {
            'isPremium': true,
            '$push': {
                'subEvent': {
                    subEventId: new ObjectId(),
                    subEventName: subEventName,
                    subEventTimestamp: subEventTimestamp,
                    isDefault: false
                }
            }
        }, callback);
    },
    makePremiumEvent: function addSubEvent(eventId, subEventName, subEventTimestamp, callback) {
        Events.findOneAndUpdate({
            "_id": ObjectId(eventId),
            "$where": "this.subEvent.length === 0"
        }, {
            'isPremium': true,
            '$push': {
                'subEvent': {
                    '$each': [{
                        subEventId: new ObjectId(),
                        subEventName: 'Community',
                        subEventTimestamp: 0,
                        isDefault: true
                    }, {
                        subEventId: new ObjectId(),
                        subEventName: subEventName,
                        subEventTimestamp: subEventTimestamp,
                        isDefault: false
                    }]
                }
            }
        }, callback);
    },
    checkEventTag: function checkEventTag(tag, callback) {
        Events.findOne({ eventHandle: tag }, callback);
    }
};
