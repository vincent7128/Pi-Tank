#!/usr/bin/env node
var PiTank = require('../src/pi-tank'),
    port = 8080;

if (process.argv[2]) {
    port = process.argv[2];
}

PiTank({
    web: {
        port: port
    }
});