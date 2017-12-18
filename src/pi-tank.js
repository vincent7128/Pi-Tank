var VERSION = '0.4.0',
    Joystick = require('./joystick'),
    GPIO = require('pigpio').Gpio,
    L293 = {
        // P1A, P2A, P12EN,
        // P4A, P3A, P34EN
    },
    joystick,
    DIR, PWM,
    PWM_MAX, PWM_MIN, PWM_DEG,
    SPEED, DSPEED,
    BREAK = true,
    fn;

function PiTank(option) {
    if (!(this instanceof PiTank)) {
        return new PiTank(option);
    }
    option = option || {};
    DIR = 0;
    PWM = 0;
    SPEED = 0;
    DSPEED = 0;
    PWM_MAX = option.pwmMax || 255;
    PWM_MIN = option.pwmMin || 60;
    PWM_DEG = (PWM_MAX - PWM_MIN) / 100;
    L293.P1A = new GPIO(option.L293 && option.L293.P1A || 17, {
        mode: GPIO.OUTPUT
    });
    L293.P2A = new GPIO(option.L293 && option.L293.P2A || 27, {
        mode: GPIO.OUTPUT
    });
    L293.P12EN = new GPIO(option.L293 && option.L293.P12EN || 4, {
        mode: GPIO.OUTPUT
    });
    L293.P3A = new GPIO(option.L293 && option.L293.P3A || 22, {
        mode: GPIO.OUTPUT
    });
    L293.P4A = new GPIO(option.L293 && option.L293.P4A || 23, {
        mode: GPIO.OUTPUT
    });
    L293.P34EN = new GPIO(option.L293 && option.L293.P34EN || 18, {
        mode: GPIO.OUTPUT
    });
    if (option.joystick) {
        this.joystick = new Joystick(option.joystick.id);
        this.joystick.X = 0;
        this.joystick.Y = 0;
        this.joystick.on('axis', option.joystick.axis || axis.bind(this));
        this.joystick.on('button', option.joystick.button || button.bind(this));
    }
    console.log('*** Pi-Tank ***');
    console.log('VERSION', VERSION);
    process.on('SIGINT', function () {
        this.off();
        process.exit(0);
    }.bind(this));
    process.on('SIGTERM', function () {
        this.off();
        process.exit(0);
    }.bind(this));
    return this;
}

fn = PiTank.prototype;

fn.direction = function(direction) {
    if (direction !== undefined) {
        DIR = (direction + 540) % 360 - 180;
        console.log('Direction', DIR);
        action();
    }
    return DIR;
};

fn.speed = function(speed) {
    if (speed !== undefined) {
        SPEED = Math.min(Math.max(speed, 0), 100);
        console.log('Speed', SPEED);
        action();
    }
    return SPEED;
};

fn.break = function() {
    if (BREAK) {
        L293.P12EN.digitalWrite(1);
        L293.P34EN.digitalWrite(1);
        console.log('!!! BREAK OFF !!!');
    } else {
        L293.P12EN.digitalWrite(0);
        L293.P34EN.digitalWrite(0);
        console.log('!!! BREAK ON !!!');
    }
    BREAK = !BREAK;
    action();
    return BREAK;
};

fn.off = function() {
    L293.P1A.digitalWrite(0);
    L293.P2A.digitalWrite(0);
    L293.P12EN.digitalWrite(0);

    L293.P3A.digitalWrite(0);
    L293.P4A.digitalWrite(0);
    L293.P34EN.digitalWrite(0);
    console.log('*** TANK OFF ***');
}

fn.state = function() {
    return {
        deg: DIR,
        pwm: PWM,
        break: BREAK
    };
}

fn.play = function(acts) {
    var time = 0;
    acts.forEach(function(act) {
        setTimeout(act.play, time);
        time += act.time || 1;
    });
};

