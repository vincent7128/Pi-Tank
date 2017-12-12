Pi Tank
======
Raspberry Pi Tank, play with 🎮 PS DualShock 2 or scripts.

[📺 Demo On Youtube](https://youtu.be/czwEzWJb0UM)

# Usage

Install:

```
npm install pi-tank
```

Create your own:

```
var PiTank = require('pi-tank');
tank = PiTank();

tank.play([
    {
        play: function () {
            tank.break();
            tank.deg(90);
        }
    },
    {
        play: function () {
            tank.pwm(255);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(90 - 45);
        },
        time: 3000
    },
    {
        play: function () {
            tank.deg(90);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(90 + 45);
        },
        time: 3000
    },
    {
        play: function () {
            tank.deg(90);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(90 - 45);
        },
        time: 3000
    },
    {
        play: function () {
            tank.deg(90);
        },
        time: 5000
    },
    {
        play: function () {
            tank.deg(270);
        },
        time: 5000
    },
    {
        play: function () {
            tank.off();
        }
    }
]);
```

Run it:

```
sudo node yours.js
```

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
