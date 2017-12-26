#!/usr/bin/env node
var PiTank = require('../src/pi-tank'),
    fs = require('fs'),
    path = require('path'),
    script = [];

if (process.argv[2]) {
    if (!fs.existsSync(process.argv[2])) {
        console.error('\x1b[31m[error]\x1b[0m %s not found', process.argv[2]);
        return;
    }
    script = eval(fs.readFileSync(process.argv[2], 'UTF-8'));
}

PiTank().play(script);