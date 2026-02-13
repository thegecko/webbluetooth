# Changelog

## [3.5.0] - 2026-02-08

### Fixed
- Reworked event system to remove node-specific `EventEmitter` events in favour of `EventTarget` - [400](https://github.com/thegecko/webbluetooth/pull/400) ([Alex](https://github.com/Symbitic))

## [3.4.0] - 2026-01-17

### Fixed
- Removed erroneous logging - [389](https://github.com/thegecko/webbluetooth/pull/389) ([Rob Moran](https://github.com/thegecko))
- Fixed characteristic type for TypeScript compatibility - [334](https://github.com/thegecko/webbluetooth/pull/334) ([Rob Moran](https://github.com/thegecko))

## [3.3.2] - 2025-03-08

### Fixed
- Fixed connecting to multiple devices - [299](https://github.com/thegecko/webbluetooth/pull/299) ([Rob Moran](https://github.com/thegecko))

### Added
- Added ability to list and select bluetooth adapter - [189](https://github.com/thegecko/webbluetooth/pull/189) ([Ingo Fischer](https://github.com/Apollon77))
- Added Linux arm64 support - [309](https://github.com/thegecko/webbluetooth/pull/309) ([Rob Moran](https://github.com/thegecko))
- Added prebuild binaries to npm package - [309](https://github.com/thegecko/webbluetooth/pull/309) ([Rob Moran](https://github.com/thegecko))
- Exposed MTU in `_adData` - [300](https://github.com/thegecko/webbluetooth/pull/300) ([Rob Moran](https://github.com/thegecko))

## [3.2.1] - 2024-02-12

### Fixed
- Fixed having separate notifications for characteristics [109](https://github.com/thegecko/webbluetooth/pull/109) ([Daníel Grétarsson](https://github.com/dingari))
- Updated multiple dependant packages including cmakejs and prebuild

## [3.1.0] - 2023-08-22

### Fixed
- Fixed write without response - [91](https://github.com/thegecko/webbluetooth/pull/91) ([Rob Moran](https://github.com/thegecko))

## [3.0.3] - 2023-06-01

### Added
- Added prebuild for Arm-based MacOS - [55](https://github.com/thegecko/webbluetooth/pull/55) ([Rob Moran](https://github.com/thegecko))

## [3.0.2] - 2023-06-01

### Changed
- Backend changed from noble to use SimpleBLE v0.6.1 - [46](https://github.com/thegecko/webbluetooth/pull/46) ([Alex Shaw](https://github.com/Symbitic))
- TypeScript adapter added to use SimpleBLE - [46](https://github.com/thegecko/webbluetooth/pull/46) ([Rob Moran](https://github.com/thegecko))
