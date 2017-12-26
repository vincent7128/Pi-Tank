var state, socket, messager, axis, analog, breaker;

function axisInit() {
    axis.centerX = axis.clientWidth / 2;
    axis.centerY = axis.clientHeight / 2;

    axis.addEventListener("mousedown", active, false);
    axis.addEventListener("touchstart", active, false);

    axis.addEventListener("mouseup", release, false);
    axis.addEventListener("touchend", release, false);

    function active(event) {
        event.preventDefault();
        if (tank.break) {
            return;
        }
        axis.addEventListener("mousemove", move, false);
        axis.addEventListener("touchmove", move, false);
        move(event);
    }

    function move(event) {
        if (event.touches) {
            event = event.touches[0];
        }
        var x = event.clientX - axis.offsetLeft - axis.centerX;
        var y = event.clientY - axis.offsetTop - axis.centerY;
        var dir = Math.floor(Math.atan2(x, -y) * 180 / Math.PI);
        if (dir <= 15 && dir >= -15) {
            go(0, 100);
            axis.setAttribute
        } else if (dir <= -165 || dir >= 165) {
            go(-180, 100);
        } else if (dir <= 105 && dir >= 75) {
            go(90, 100);
        } else if (dir <= -75 && dir >= -105) {
            go(-90, 100);
        } else if (dir <= 60 && dir >= 30) {
            go(45, 100);
        } else if (dir <= -30 && dir >= -60) {
            go(-45, 100);
        } else if (dir <= 150 && dir >= 120) {
            go(135, 100);
        } else if (dir <= -120 && dir >= -150) {
            go(-135, 100);
        }
    }

    function release(event) {
        axis.removeEventListener("mousemove", move, false);
        axis.removeEventListener("touchmove", move, false);
        go(0, 0);
    }

    function go(dir, speed) {
        if (speed) {
            axis.setAttribute('class', 'active');
            axis.style.transform = 'rotate(' + dir + 'deg)';
        } else {
            axis.removeAttribute('style');
            axis.removeAttribute('class');
        }
        socket.emit('move', {
            dir: dir,
            speed: speed
        });
    }
}

function analogInit() {
    analog.centerX = analog.clientWidth / 2;
    analog.centerY = analog.clientHeight / 2;
    analog.left = analog.offsetLeft + axis.offsetLeft;
    analog.top = analog.offsetTop + axis.offsetTop;

    analog.addEventListener("mousedown", active, false);
    analog.addEventListener("touchstart", active, false);

    analog.addEventListener("mouseup", release, false);
    analog.addEventListener("touchend", release, false);

    function active(event) {
        event.preventDefault();
        event.stopPropagation();
        if (tank.break) {
            return;
        }
        if (event.touches) {
            event = event.touches[0];
        }
        analog.addEventListener("mousemove", move, false);
        analog.addEventListener("touchmove", move, false);
        move(event);
    }

    function move(event) {
        if (event.touches) {
            event = event.touches[0];
        }
        var x = event.clientX - analog.left;
        var y = event.clientY - analog.top;
        analog.style.background = 'radial-gradient(circle at ' +
            x + 'px ' +
            y + 'px, ' +
            '#000 0%, #333 20%, #bbb 80%)';
        go(x, y);
    }

    function release(event) {
        analog.removeEventListener("mousemove", move, false);
        analog.removeEventListener("touchmove", move, false);
        analog.removeAttribute('style');
        go(0, 0);
    }

    function go(x, y) {
        if (!x && !y) {
            socket.emit('move', {
                dir: 0,
                speed: 0
            });
        } else {
            x -= analog.centerX;
            y -= analog.centerY;
            socket.emit('move', {
                dir: Math.floor(
                    Math.atan2(x, -y) * 180 / Math.PI
                ),
                speed: Math.min(Math.floor(
                    (Math.pow(x, 2) + Math.pow(y, 2)) /
                    Math.pow(analog.centerY, 2) * 100
                ), 100)
            });
        }
    }
}

function breakerInit() {
    breaker.addEventListener('click', function() {
        socket.emit('break');
    }, false);
}

function stateUpdate(state) {
    tank = state;
    messager.textContent = 'VERSION4: ' + tank.version + '\n';
    messager.textContent += 'DIR: ' + tank.dir + '\n';
    messager.textContent += 'SPEED: ' + tank.speed + '\n';
    messager.textContent += 'BREAK: ' + (tank.break ? 'on' : 'off') + '\n';
    if (tank.break) {
        breaker.setAttribute('class', 'on');
    } else {
        breaker.setAttribute('class', 'off');
    }
}

function socketInit() {
    if (window.io) {
        socket = io();
    } else {
        tank = {
            version: '0.6.0',
            dir: 0,
            speed: 0,
            break: true
        };
        socket = {
            emit: function(name, json) {
                switch (name) {
                    case 'move':
                        tank.dir = json.dir;
                        tank.speed = json.speed;
                        break;
                    case 'break':
                        tank.break = !tank.break;
                        break;
                }
                this.on('state', stateUpdate);
            },
            on: function(name, callback) {
                callback(tank);
            }
        }
    }
    socket.on('state', stateUpdate);
}

window.addEventListener('load', function init() {
    messager = document.querySelector('#messager');
    axis = document.querySelector('#axis');
    analog = document.querySelector('#axis-analog');
    breaker = document.querySelector('#breaker');
    axisInit();
    analogInit();
    breakerInit();
    socketInit();
}, false);