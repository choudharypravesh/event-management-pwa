'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = new Schema({
    profileUserName: String,
    profileTag: String,
    profileImg: String,
    profileDescription: String,
    profileContact: String,
    profileEventIds: Array,
    userId: String,
    createDate: Date
});
