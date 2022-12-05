'use strict';
var userModel = require('./models/users');
var eventsModel = require('./models/events');
var logger = require('./logger');
module.exports = function(callback) {
    var currDate = new Date().getTime();

    eventsModel.disableExpiredEvents(currDate, function(err, results) {
        logger.info('execution Complete', err, results.nModified);
        callback();
    });
};
