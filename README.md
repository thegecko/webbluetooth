# Node Web Bluetooth
Node.js implementation of the Web Bluetooth Specification

[![Circle CI](https://circleci.com/gh/thegecko/webbluetooth.svg?style=shield)](https://circleci.com/gh/thegecko/webbluetooth/)
[![npm](https://img.shields.io/npm/dm/webbluetooth.svg)](https://www.npmjs.com/package/webbluetooth)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Prerequisites

[Node.js > v8.14.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webbluetooth
```

## Getting Started

See the [examples](https://github.com/thegecko/webbluetooth/tree/master/examples/) or view the API documentation at:

https://thegecko.github.io/webbluetooth/

## Specification

The Web Bluetooth specification can be found here:

https://webbluetoothcg.github.io/web-bluetooth/

## Implementation Status

### bluetooth

- [x] referringDevice - specification unstable
- [x] getAvailability() - specification unstable
- [x] requestDevice()
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
