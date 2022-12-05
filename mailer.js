'use strict';
let nodemailer = require('nodemailer');
let fs = require('fs');
let logger = require('./logger.js');


let transporter = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: 'support@skippr.co',
        pass: 'Rppiks$321#'
    }
});


function getTmplData(type, callback) {
    let fileNames = { 'user': 'tmplMail.tmpl', 'premiumUser': 'premiumMail.tmpl' };
    let tmplFile = './' + (fileNames[type]) ? fileNames[type] : null;
    if (!tmplFile) {
        return callback('invalid mailer type');
    }
    try {
        logger.debug('filePath', tmplFile);
        fs.readFile(tmplFile, 'utf8', callback);
    } catch (err) {
        callback(err);
    }

}
module.exports = function mailer(options, callback) {

    getTmplData(options.type, function function_name(err, data) {
        if (err) {
            return callback(err);
        }
        let mailOptions = {
            from: 'support@skippr.co', // sender address
            to: '', // list of receivers
            subject: 'New Skippr handle: "%%title%%"', // Subject line
            text: '', // plaintext body
            html: ''
        };

        // let mailOptions = mailOptions;
        data = data.replace(/\%\%title\%\%/g, options.title).
        replace(/\%\%handle\%\%/g, options.handle).
        replace(/\%\%cust_email\%\%/g, options.email);

        mailOptions.subject = (options.subject) ? options.subject : mailOptions.subject.replace(/\%\%title\%\%/, options.handle);
        mailOptions.from = (options.from) ? options.from : mailOptions.from;
        mailOptions.text = data;
        mailOptions.html = data;
        mailOptions.to = (options.to) ? options.to : options.email;
        transporter.sendMail(mailOptions, function(err, data) {
            logger.debug('mail options', options, data);
            callback(err, data);
            // transporter.close();
        });
    });
};


// mailer({ title: 'test_event', handle: 'abcd' }, function(err, data) {
//     console.log(err, data);
// });
