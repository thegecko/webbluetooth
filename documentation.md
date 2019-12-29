# Node Web Bluetooth
Node.js implementation of the Web Bluetooth Specification

## Prerequisites

[Node.js > v8.14.0](https://nodejs.org), which includes `npm`.

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
const bluetooth = require("webbluetooth").bluetooth;

const device = await bluetooth.requestDevice({
    filters:[{ services:[ "heart_rate" ] }]
});

const server = await device.gatt.connect();
...
```

The first device matching the filters will be returned.

### Creating your own bluetooth instances

You may want to create your own instance of the `Bluetooth` class. For example, to inject a device chooser function or control the referring device:

```JavaScript
const Bluetooth = require("webbluetooth").Bluetooth;

const deviceFound = (device, selectFn) => {
    // If device can be automatically selected, do so by returning true
    if (device.name === "myName") return true;

    // Otherwise store the selectFn somewhere and execute it later to select this device
};

const bluetooth = new Bluetooth({ deviceFound });

const device = await bluetooth.requestDevice({
    filters:[{ services:[ "heart_rate" ] }]
});

const server = await device.gatt.connect();
...
```

## Specification

The Web Bluetooth specification can be found here:

https://webbluetoothcg.github.io/web-bluetooth/
