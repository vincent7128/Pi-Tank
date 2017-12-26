var VERSION = '0.6.0',
    Joystick = require('./joystick'),
    http = require("http"),
    url = require('url'),
    fs = require('fs'),
    mime = require('mime'),
    io = require('socket.io'),
    GPIO = require('pigpio').Gpio,
    L293 = {
        // P1A, P2A,
        // P4A, P3A,
        // EN
    },
    joystick,
    server,
    socket,
    DIR = 0,
    PWM = 0,
    SPEED = 0,
    DSPEED = 0,
    PWM_MAX, PWM_MIN, PWM_DEG,
    BREAK = true,
    fn;

function PiTank(option) {
    if (!(this instanceof PiTank)) {
        return new PiTank(option);
    }
    option = option || {};
    PWM_MAX = option.pwmMax || 255;
    PWM_MIN = option.pwmMin || 60;
    PWM_DEG = (PWM_MAX - PWM_MIN) / 100;
    L293.P1A = new GPIO(option.L293 && option.L293.P1A || 19, {
        mode: GPIO.OUTPUT
    });
    L293.P2A = new GPIO(option.L293 && option.L293.P2A || 26, {
        mode: GPIO.OUTPUT
    });
    L293.P3A = new GPIO(option.L293 && option.L293.P3A || 21, {
        mode: GPIO.OUTPUT
    });
    L293.P4A = new GPIO(option.L293 && option.L293.P4A || 20, {
        mode: GPIO.OUTPUT
    });
    L293.EN = new GPIO(option.L293 && option.L293.EN || 16, {
        mode: GPIO.OUTPUT
    });
    if (option.joystick) {
        this.joystick = new Joystick(option.joystick.id);
        this.joystick.X = 0;
        this.joystick.Y = 0;
        this.joystick.axisMax = option.joystick.axisMax || 32767;
        this.joystick.on('axis', option.joystick.axis || axis.bind(this));
        this.joystick.on('button', option.joystick.button || button.bind(this));
    }
    if (option.web) {
        server = http.createServer(function(request, response) {
            var path = url.parse(request.url).pathname;
            switch (path) {
                case '/':
                    path = '/index.html';
                default:
                    fs.readFile(__dirname + '/www' + path, function(error, data) {
                        if (error) {
                            response.writeHead(404);
                            response.write("opps this doesn't exist - 404");
                        } else {
                            response.writeHead(200, {
                                "Content-Type": mime.getType(path)
                            });
                            response.write(data, "utf8");
                        }
                        response.end();
                    });
            }
        });
        server.listen(option.web.port || 8080);
        socket = io(http);
        socket.listen(server);
        socket.on('connection', function(client) {
            client.emit('state', this.state());
            client.on('move', function(json) {
                console.log(json);
                this.move(json.dir, json.speed);
                client.emit('state', this.state());
            }.bind(this));
            client.on('break', function() {
                console.log(BREAK);
                this.break();
                client.emit('state', this.state());
            }.bind(this));
        }.bind(this));
    }
    console.log('*** Pi-Tank ' + VERSION + ' ***');
    process.on('exit', function() {
        this.off();
    }.bind(this));
    return this;
}

fn = PiTank.prototype;

fn.move = function(direction, speed) {
    DIR = direction || 0;
    SPEED = speed || 0;
    console.log('Move Direction', DIR, 'Speed', SPEED);
    action();
}

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
        L293.EN.digitalWrite(1);
        console.log('!!! BREAK OFF !!!');
    } else {
        L293.EN.digitalWrite(0);
        console.log('!!! BREAK ON !!!');
    }
    BREAK = !BREAK;
    action();
    return BREAK;
};

fn.off = function() {
    L293.P1A.digitalWrite(0);
    L293.P2A.digitalWrite(0);

    L293.P3A.digitalWrite(0);
    L293.P4A.digitalWrite(0);

    L293.EN.digitalWrite(0);
    console.log('*** TANK OFF ***');
}

fn.state = function() {
    return {
        version: VERSION,
        dir: DIR,
        speed: SPEED,
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
                ) / this.joystick.axisMax * 100
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
            process.exit(0);
            break;
    }
}

module.exports = PiTank;