#pragma once

#include <napi.h>
#include <simpleble_c/peripheral.h>

#define SIMPLEBLE_UUID_STR_LEN_TS SIMPLEBLE_UUID_STR_LEN - 1 // remove null terminator

class Peripheral : public Napi::ObjectWrap<Peripheral> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Peripheral(const Napi::CallbackInfo &info);
  ~Peripheral();

  static Napi::FunctionReference constructor;

private:
  simpleble_peripheral_t handle;
  Napi::Reference<Napi::Function> notifyFnRef;
  Napi::Reference<Napi::Function> indicateFnRef;
  Napi::Reference<Napi::Function> onConnectedFnRef;
  Napi::Reference<Napi::Function> onDisconnectedFnRef;

  Napi::Value Identifier(const Napi::CallbackInfo &info);
  Napi::Value Address(const Napi::CallbackInfo &info);
  Napi::Value AddressType(const Napi::CallbackInfo &info);
  Napi::Value RSSI(const Napi::CallbackInfo &info);
  Napi::Value TxPower(const Napi::CallbackInfo &info);
  Napi::Value MTU(const Napi::CallbackInfo &info);
  Napi::Value Connect(const Napi::CallbackInfo &info);
  Napi::Value Disconnect(const Napi::CallbackInfo &info);
  Napi::Value Connected(const Napi::CallbackInfo &info);
  Napi::Value Connectable(const Napi::CallbackInfo &info);
  Napi::Value Paired(const Napi::CallbackInfo &info);
  Napi::Value Unpair(const Napi::CallbackInfo &info);
  Napi::Value GetServices(const Napi::CallbackInfo &info);
  Napi::Value GetManufacturerData(const Napi::CallbackInfo &info);
  Napi::Value Read(const Napi::CallbackInfo &info);
  Napi::Value WriteRequest(const Napi::CallbackInfo &info);
  Napi::Value WriteCommand(const Napi::CallbackInfo &info);
  Napi::Value Notify(const Napi::CallbackInfo &info);
  Napi::Value Indicate(const Napi::CallbackInfo &info);
  Napi::Value Unsubscribe(const Napi::CallbackInfo &info);
  Napi::Value ReadDescriptor(const Napi::CallbackInfo &info);
  Napi::Value WriteDescriptor(const Napi::CallbackInfo &info);
  Napi::Value SetCallbackOnConnected(const Napi::CallbackInfo &info);
  Napi::Value SetCallbackOnDisconnected(const Napi::CallbackInfo &info);
};
