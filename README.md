Pi Tank
======
Raspberry Pi Tank, play with 🎮 PS DualShock 2 or scripts.

[📺 Demo On Youtube](https://youtu.be/czwEzWJb0UM)

# Usage

## Install:

```
# npm install pi-tank
```

## Play with web
```
$ sudo node
> var PiTank = require('pi-tank');
> tank = PiTank({
    web: {
        port: 8080
    }
});
```

## Play with usb joystick
```
$ sudo node
> var PiTank = require('pi-tank');
> tank = PiTank({
    joystick: {
        id: 0
    }
});
```

## Play with command
```
$ sudo node
> var PiTank = require('pi-tank');
> tank = PiTank();
> tank.play([
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
        tank.direction(-90);
    },
    time: 3000
},
{
    play: function () {
        tank.direction(180);
    },
    time: 3000
},
{
    play: function () {
        tank.off();
    }
}
]);
```

# L293 default wiring

![l293-default-wiring](l293-default-wiring.png)

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
