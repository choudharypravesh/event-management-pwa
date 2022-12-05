'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = new Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    googleProfileImg: String,
    createDate: Date,
    googleId: String
});
