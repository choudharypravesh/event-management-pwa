'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = new Schema({
    gToken: String,
    userId: String,
    active: Boolean
});