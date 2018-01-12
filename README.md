Pi Tank
======
Raspberry Pi Tank, play on computer or phone, also can play with PS DualShock or scripts.

[📺 Web Demo On Youtube](https://youtu.be/AcS-mvNuP6E)

[📺 Joystick Demo On Youtube](https://youtu.be/4AIHV-h934w)

[📺 Script Demo On Youtube](https://youtu.be/czwEzWJb0UM)

# Install
```
# sudo npm install -g pi-tank
```

## Play with web
```
$ sudo pi-tank-web [port-number: default 8080]
```
*** Open http://[your-RaspberryPi-ip]:[port-number] ***

## Play with usb joystick
```
$ sudo pi-tank-joystick [USB-joystick-id: default 0]
```

## Play with script

#### Create play.json
```
[{
    "rule": function () {
        this.break();
    }
},
{
    "rule": function () {
        this.speed(100);
    },
    "time": 3000
},
{
    "rule": function () {
        this.direction(90);
    },
    "time": 3000
},
{
    "rule": function () {
        this.direction(-90);
    },
    "time": 3000
},
{
    "rule": function () {
        this.direction(180);
    },
    "time": 3000
},
{
    "rule": function () {
        this.off();
    }
}]
```

#### Run script
```
$ sudo pi-tank-play play.json
```

# L293 default wiring
![l293-default-wiring](l293-default-wiring.png)

# License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
