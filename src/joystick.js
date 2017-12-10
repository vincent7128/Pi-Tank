var fs = require('fs');
var events = require('events');

function Joystick(id) {
    events.EventEmitter.call(this);
    var self = this,
        buffer = new Buffer(8),
        fd,
        event = {
            id: id,
            time: 0,
            value: 0,
            number: 0
        };

    fs.open("/dev/input/js" + id, "r", function(err, bytes) {
        if (err) {
            return self.emit("error", err);
        } else {
            self.emit("ready");
            fd = bytes;
            readBuffer();
        }
    });

    function readBuffer() {
        if (!fd) {
            return;
        }
        fs.read(fd, buffer, 0, 8, null, function onRead(err, bytes) {
            if (err) {
                return self.emit("error", err);
            }
            var type = buffer[6];
            if (type & 0x80) {
                event.type = 'init';
                if (type & 0x01) {
                    event.name = 'button';
                } else if (type & 0x02) {
                    event.name = 'axis';
                }
            } else if (type & 0x01) {
                event.type = 'button';
            } else if (type & 0x02) {
                event.type = 'axis';
            }
            event.time = buffer.readUInt32LE(0);
            event.value = buffer.readInt16LE(4);
            event.number = buffer[7];
            self.emit(event.type, event);
            readBuffer();
        });
    }

    this.close = function(callback) {
        fs.close(fd, callback);
        fd = undefined;
    };
}
Joystick.prototype = Object.create(events.EventEmitter.prototype);
Joystick.prototype.constructor = Joystick;

module.exports = Joystick;