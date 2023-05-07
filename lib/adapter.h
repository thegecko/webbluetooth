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
  Napi::Reference<Napi::Function> onScanStartCbRef;
  Napi::Reference<Napi::Function> onScanStopCbRef;
  Napi::Reference<Napi::Function> onScanUpdatedCbRef;
  Napi::Reference<Napi::Function> onScanFoundCbRef;

  static void onPeripheralFound(Napi::Env env, Napi::Function jsCallback,
                                simpleble_peripheral_t peripheral);

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
