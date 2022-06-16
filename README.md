# Node Web Bluetooth
Node.js implementation of the Web Bluetooth Specification

[![Build Status](https://github.com/thegecko/webbluetooth/workflows/ci/badge.svg)](https://github.com/thegecko/webbluetooth/actions)
[![npm](https://img.shields.io/npm/dm/webbluetooth.svg)](https://www.npmjs.com/package/webbluetooth)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Prerequisites

[Node.js > v10.16.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webbluetooth
```

## Getting Started

See the [examples](https://github.com/thegecko/webbluetooth/tree/master/examples/) or view the API documentation at:

https://thegecko.github.io/webbluetooth/

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

## Implementation Status

### bluetooth

- [x] referringDevice - specification unstable
- [x] getAvailability() - specification unstable
- [x] requestDevice()
- [x] getDevices()
- [x] RequestDeviceOptions.name
- [x] RequestDeviceOptions.namePrefix
- [x] RequestDeviceOptions.services
- [x] RequestDeviceOptions.optionalServices
- [x] RequestDeviceOptions.acceptAllDevices
- [ ] RequestDeviceOptions.manufacturerData - specification unstable
- [ ] RequestDeviceOptions.serviceData - specification unstable

### BluetoothDevice

- [x] id
- [x] name
- [x] gatt
- [ ] forget
- [ ] watchingAdvertisements - specification unstable
- [ ] watchAdvertisements() - specification unstable
- [ ] unwatchAdvertisements() - specification unstable

### BluetoothRemoteGATTServer

- [x] connected
- [x] device
- [x] connect()
- [x] disconnect()
- [x] getPrimaryService()
- [x] getPrimaryServices()

### BluetoothRemoteGATTService

- [x] device
- [x] uuid
- [x] isPrimary
- [x] getCharacteristic()
- [x] getCharacteristics()
- [x] getIncludedService()
- [x] getIncludedServices()

### BluetoothRemoteGATTCharacteristic

- [x] service
- [x] uuid
- [x] properties
- [x] value
- [x] getDescriptor()
- [x] getDescriptors()
- [x] readValue()
- [x] writeValue()
- [x] writeValueWithResponse()
- [x] writeValueWithoutResponse()
- [x] startNotifications()
- [x] stopNotifications()

### BluetoothRemoteGATTDescriptor

- [x] characteristic
- [x] uuid
- [x] value
- [x] readValue()
- [x] writeValue()

### Events

#### Bluetooth

- [x] availabilitychanged

#### Bluetooth Device

- [x] gattserverdisconnected
- [ ] advertisementreceived - specification unstable

#### Bluetooth Service

- [x] serviceadded
- [ ] servicechanged - unsupported in noble
- [ ] serviceremoved - unsupported in noble

#### Bluetooth Characteristic

- [x] characteristicvaluechanged

### Other

- [x] Device selector hook
- [x] Lookups for known services, characteristics and descriptors
- [x] Canonical UUID helper
- [x] Examples
- [x] API Documentation
