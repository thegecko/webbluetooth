#pragma once

#include <map>
#include <napi.h>
#include <simpleble_c/peripheral.h>

#define SIMPLEBLE_UUID_STR_LEN_TS (SIMPLEBLE_UUID_STR_LEN - 1) // remove null terminator

class Peripheral : public Napi::ObjectWrap<Peripheral> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Peripheral(const Napi::CallbackInfo &info);
  ~Peripheral();

  static Napi::FunctionReference constructor;

private:
  simpleble_peripheral_t handle;
  std::map<std::string, Napi::ThreadSafeFunction> notifyFns;
  std::map<std::string, Napi::ThreadSafeFunction> indicateFns;
  Napi::ThreadSafeFunction onConnectedFn;
  Napi::ThreadSafeFunction onDisconnectedFn;

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

  static void onConnected(simpleble_peripheral_t peripheral, void *userdata);
  static void onDisconnected(simpleble_peripheral_t peripheral, void *userdata);
  static void onNotify(simpleble_uuid_t service, simpleble_uuid_t characteristic, const uint8_t* data, size_t data_length, void* userdata);
  static void onIndicate(simpleble_uuid_t service, simpleble_uuid_t characteristic, const uint8_t* data, size_t data_length, void* userdata);
};
