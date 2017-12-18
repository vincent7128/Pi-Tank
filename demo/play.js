var PiTank = require('../src/pi-tank');
tank = PiTank();

tank.play([
    {
        play: function () {
            tank.break();
        }
    },
    {
        play: function () {
            tank.speed(100);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(90);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(0);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(-90);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(0);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(-90);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(0);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(90);
        },
        time: 3000
    },
    {
        play: function () {
            tank.direction(180);
        },
        time: 6000
    },
    {
        play: function () {
            tank.off();
        }
    }
]);