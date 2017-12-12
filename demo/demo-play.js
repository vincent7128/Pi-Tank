var PiTank = require('pi-tank');
tank = PiTank();

tank.play([
    {
        play: function () {
            tank.break();
            tank.deg(90);
        }
    },
    {
        play: function () {
            tank.pwm(255);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(90 - 45);
        },
        time: 3000
    },
    {
        play: function () {
            tank.deg(90);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(90 + 45);
        },
        time: 3000
    },
    {
        play: function () {
            tank.deg(90);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(90 - 45);
        },
        time: 3000
    },
    {
        play: function () {
            tank.deg(90);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(270);
        },
        time: 5000
    },
    {
        play: function () {
            tank.off();
        }
    }
]);