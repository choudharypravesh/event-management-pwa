'use strict';


var eventsModel = require('./models/events');
var logger = require('./logger');
var eventDetails = {
    eventName: "skippr",
    eventHandle: "skippr",
    eventDetails: "skippr community",
    eventDate: 0,
    userId: "admin",
    eventUsers: ["admin"],
    isPremium: true
}

eventsModel.checkEventTag('skippr', function(err, result) {
    if (err) {
        logger.error(err);
    } else if (result) {
        logger.debug('default event already initialized');
    } else {
        logger.info('default event not found,create One');
        eventsModel.createDefaultEvent(eventDetails, function(err, result) {
            logger.debug(err, result);
        })
    }
});
