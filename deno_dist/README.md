# Node Web Bluetooth

Implementation of the Web Bluetooth Specification for Node.js, Deno and Bun.

[![Build Status](https://github.com/thegecko/webbluetooth/workflows/ci/badge.svg)](https://github.com/thegecko/webbluetooth/actions)
[![npm](https://img.shields.io/npm/dm/webbluetooth.svg)](https://www.npmjs.com/package/webbluetooth)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Installing

How you install webbluetooth depends on which runtime you are using.

### Node.js

    npm install --save webbluetooth

[Node.js 12](https://nodejs.org) or later is required.

```ts
import { bluetooth } from "webbluetooth";
```

### Bun.sh

    bun install webbluetooth

[Bun v0.1.11](https://bun.sh) or later is required.

```ts
import { bluetooth } from "webbluetooth";
```

### Deno

```ts
import { bluetooth } from "https://deno.land/x/webbluetooth/mod.ts";
```

### Browser

```ts
import { bluetooth } from "https://esm.sh/webbluetooth";
```

## Getting Started

See the [examples](https://github.com/thegecko/webbluetooth/tree/master/examples/) or view the API documentation at:

https://thegecko.github.io/webbluetooth/

https://doc.deno.land/https://deno.land/x/webbluetooth/mod.ts

## Usage

The module exports a default `navigator.bluetooth` instance and some helper methods:

- [bluetooth](variables/bluetooth-1.html)
- [getCanonicalUUID()](functions/getCanonicalUUID.html)
- [getServiceUUID()](functions/getServiceUUID.html)
- [getCharacteristicUUID()](functions/getCharacteristicUUID.html)
- [getDescriptorUUID()](functions/getDescriptorUUID.html)

### Using the default bluetooth instance

To use existing Web Bluetooth scripts, you can simply use the default `bluetooth` instance in place of the `navigator.bluetooth` object:

```JavaScript
import { bluetooth } from "webbluetooth";

const device = await bluetooth.requestDevice({
    filters:[{ services:[ "heart_rate" ] }]
});

const server = await device.gatt.connect();
...
```

The first device matching the filters will be returned.

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
- [ ] servicechanged - specification unstable
- [ ] serviceremoved - specification unstable

#### Bluetooth Characteristic

- [x] characteristicvaluechanged

### Other

- [x] Device selector hook
- [x] Lookups for known services, characteristics and descriptors
- [x] Canonical UUID helper
- [x] Examples
- [x] API Documentation
