'use strict';
var Users = require('../schema').Users;
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    createNewUser: function(userDetails, callback) {
        var user = new Users({
            name: userDetails.name,
            email: userDetails.email,
            googleProfileImg: userDetails.profileImg,
            createDate: new Date(),
            isPremium: (userDetails.isPremium) ? true : false
        });
        user.save(callback);
    },
    fetchAllUsers: function fetchAllUsers(callback) {
        Users.find({}, callback);
    },
    findUser: function findUser(userId, callback) {
        Users.findOne({
            _id: ObjectId(userId)
        }, callback);
    },
    findNonPremium: function findNonPremium(callback) {
        Users.find({
            isPremium: false
        }, {
            _id: 1
        }, callback);
    },
    updatePremium: function updatePremium(userId, callback) {
        Users.update({ _id: ObjectId(userId), isPremium: false }, { isPremium: true }, callback);
    }
};
