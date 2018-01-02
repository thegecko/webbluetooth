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

## Specification

The Web Bluetooth specification can be found here:

https://webbluetoothcg.github.io/web-bluetooth/

## Implementation Status

### Bluetooth

- [x] referringDevice - specification unstable
- [x] getAvailability() - specification unstable
- [x] requestDevice()

### Bluetooth Device

- [x] BluetoothDevice
- [ ] BluetoothDevice.watchAdvertisements() - specification unstable
- [ ] BluetoothDevice.unwatchAdvertisements() - specification unstable

### Bluetooth Server

- [x] BluetoothRemoteGATTServer
- [x] BluetoothRemoteGATTServer.connect()
- [x] BluetoothRemoteGATTServer.disconnect()
- [x] BluetoothRemoteGATTServer.getPrimaryService()
- [x] BluetoothRemoteGATTServer.getPrimaryServices()

### Bluetooth Services

- [x] BluetoothRemoteGATTService
- [x] BluetoothRemoteGATTService.getCharacteristic()
- [x] BluetoothRemoteGATTService.getCharacteristics()
- [x] BluetoothRemoteGATTService.getIncludedService()
- [x] BluetoothRemoteGATTService.getIncludedServices()

### Bluetooth Characteristics

- [x] BluetoothRemoteGATTCharacteristic
- [x] BluetoothRemoteGATTCharacteristic.getDescriptor()
- [x] BluetoothRemoteGATTCharacteristic.getDescriptors()
- [x] BluetoothRemoteGATTCharacteristic.readValue()
- [x] BluetoothRemoteGATTCharacteristic.writeValue()
- [x] BluetoothRemoteGATTCharacteristic.startNotifications()
- [x] BluetoothRemoteGATTCharacteristic.stopNotifications()

### Bluetooth Descriptors

- [x] BluetoothRemoteGATTDescriptor
- [x] BluetoothRemoteGATTDescriptor.readValue()
- [x] BluetoothRemoteGATTDescriptor.writeValue()

### Bluetooth Events

- [x] availabilitychanged - specification unstable
- [x] gattserverdisconnected
- [x] characteristicvaluechanged
- [ ] serviceadded
- [ ] servicechanged
- [ ] serviceremoved

### Other

- [x] Device selector hook
- [x] Lookups for known services, characteristics and descriptors
- [x] Canonical UUID helper
- [x] Examples
- [ ] API Documentation
