var Joystick = require('./joystick'),
    Gpio = require('pigpio').Gpio,
    MotorL1A, MotorL2A, MotorLEN,
    MotorR1A, MotorR2A, MotorREN,
    joystick,
    DEG, PWM, DPWM,
    PWM_MAX, PWM_MIN, PWM_DEG,
    BREAK = true,
    fn;

function PiTank(option) {
    if (!(this instanceof PiTank)) {
        return new PiTank(option);
    }
    option = option || {};
    DEG = 90;
    PWM = 0;
    DPWM = 0;
    PWM_MAX = option.pwmMax || 255;
    PWM_MIN = option.pwmMin || 60;
    PWM_DEG = PWM_MAX - PWM_MIN;
    MotorL1A = new Gpio(option.motor && option.motor.L1A || 10, {
        mode: Gpio.OUTPUT
    });
    MotorL2A = new Gpio(option.motor && option.motor.L2A || 9, {
        mode: Gpio.OUTPUT
    });
    MotorLEN = new Gpio(option.motor && option.motor.LEN || 11, {
        mode: Gpio.OUTPUT
    });
    MotorR1A = new Gpio(option.motor && option.motor.R1A || 23, {
        mode: Gpio.OUTPUT
    });
    MotorR2A = new Gpio(option.motor && option.motor.R1A || 24, {
        mode: Gpio.OUTPUT
    });
    MotorREN = new Gpio(option.motor && option.motor.REN || 25, {
        mode: Gpio.OUTPUT
    });
    if (option.joystick) {
        this.joystick = new Joystick(option.joystick.id);
        this.joystick.X = 0;
        this.joystick.Y = 0;
        this.joystick.on('axis', option.joystick.axis || axis.bind(this));
        this.joystick.on('button', option.joystick.button || button.bind(this));
    }
    return this;
}

fn = PiTank.prototype;

fn.deg = function(deg) {
    if (deg !== undefined) {
        DEG = trimDeg(deg);
        action();
    }
    return DEG;
};

fn.pwm = function(pwm) {
    if (pwm !== undefined) {
        PWM = Math.min(Math.max(pwm, PWM_MIN), PWM_MAX);
        action();
    }
    return PWM;
};

fn.break = function() {
    if (BREAK) {
        MotorLEN.digitalWrite(1);
        MotorREN.digitalWrite(1);
        console.log('!!! BREAK OFF !!!');
    } else {
        MotorLEN.digitalWrite(0);
        MotorREN.digitalWrite(0);
        console.log('!!! BREAK ON !!!');
    }
    return BREAK = !BREAK;
};

fn.off = function () {
    MotorL1A.digitalWrite(0);
    MotorL2A.digitalWrite(0);
    MotorLEN.digitalWrite(0);

    MotorR1A.digitalWrite(0);
    MotorR2A.digitalWrite(0);
    MotorREN.digitalWrite(0);
    console.log('*** GAME OVER ***');
    process.exit(1);
}

fn.state = function() {
    return {
        deg: DEG,
        pwm: PWM,
        break: BREAK
    };
}

fn.play = function (acts) {
    var time = 0;
    acts.forEach(function (act) {
        setTimeout(act.play, time);
        time += act.time || 1;
    });
};

function action() {
    if (BREAK) {
        return;
    }
    switch (DEG) {
        case 0:
            MotorL1A.digitalWrite(0);
            MotorL2A.pwmWrite(PWM);

            MotorR1A.pwmWrite(PWM);
            MotorR2A.digitalWrite(0);
            console.log('Turn Right', 'DEG', DEG, '[L]', PWM, '[R]', PWM);
            break;
        case 90:
            MotorL1A.digitalWrite(0);
            MotorL2A.pwmWrite(PWM);

            MotorR1A.digitalWrite(0);
            MotorR2A.pwmWrite(PWM);
            console.log('Go Forward', 'DEG', DEG, '[L]', PWM, '[R]', PWM);
            break;
        case 180:
            MotorL1A.pwmWrite(PWM);
            MotorL2A.digitalWrite(0);

            MotorR1A.digitalWrite(0);
            MotorR2A.pwmWrite(PWM);
            console.log('Turn Left', 'DEG', DEG, '[L]', PWM, '[R]', PWM);
            break;
        case 270:
            MotorL1A.pwmWrite(PWM);
            MotorL2A.digitalWrite(0);

            MotorR1A.pwmWrite(PWM);
            MotorR2A.digitalWrite(0);
            console.log('Go Backward', 'DEG', DEG, '[L]', PWM, '[R]', PWM);
            break;
        default:
            if (DEG < 90) {
                DPWM = Math.max(
                    Math.floor(PWM * DEG / 90),
                    PWM_MIN
                );
                MotorL1A.digitalWrite(0);
                MotorL2A.pwmWrite(PWM);

                MotorR1A.digitalWrite(0);
                MotorR2A.pwmWrite(DPWM);
                console.log('Go F-Right', 'DEG', DEG, '[L]', PWM, '[R]', DPWM);
            } else if (DEG < 180) {
                DPWM = Math.max(
                    Math.floor(PWM * (180 - DEG) / 90),
                    PWM_MIN
                );
                MotorL1A.digitalWrite(0);
                MotorL2A.pwmWrite(DPWM);

                MotorR1A.digitalWrite(0);
                MotorR2A.pwmWrite(PWM);
                console.log('Go F-Left', 'DEG', DEG, '[L]', DPWM, '[R]', PWM);
            } else if (DEG < 270) {
                DPWM = Math.max(
                    Math.floor(PWM * (DEG - 180) / 90),
                    PWM_MIN
                );
                MotorL1A.pwmWrite(PWM);
                MotorL2A.digitalWrite(0);

                MotorR1A.pwmWrite(DPWM);
                MotorR2A.digitalWrite(0);
                console.log('Go B-Right', 'DEG', DEG, '[L]', PWM, '[R]', DPWM);
            } else {
                DPWM = Math.max(
                    Math.floor(PWM * (360 - DEG) / 90),
                    PWM_MIN
                );
                MotorL1A.pwmWrite(DPWM);
                MotorL2A.digitalWrite(0);

                MotorR1A.pwmWrite(PWM);
                MotorR2A.digitalWrite(0);
                console.log('Go B-Left', 'DEG', DEG, '[L]', DPWM, '[R]', PWM);
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
        MotorL1A.digitalWrite(0);
        MotorL2A.digitalWrite(0);

        MotorR1A.digitalWrite(0);
        MotorR2A.digitalWrite(0);
        return;
    }
    this.deg(Math.floor(
        Math.atan2(this.joystick.X, this.joystick.Y) * 180 / Math.PI
    ));
    this.pwm(Math.floor(
        Math.abs(
            Math.max(
                Math.abs(this.joystick.X), Math.abs(this.joystick.Y)
            ) / 32767
        ) * PWM_DEG + PWM_MIN
    ));
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
            process.exit(1);
            break;
    }
}

function trimDeg(deg) {
    deg %= 360;
    return deg >= 0 ? deg : 360 + deg;
}

module.exports = PiTank;