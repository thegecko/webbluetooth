#pragma once

#include <napi.h>
#include <simpleble_c/adapter.h>

class Adapter : public Napi::ObjectWrap<Adapter> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Adapter(const Napi::CallbackInfo &info);
  ~Adapter();

  static Napi::FunctionReference constructor;

private:
  simpleble_adapter_t handle;
  Napi::ThreadSafeFunction onScanStartFn;
  Napi::ThreadSafeFunction onScanStopFn;
  Napi::ThreadSafeFunction onScanUpdatedFn;
  Napi::ThreadSafeFunction onScanFoundFn;

  static void onScanStart(simpleble_adapter_t handle, void *userdata);
  static void onScanStop(simpleble_adapter_t handle, void *userdata);
  static void onScanUpdated(simpleble_adapter_t handle, simpleble_peripheral_t peripheral, void *userdata);
  static void onScanFound(simpleble_adapter_t handle, simpleble_peripheral_t peripheral, void *userdata);

  Napi::Value Identifier(const Napi::CallbackInfo &info);
  Napi::Value Address(const Napi::CallbackInfo &info);
  Napi::Value IsActive(const Napi::CallbackInfo &info);
  Napi::Value ScanStart(const Napi::CallbackInfo &info);
  Napi::Value ScanStop(const Napi::CallbackInfo &info);
  Napi::Value ScanFor(const Napi::CallbackInfo &info);
  Napi::Value GetPeripherals(const Napi::CallbackInfo &info);
  Napi::Value GetPairedPeripherals(const Napi::CallbackInfo &info);
  Napi::Value SetCallbackOnScanStart(const Napi::CallbackInfo &info);
  Napi::Value SetCallbackOnScanStop(const Napi::CallbackInfo &info);
  Napi::Value SetCallbackOnScanUpdated(const Napi::CallbackInfo &info);
  Napi::Value SetCallbackOnScanFound(const Napi::CallbackInfo &info);
  Napi::Value Release(const Napi::CallbackInfo &info);
};
