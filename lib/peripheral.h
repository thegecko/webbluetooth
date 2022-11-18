#pragma once
#pragma once

#include <napi.h>
#include <simpleble/PeripheralSafe.h>
#include <simpleble_c/peripheral.h>

class PeripheralWrapper {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  static Napi::Value ReleaseHandle(const Napi::CallbackInfo &info);
  static Napi::Value Identifier(const Napi::CallbackInfo &info);
  static Napi::Value Address(const Napi::CallbackInfo &info);
  static Napi::Value RSSI(const Napi::CallbackInfo &info);
  static Napi::Value Connect(const Napi::CallbackInfo &info);
  static Napi::Value Disconnect(const Napi::CallbackInfo &info);
  static Napi::Value IsConnected(const Napi::CallbackInfo &info);
  static Napi::Value IsConnectable(const Napi::CallbackInfo &info);
  static Napi::Value IsPaired(const Napi::CallbackInfo &info);
  static Napi::Value Unpair(const Napi::CallbackInfo &info);
  static Napi::Value ServicesCount(const Napi::CallbackInfo &info);
  static Napi::Value ServicesGet(const Napi::CallbackInfo &info);
  static Napi::Value ManufacturerDataCount(const Napi::CallbackInfo &info);
  static Napi::Value ManufacturerDataGet(const Napi::CallbackInfo &info);
  static Napi::Value Read(const Napi::CallbackInfo &info);
  static Napi::Value WriteRequest(const Napi::CallbackInfo &info);
  static Napi::Value WriteCommand(const Napi::CallbackInfo &info);
  static Napi::Value Notify(const Napi::CallbackInfo &info);
  static Napi::Value Indicate(const Napi::CallbackInfo &info);
  static Napi::Value Unsubscribe(const Napi::CallbackInfo &info);
  static Napi::Value ReadDescriptor(const Napi::CallbackInfo &info);
  static Napi::Value WriteDescriptor(const Napi::CallbackInfo &info);
  static Napi::Value SetCallbackOnConnected(const Napi::CallbackInfo &info);
  static Napi::Value SetCallbackOnDisconnected(const Napi::CallbackInfo &info);
};
