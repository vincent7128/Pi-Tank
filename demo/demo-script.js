var PiTank = require('Pi-Tank');
tank = PiTank();

tank.break();
var deg = 0;

var int = setInterval(function () {
    deg += 10;
    if (deg > 360) {
        clearInterval(int);
        tank.off();
    }
    tank.deg(deg);
}, 2000)
tank.pwm(255);
