# Node Web Bluetooth
Node.js implementation of the [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)

[![Build Status](https://github.com/thegecko/webbluetooth/workflows/prebuild/badge.svg)](https://github.com/thegecko/webbluetooth/actions)
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

- [ ] getAvailability() - unsupported in adapter
- [x] referringDevice
- [x] requestDevice()
- [x] getDevices()
- [x] RequestDeviceOptions.filter.name
- [x] RequestDeviceOptions.filter.namePrefix
- [x] RequestDeviceOptions.filter.services
- [ ] RequestDeviceOptions.filter.manufacturerData
- [ ] RequestDeviceOptions.filter.serviceData
- [x] RequestDeviceOptions.acceptAllDevices
- [x] RequestDeviceOptions.optionalServices
- [ ] RequestDeviceOptions.optionalManufacturerData

### BluetoothDevice

- [x] id
- [x] name
- [x] gatt
- [x] forget()
- [ ] watchAdvertisements()
- [ ] watchingAdvertisements

### BluetoothRemoteGATTServer

- [x] device
- [x] connected
- [x] connect()
- [x] disconnect()
- [x] getPrimaryService()
- [x] getPrimaryServices()

### BluetoothRemoteGATTService

- [x] uuid
- [x] device
- [x] isPrimary
- [x] getCharacteristic()
- [x] getCharacteristics()
- [ ] getIncludedService() - unsupported in adapter
- [ ] getIncludedServices() - unsupported in adapter

### BluetoothRemoteGATTCharacteristic

- [x] uuid
- [x] service
- [x] value
- [ ] properties.broadcast - unsupported in adapter
- [x] properties.read
- [x] properties.writeWithoutResponse
- [x] properties.write
- [x] properties.notify
- [x] properties.indicate
- [ ] properties.authenticatedSignedWrites - unsupported in adapter
- [ ] properties.reliableWrite - unsupported in adapter
- [ ] properties.writableAuxiliaries - unsupported in adapter
- [x] getDescriptor()
- [x] getDescriptors()
- [x] readValue()
- [x] writeValue()
- [x] writeValueWithResponse()
- [x] writeValueWithoutResponse()
- [ ] startNotifications()
- [ ] stopNotifications()

### BluetoothRemoteGATTDescriptor

- [x] uuid
- [x] characteristic
- [x] value
- [x] readValue()
- [x] writeValue()

### Events

#### Bluetooth

- [ ] availabilitychanged - unsupported in adapter

#### Bluetooth Device

- [x] gattserverdisconnected
- [ ] advertisementreceived

#### Bluetooth Service

- [x] serviceadded
- [ ] servicechanged - unsupported in adapter
- [ ] serviceremoved - unsupported in adapter

#### Bluetooth Characteristic

- [ ] characteristicvaluechanged

### Other

- [x] Device selector hook
- [x] Lookups for known services, characteristics and descriptors
- [x] Canonical UUID helper
- [x] Examples
- [x] API Documentation
