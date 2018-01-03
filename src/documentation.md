# Node Web Bluetooth
Node.js implementation of the Web Bluetooth Specification

## Prerequisites

[Node.js > v4.8.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webbluetooth
```

## Usage

The module exports a default `navigator.bluetooth` instance, the `Bluetooth` class to allow you to instantiate your own bluetooth instances and some helper methods:

- bluetooth
- Bluetooth()
- getCanonicalUUID()
- getServiceUUID()
- getCharacteristicUUID()
- getDescriptorUUID()

### Using the default bluetooth instance

To use existing Web Bluetooth scripts, you can simply use the default `bluetooth` instance in place of the `navigator.bluetooth` object:

```JavaScript
var bluetooth = require("webbluetooth").bluetooth;

bluetooth.requestDevice({
	filters:[{ services:[ "heart_rate" ] }]
})
.then(device => {
	return device.gatt.connect();
})
.then(server => {
	...
})
```

### Creating your own bluetooth instances

You may want to create your own instance of the `Bluetooth` class. For example, to control the referring device:

```JavaScript
var WebBluetooth = require("webbluetooth").Bluetooth;

var device; // Known device, perhaps obtained via a previous 'requestDevice()` call
var bluetooth = new WebBluetooth(device);

bluetooth.referringDevice.gatt.connect()
.then(server => {
    ...
});
```

## Specification

The Web Bluetooth specification can be found here:

https://webbluetoothcg.github.io/web-bluetooth/
