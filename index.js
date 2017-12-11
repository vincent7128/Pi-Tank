var Joystick = new(require('./src/joystick'))(0),
    Gpio = require('pigpio').Gpio,
    MotorL1A = new Gpio(10, {
        mode: Gpio.OUTPUT
    }),
    MotorL2A = new Gpio(9, {
        mode: Gpio.OUTPUT
    }),
    MotorLEN = new Gpio(11, {
        mode: Gpio.OUTPUT
    }),
    MotorR1A = new Gpio(23, {
        mode: Gpio.OUTPUT
    }),
    MotorR2A = new Gpio(24, {
        mode: Gpio.OUTPUT
    }),
    MotorREN = new Gpio(25, {
        mode: Gpio.OUTPUT
    }),
    X = 0,
    Y = 0,
    DEG = 0,
    PWM = 0,
    DPWM = 0,
    PWM_MAX = 255,
    PWM_MIN = 60,
    ENG = false;

console.log('Press the start button to start the engine.');

Joystick.on('axis', function(event) {
    if (!ENG) {
        return;
    }
    if (event.number % 2) {
        X = -event.value;
    } else {
        Y = event.value;
    }
    if (!X && !Y) {
        brakes();
        return;
    }
    DEG = Math.floor(Math.atan2(X, Y) * 180 / Math.PI);
    PWM = Math.floor(
        Math.min(
            Math.max(
                Math.abs(Math.max(Math.abs(X), Math.abs(Y)) / 32767) * PWM_MAX,
                PWM_MIN
            ),
            PWM_MAX
        )
    );
    switch (DEG) {
        case 0:
            console.log('Turn Right:', DEG, 'Left:', PWM, 'Right:', PWM);
            MotorL1A.digitalWrite(0);
            MotorL2A.pwmWrite(PWM);

            MotorR1A.pwmWrite(PWM);
            MotorR2A.digitalWrite(0);
            break;
        case 180:
        case -180:
            console.log('Turn Left:', DEG, 'Left:', PWM, 'Right:', PWM);
            MotorL1A.pwmWrite(PWM);
            MotorL2A.digitalWrite(0);

            MotorR1A.digitalWrite(0);
            MotorR2A.pwmWrite(PWM);
            break;
        case 90:
            console.log('Go Forward:', DEG, 'Left:', PWM, 'Right:', PWM);
            MotorL1A.digitalWrite(0);
            MotorL2A.pwmWrite(PWM);

            MotorR1A.digitalWrite(0);
            MotorR2A.pwmWrite(PWM);
            break;
        case -90:
            console.log('Go Backward:', DEG, 'Left:', PWM, 'Right:', PWM);
            MotorL1A.pwmWrite(PWM);
            MotorL2A.digitalWrite(0);

            MotorR1A.pwmWrite(PWM);
            MotorR2A.digitalWrite(0);
            break;
        default:
            DPWM = Math.max(Math.floor(PWM * Math.abs((Math.abs(DEG) > 90 ? (180 - Math.abs(DEG)) / 90 : Math.abs(DEG) / 90))), 60);
            if (DEG > 0 && DEG < 90) {
                console.log('Go Forward Right:', DEG, 'Left:', PWM, 'Right:', DPWM);
                MotorL1A.digitalWrite(0);
                MotorL2A.pwmWrite(PWM);

                MotorR1A.digitalWrite(0);
                MotorR2A.pwmWrite(DPWM);
            } else if (DEG > 90 && DEG < 180) {
                console.log('Go Forward Left:', DEG, 'Left:', DPWM, 'Right:', PWM);
                MotorL1A.digitalWrite(0);
                MotorL2A.pwmWrite(DPWM);

                MotorR1A.digitalWrite(0);
                MotorR2A.pwmWrite(PWM);
            } else if (DEG < 0 && DEG > -90) {
                console.log('Go Backward Right:', DEG, 'Left:', PWM, 'Right:', DPWM);
                MotorL1A.pwmWrite(PWM);
                MotorL2A.digitalWrite(0);

                MotorR1A.pwmWrite(DPWM);
                MotorR2A.digitalWrite(0);
            } else {
                console.log('Go Backward Left:', DEG, 'Left:', DPWM, 'Right:', PWM);
                MotorL1A.pwmWrite(DPWM);
                MotorL2A.digitalWrite(0);

                MotorR1A.pwmWrite(PWM);
                MotorR2A.digitalWrite(0);
            }
    }
});

Joystick.on('button', function(event) {
    if (!event.value) {
        return;
    }
    switch (event.number) {
        case 3:
            console.log('Breaks');
            brakes();
            break;
        case 8:
            console.log('GAME OVER!');
            brakes();
            MotorLEN.digitalWrite(0);
            MotorREN.digitalWrite(0);
            process.exit(1);
            break;
        case 9:
            brakes();
            if (!ENG) {
                console.log('Engine Started');
                MotorLEN.digitalWrite(1);
                MotorREN.digitalWrite(1);
            } else {
                console.log('Engine Stopped');
                MotorLEN.digitalWrite(0);
                MotorREN.digitalWrite(0);
            }
            ENG = !ENG;
            break;
    }
});

function brakes() {
    X = 0;
    Y = 0;
    MotorL1A.digitalWrite(0);
    MotorL2A.digitalWrite(0);
    MotorR1A.digitalWrite(0);
    MotorR2A.digitalWrite(0);
}