function action() {
    if (BREAK || !SPEED) {
        PWM = 0;
        L293.P1A.digitalWrite(PWM);
        L293.P2A.digitalWrite(PWM);

        L293.P3A.digitalWrite(PWM);
        L293.P4A.digitalWrite(PWM);
        return;
    }
    PWM = Math.floor(SPEED * PWM_DEG + PWM_MIN);
    switch (DIR) {
        case 0:
            L293.P1A.digitalWrite(0);
            L293.P2A.pwmWrite(PWM);

            L293.P3A.digitalWrite(0);
            L293.P4A.pwmWrite(PWM);
            console.log('Go Forward', 'Direction', DIR, '[L]', SPEED, '[R]', SPEED);
            break;
        case 180:
        case -180:
            L293.P1A.pwmWrite(PWM);
            L293.P2A.digitalWrite(0);

            L293.P3A.pwmWrite(PWM);
            L293.P4A.digitalWrite(0);
            console.log('Go Backward', 'Direction', DIR, '[L]', SPEED, '[R]', SPEED);
            break;
        case 90:
            L293.P1A.digitalWrite(0);
            L293.P2A.pwmWrite(PWM);

            L293.P3A.pwmWrite(PWM);
            L293.P4A.digitalWrite(0);
            console.log('Turn Right', 'Direction', DIR, '[L]', SPEED, '[R]', SPEED);
            break;
        case -90:
            L293.P1A.pwmWrite(PWM);
            L293.P2A.digitalWrite(0);

            L293.P3A.digitalWrite(0);
            L293.P4A.pwmWrite(PWM);
            console.log('Turn Left', 'Direction', DIR, '[L]', SPEED, '[R]', SPEED);
            break;
        default:
            if (DIR > 0) {
                if (DIR < 90) {
                    DSPEED = Math.floor(SPEED * DIR / 90);

                    L293.P1A.digitalWrite(0);
                    L293.P2A.pwmWrite(PWM);

                    L293.P3A.digitalWrite(0);
                    L293.P4A.pwmWrite(Math.floor(DSPEED * PWM_DEG + PWM_MIN));
                    console.log('Go F-Right', 'Direction', DIR, '[L]', SPEED, '[R]', DSPEED);
                } else {
                    DSPEED = Math.floor(SPEED * (DIR - 90) / 90);

                    L293.P1A.pwmWrite(PWM);
                    L293.P2A.digitalWrite(0);

                    L293.P3A.pwmWrite(Math.floor(DSPEED * PWM_DEG + PWM_MIN));
                    L293.P4A.digitalWrite(0);
                    console.log('Go B-Right', 'Direction', DIR, '[L]', SPEED, '[R]', DSPEED);
                }
            } else {
                if (DIR > -90) {
                    DSPEED = Math.floor(SPEED * DIR / -90);

                    L293.P1A.digitalWrite(0);
                    L293.P2A.pwmWrite(Math.floor(DSPEED * PWM_DEG + PWM_MIN));

                    L293.P3A.digitalWrite(0);
                    L293.P4A.pwmWrite(PWM);
                    console.log('Go F-Left', 'Direction', DIR, '[L]', DSPEED, '[R]', SPEED);
                } else {
                    DSPEED = Math.floor(SPEED * (DIR + 90) / -90);

                    L293.P1A.pwmWrite(Math.floor(DSPEED * PWM_DEG + PWM_MIN));
                    L293.P2A.digitalWrite(0);

                    L293.P3A.pwmWrite(PWM);
                    L293.P4A.digitalWrite(0);
                    console.log('Go B-Left', 'Direction', DIR, '[L]', DSPEED, '[R]', SPEED);
                }
            }
    }
}

function axis(event) {
    if (BREAK) {
        return;
    }
    if (event.number % 2) {
        this.joystick.X = -event.value;
    } else {
        this.joystick.Y = event.value;
    }
    if (!this.joystick.X && !this.joystick.Y) {
        this.speed(0);
    } else {
        this.direction(Math.floor(
            Math.atan2(this.joystick.Y, this.joystick.X) * 180 / Math.PI
        ));
        this.speed(Math.floor(
            Math.abs(
                Math.max(
                    Math.abs(this.joystick.X), Math.abs(this.joystick.Y)
                ) / 32767 * 100
            )
        ));
    }
}

function button(event) {
    if (!event.value) {
        return;
    }
    switch (event.number) {
        case 3:
            this.break();
            break;
        case 8:
            this.off();
            break;
    }
}

module.exports = PiTank;