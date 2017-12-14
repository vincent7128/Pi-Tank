Pi Tank
======
Raspberry Pi Tank, play with 🎮 PS DualShock 2 or scripts.

[📺 Demo On Youtube](https://youtu.be/czwEzWJb0UM)

# Usage

## Install:

```
# npm install pi-tank
```

## Create run.js file:

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
            tank.deg(0);
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
            tank.deg(180);
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

## Run it:

```
# sudo node run.js
```

# L293 default wiring

![l293-default-wiring](l293-default-wiring.png)

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
