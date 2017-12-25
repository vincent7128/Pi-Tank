var tank, socket, messager, axis, breaker;

function axisInit() {
    axis.centerX = axis.clientWidth / 2;
    axis.centerY = axis.clientHeight / 2;
    axis.addEventListener("mousedown", axisActive, false);
    axis.addEventListener("touchstart", axisActive, false);

    axis.addEventListener("mouseup", axisRelease, false);
    axis.addEventListener("touchend", axisRelease, false);
}

function axisActive(event) {
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
    move(axis.centerX - x, axis.centerY - y);
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
    move(axis.centerX - x, axis.centerY - y);
}

function axisRelease(event) {
    axis.removeEventListener("mousemove", axisMove, false);
    axis.removeEventListener("touchmove", axisMove, false);
    axis.style.background = '';
    move(0, 0);
}

function move(x, y) {
    stateUpdate({
        dir: Math.floor(
            Math.atan2(y, -x) * 180 / Math.PI
        ),
        speed: Math.floor(
            (Math.pow(x, 2) + Math.pow(y, 2)) /
            Math.pow(axis.centerY, 2) * 100
        )
    });
    return;
    if (!x && !y) {
        socket.emit('move', {
            dir: 90,
            speed: 0
        });
    } else {
        socket.emit('move', {
            dir: Math.floor(
                Math.atan2(y, -x) * 180 / Math.PI
            ),
            speed: Math.floor(
                (Math.pow(x, 2) + Math.pow(y, 2)) /
                Math.pow(axis.centerY, 2) * 100
            )
        });
    }
}

function breakerInit() {
    breaker.addEventListener('click', function() {
        if (breaker.getAttribute('class') === 'on') {
            breaker.setAttribute('class', 'off');
            breaker.textContent = 'BREAK OFF';
        } else {
            breaker.setAttribute('class', 'on');
            breaker.textContent = 'BREAK ON';
        }
    }, false);
}

function stateUpdate(state) {
    messager.textContent = 'VERSION: ' + state.version + '\n';
    messager.textContent += 'DIR: ' + state.dir + '\n';
    messager.textContent += 'SPEED: ' + state.speed + '\n';
    messager.textContent += 'BREAK: ' + state.break+'\n';
}

function socketInit() {
    socket = io();
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