# Node Web Bluetooth
Node.js implementation of the Web Bluetooth Specification

[![Circle CI](https://circleci.com/gh/thegecko/webbluetooth.svg?style=shield)](https://circleci.com/gh/thegecko/webbluetooth/)

## Prerequisites

[Node.js > v4.8.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webbluetooth
```

## Getting Started

See the examples in [examples](https://github.com/thegecko/webbluetooth/tree/master/examples/) or view the API documentation at:

https://thegecko.github.io/webbluetooth/

## Implementation Status

### Web Bluetooth

- [ ] referringDevice - specification unstable
- [ ] getAvailability() - specification unstable
- [x] requestDevice()

- [x] BluetoothDevice
- [ ] BluetoothDevice.watchAdvertisements() - specification unstable
- [ ] BluetoothDevice.unwatchAdvertisements() - specification unstable

- [x] BluetoothRemoteGATTServer
- [x] BluetoothRemoteGATTServer.connect()
- [x] BluetoothRemoteGATTServer.disconnect()
- [x] BluetoothRemoteGATTServer.getPrimaryService()
- [x] BluetoothRemoteGATTServer.getPrimaryServices()

- [x] BluetoothRemoteGATTService
- [x] BluetoothRemoteGATTService.getCharacteristic()
- [x] BluetoothRemoteGATTService.getCharacteristics()
- [x] BluetoothRemoteGATTService.getIncludedService()
- [x] BluetoothRemoteGATTService.getIncludedServices()

- [x] BluetoothRemoteGATTCharacteristic
- [x] BluetoothRemoteGATTCharacteristic.getDescriptor()
- [x] BluetoothRemoteGATTCharacteristic.getDescriptors()
- [x] BluetoothRemoteGATTCharacteristic.readValue()
- [x] BluetoothRemoteGATTCharacteristic.writeValue()
- [x] BluetoothRemoteGATTCharacteristic.startNotifications()
- [x] BluetoothRemoteGATTCharacteristic.stopNotifications()

- [x] BluetoothRemoteGATTDescriptor
- [x] BluetoothRemoteGATTDescriptor.readValue()
- [x] BluetoothRemoteGATTDescriptor.writeValue()

- [ ] Event: availabilitychanged - specification unstable
- [x] Event: gattserverdisconnected
- [x] Event: characteristicvaluechanged
- [ ] Event: serviceadded;
- [ ] Event: servicechanged;
- [ ] Event: serviceremoved;

### Other

- [x] Device selector hook
- [x] Lookups for known services, characteristics and descriptors
- [x] Canonical UUID helper
- [ ] API Documentation
- [ ] Examples
