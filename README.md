# Node Web Bluetooth
Node.js implementation of the [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)

[![Build Status](https://github.com/thegecko/webbluetooth/workflows/prebuild/badge.svg)](https://github.com/thegecko/webbluetooth/actions)
[![npm](https://img.shields.io/npm/dm/webbluetooth.svg)](https://www.npmjs.com/package/webbluetooth)

## Licensing

This library is [MIT](http://opensource.org/licenses/MIT) licensed, however it relies on the [SimpleBLE](https://github.com/simpleble/simpleble) library which has a separate license with a confusing history...

### SimpleBLE History

Since v0.7.0 a commercial license is required for any commercial usage, but is otherwise free to use for non-commercial purposes.

- v0.6.1: MIT
- v0.7.0: BSD3/GPLv3
- v0.7.1: BSD3/GPLv3
- v0.7.3: GPLv3
- v0.8.1: GPLv3
- v0.9.0+: BUSL-1.1

*Note: v0.10.3 was the last to support MacOS Catalina, Big Sur and Monterey*

### Webbluetooth Library Versions

The default (`latest`) version of `webbluetooth` released on npm will always include the MIT version of SimpleBLE. However, if you want to use a newer version, others are available as follows and we will endeveuer to keep these up to date.
Note that the license terms when using these are your responsibility.

- v3.x.x webbluetooth@latest (default) - SimpleBLE v0.6.1 ([MIT licensed](https://github.com/simpleble/simpleble/blob/818eeb43574119bde87e9b8cdfea34e9bb17dc98/LICENSE.md))
- v4.x.x webbluetooth@bsd-3 - SimpleBLE v0.7.1 ([BSD-3-Clause](https://github.com/simpleble/simpleble/blob/fe5c54c4253b15e2bd255fb179ea79d2073b10cc/LICENSE.md))
- v5.x.x webbluetooth@gpl-3.0 - SimpleBLE v0.8.1 ([GPLv3 licensed](https://github.com/simpleble/simpleble/blob/5d19f5048408fb7a273bc55de5c3a816f4ff417d/LICENSE.md))
- v6.x.x webbluetooth@busl-1.1 - latest SimpleBLE ([BUSL-1.1 licensed](https://github.com/simpleble/simpleble/blob/main/LICENSE.md))

## Prerequisites

[Node.js > v10.20.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webbluetooth
```

## Getting Started

See the [examples](https://github.com/thegecko/webbluetooth/tree/main/examples/) or view the API documentation at:

https://thegecko.github.io/webbluetooth/

## Supported Platforms

Binaries are built to support the following platforms:

OS | x86 | x64 | arm64
--- | --- | --- | ---
Windows         | X | X | -
MacOS           | - | X | X 
Linux (glibc)   | - | X | X

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

### Functions
- [x] getAdapters() - list available bluetooth adapters

### new Bluetooth options
- [x] deviceFound - A `device found` callback function to allow the user to select a device
- [x] scanTime - The amount of seconds to scan for the device (default is 10)
- [x] allowAllDevices - Optional flag to automatically allow all devices
- [x] referringDevice - An optional referring device
- [x] adapterIndex - An optional index of bluetooth adapter to use (default is 0)

### bluetooth

- [x] getAvailability()
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

### Prerequisites

A valid cmake build system

#### Windows

- [chocolatey](https://chocolatey.org/)
- [cmake](https://cmake.org/download/)

```bash
choco install python visualstudio2019-workload-vctools -y
```

If the automatic installation of VS Tools fails or pauses, open the installer GUI to resume installation.

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

Sample code and hex file for the v2 micro:bit can be found in the [firmware folder](https://github.com/thegecko/webbluetooth/tree/main/firmware).

To run the tests:

```bash
yarn test
```
