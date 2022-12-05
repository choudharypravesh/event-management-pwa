'use strict';
var ObjectId = require('mongoose').Types.ObjectId;

var Profiles = require('../schema').Profiles;

module.exports = {
    createProfile: function createProfile(profileDetails, callback) {
        var profile = new Profiles(profileDetails);
        profile.save(callback);
    },
    checkUserEvents: function function_name(userId, eventId, callback) {
        Profiles.findOne({
            'userId': userId,
            'profileEventIds': eventId
        }, callback);
    },
    addProfileEvent: function addProfileEvent(profileId, eventId, callback) {
        Profiles.findOneAndUpdate({
            "_id": ObjectId(profileId),
            'profileEventIds': {
                "$ne": eventId
            }
        }, {
            '$push': {
                'profileEventIds': eventId
            }
        }, callback);
    },
    leaveProfileEvent: function (profileId, eventId, callback) {
        Profiles.findOneAndUpdate({
            "_id": ObjectId(profileId),
            'profileEventIds': {
                "$eq": eventId
            }
        }, {
            '$pull': {
                'profileEventIds': eventId
            }
        }, callback);
    },
    updateProfile: function updateProfile(profileId, profileDetails, callback) {
        Profiles.update({
            _id: ObjectId(profileId)
        }, profileDetails, callback);
    },
    fetchProfile: function fetchProfile(profileId, callback) {
        Profiles.findOne({
            _id: ObjectId(profileId)
        }, callback);
    },
    fetchUserProfiles: function fetchUsersProfiles(userId, callback) {
        Profiles.find({
            userId: userId
        }, {
            profileEventIds: 0,
            __v: 0,
            userId: 0,
            createDate: 0
        }, {
            sort: {
                _id: -1
            }
        }).lean().exec(callback);
    },
    fetchEventProfiles: function fetchEventProfiles(eventId, userId, callback) {
        let query = {
            profileEventIds: eventId,
        };
        if (userId) {
            query.userId = {'$ne': userId};
        }
        Profiles.find(query, {
            profileEventIds: 0,
            __v: 0,
            userId: 0,
            createDate: 0
        }).lean().exec(callback);
    }
};
