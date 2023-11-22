# Node Web Bluetooth
Node.js implementation of the [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)

[![Build Status](https://github.com/thegecko/webbluetooth/workflows/prebuild/badge.svg)](https://github.com/thegecko/webbluetooth/actions)
[![npm](https://img.shields.io/npm/dm/webbluetooth.svg)](https://www.npmjs.com/package/webbluetooth)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Prerequisites

[Node.js > v10.20.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webbluetooth
```

## Getting Started

See the [examples](https://github.com/thegecko/webbluetooth/tree/master/examples/) or view the API documentation at:

https://thegecko.github.io/webbluetooth/

## Usage

The module exports a default `navigator.bluetooth` instance, the `Bluetooth` class to allow you to instantiate your own bluetooth instances and the Bluetooth helper methods:

- [bluetooth](globals.html#bluetooth)
- [Bluetooth()](classes/bluetooth.html)
- [BluetoothUUID.getService()](globals.html)
- [BluetoothUUID.getCharacteristic()](globals.html)
- [BluetoothUUID.getDescriptor()](globals.html)
- [BluetoothUUID.canonicalUUID()](globals.html)

### Using the default bluetooth instance

To use existing Web Bluetooth scripts, you can simply use the default `bluetooth` instance in place of the `navigator.bluetooth` object:

```JavaScript
const bluetooth = require('webbluetooth').bluetooth;

const device = await bluetooth.requestDevice({
    filters:[{ services:[ 'heart_rate' ] }]
});

const server = await device.gatt.connect();
...
```

The first device matching the filters will be returned.

### Creating your own bluetooth instances

You may want to create your own instance of the `Bluetooth` class. For example, to inject a device chooser function or control the referring device:

```JavaScript
const Bluetooth = require('webbluetooth').Bluetooth;

const deviceFound = (device, selectFn) => {
    // If device can be automatically selected, do so by returning true
    if (device.name === 'myName') return true;

    // Otherwise store the selectFn somewhere and execute it later to select this device
};

const bluetooth = new Bluetooth({ deviceFound });

const device = await bluetooth.requestDevice({
    filters:[{ services:[ 'heart_rate' ] }]
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
- [x] RequestDeviceOptions.filter.manufacturerData
- [x] RequestDeviceOptions.filter.serviceData
- [x] RequestDeviceOptions.acceptAllDevices
- [x] RequestDeviceOptions.optionalServices
- [ ] RequestDeviceOptions.exclusionFilters
- [ ] RequestDeviceOptions.optionalManufacturerData - used in advertisements, unsupported in adapter

### BluetoothDevice

- [x] id
- [x] name
- [x] gatt
- [x] forget()
- [ ] watchAdvertisements() - unsupported in adapter
- [ ] watchingAdvertisements - unsupported in adapter

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
- [x] startNotifications()
- [x] stopNotifications()

### BluetoothRemoteGATTDescriptor

- [x] uuid
- [x] characteristic
- [x] value
- [x] readValue()
- [x] writeValue()

### BluetoothUUID

- [x] getService()
- [x] getCharacteristic()
- [x] getDescriptor()
- [x] canonicalUUID()

### Events

#### Bluetooth

- [ ] availabilitychanged - unsupported in adapter

#### Bluetooth Device

- [x] gattserverdisconnected
- [ ] advertisementreceived - unsupported in adapter

#### Bluetooth Service

- [x] serviceadded
- [ ] servicechanged - unsupported in adapter
- [ ] serviceremoved - unsupported in adapter

#### Bluetooth Characteristic

- [x] characteristicvaluechanged

### Other

- [x] Device selector hook
- [x] Examples
- [x] API Documentation

## Development

### Cloning

This repository uses a submodule to reference the SimpleBLE library. Clone it as follows:

```bash
git clone https://github.com/thegecko/webbluetooth
cd webbluetooth
git submodule update --init
```

### Building

To build the SimpleBLE module, bindings and TypeScriptsource, run:

``` bash
yarn build:all
```

### Testing

The tests are set up to use a BBC micro:bit in range with the following services available:

- Device Info Service (0000180a-0000-1000-8000-00805f9b34fb)
- LED Service (e95dd91d-251d-470a-a062-fa1922dfa9a8)
- Button Service (e95d9882-251d-470a-a062-fa1922dfa9a8)

Sample code and hex file for the v2 micro:bit can be found in the [firmware folder](https://github.com/thegecko/webbluetooth/tree/master/firmware).

To run the tests:

```bash
yarn test
```
