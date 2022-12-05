'use strict';
var alphabet = "123456789abcdefghijkmnopqrstuvwxyz";
var base = alphabet.length;

module.exports = {
    decode: function decode(str) {
        var decoded = 0;
        while (str) {
            var index = alphabet.indexOf(str[0]);
            var power = str.length - 1;
            decoded += index * (Math.pow(base, power));
            str = str.substring(1);
        }
        return decoded;
    },

    encode: function encode(num) {
        var encoded = '';
        var i = 0
        while (i < 4) {
            var remainder = num % base;
            num = Math.floor(num / base);
            encoded = alphabet[remainder].toString() + encoded;
            i++;
        }
        return encoded;
    }
};
