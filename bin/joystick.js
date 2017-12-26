#!/usr/bin/env node
var PiTank = require('../src/pi-tank'),
    id = 0;

if (process.argv[2]) {
    id = process.argv[2];
}

PiTank({
    joystick: {
        id: id
    }
});