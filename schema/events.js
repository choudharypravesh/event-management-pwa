'use strict';
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var Schema = mongoose.Schema;
module.exports = new Schema({
    eventName: String,
    eventDetails: String,
    eventHandle: String,
    eventDate: Number,
    eventUsers: Array,
    userId: String,
    createDate: Date,
    active: Boolean,
    expireDate: Number,
    isPremium: Boolean,
    subEvent: []
});
