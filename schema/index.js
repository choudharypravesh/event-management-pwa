'use strict';
var mongoose = require('mongoose');
var Events = require('./events');
var Profiles = require('./profile');
var Sessions = require('./sessions');
var Users = require('./users');
var logger = require('../logger');
var config = require('config');
var dbConfig = config.get('dbConfig');
var db = mongoose.createConnection('mongodb://' + dbConfig.url + ":" + dbConfig.port + '/' + dbConfig.database)
    ;
db.on('connected', function () {
    logger.info('mongo connected successfully');
});

module.exports = {
    Users: db.model('users', Users),
    Events: db.model('events', Events),
    Profiles: db.model('profiles', Profiles),
    Sessions: db.model('sessions', Sessions)
};
