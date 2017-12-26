var state, socket, messager, axis, breaker;

function axisInit() {
    axis.centerX = axis.clientWidth / 2;
    axis.centerY = axis.clientHeight / 2;
    axis.addEventListener("mousedown", axisActive, false);
    axis.addEventListener("touchstart", axisActive, false);

    axis.addEventListener("mouseup", axisRelease, false);
    axis.addEventListener("touchend", axisRelease, false);
}

function axisActive(event) {
    if (tank.break) {
        return;
    }
    if (event.touches) {
        event = event.touches[0];
    }
    axis.addEventListener("mousemove", axisMove, false);
    axis.addEventListener("touchmove", axisMove, false);
    var x = event.clientX - axis.offsetLeft;
    var y = event.clientY - axis.offsetTop;

    axis.style.background = 'radial-gradient(circle at ' +
        x + 'px ' +
        y + 'px, ' +
        '#000 0%, #333 20%, #eee 80%)';
    move(x, y);
}

function axisMove(event) {
    if (event.touches) {
        event = event.touches[0];
    }
    var x = event.clientX - axis.offsetLeft;
    var y = event.clientY - axis.offsetTop;
    axis.style.background = 'radial-gradient(circle at ' +
        x + 'px ' +
        y + 'px, ' +
        '#000 0%, #333 20%, #eee 80%)';
    move(x, y);
}

function axisRelease(event) {
    axis.removeEventListener("mousemove", axisMove, false);
    axis.removeEventListener("touchmove", axisMove, false);
    axis.style.background = '';
    move(0, 0);
}

function move(x, y) {
    if (!x && !y) {
        socket.emit('move', {
            dir: 0,
            speed: 0
        });
    } else {
        x -= axis.centerX;
        y -= axis.centerY;
        socket.emit('move', {
            dir:
            Math.floor(
                Math.atan2(x, -y) * 180 / Math.PI
            ),
            speed: Math.min(Math.floor(
                (Math.pow(x, 2) + Math.pow(y, 2)) /
                Math.pow(axis.centerY, 2) * 100
            ), 100)
        });
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
    breaker = document.querySelector('#breaker');
    axisInit();
    breakerInit();
    socketInit();
}, false);