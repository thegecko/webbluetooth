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

- [bluetooth](globals.html#bluetooth)
- [Bluetooth()](classes/bluetooth.html)
- [getCanonicalUUID()](globals.html#getcanonicaluuid)
- [getServiceUUID()](globals.html#getserviceuuid)
- [getCharacteristicUUID()](globals.html#getcharacteristicuuid)
- [getDescriptorUUID()](globals.html#getdescriptoruuid)

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

The first device matching the filters will be returned.

### Creating your own bluetooth instances

You may want to create your own instance of the `Bluetooth` class. For example, to inject a device chooser function or control the referring device:

```JavaScript
var Bluetooth = require("webbluetooth").Bluetooth;

function handleDeviceFound(device, selectFn) {
    // If device can be automatically selected, do so by returning true
    if (device.name === "myName") return true;

    // Otherwise store the selectFn somewhere and execute it later to select this device
}

var bluetooth = new Bluetooth({
    deviceFound: handleDeviceFound
});

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

## Specification

The Web Bluetooth specification can be found here:

https://webbluetoothcg.github.io/web-bluetooth/
