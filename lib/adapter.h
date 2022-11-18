#pragma once

#include <napi.h>
#include <simpleble/AdapterSafe.h>
#include <simpleble_c/adapter.h>

class AdapterWrapper {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static Napi::Value GetCount(const Napi::CallbackInfo &info);
  static Napi::Value GetHandle(const Napi::CallbackInfo &info);
  static Napi::Value ReleaseHandle(const Napi::CallbackInfo &info);
  static Napi::Value Identifier(const Napi::CallbackInfo &info);
  static Napi::Value Address(const Napi::CallbackInfo &info);
  static Napi::Value ScanStart(const Napi::CallbackInfo &info);
  static Napi::Value ScanStop(const Napi::CallbackInfo &info);
  static Napi::Value ScanIsActive(const Napi::CallbackInfo &info);
  static Napi::Value ScanFor(const Napi::CallbackInfo &info);
  static Napi::Value ScanGetResultsCount(const Napi::CallbackInfo &info);
  static Napi::Value ScanGetResultsHandle(const Napi::CallbackInfo &info);
  static Napi::Value GetPairedPeripheralsCount(const Napi::CallbackInfo &info);
  static Napi::Value GetPairedPeripheralsHandle(const Napi::CallbackInfo &info);
  static Napi::Value SetCallbackOnScanStart(const Napi::CallbackInfo &info);
  static Napi::Value SetCallbackOnScanStop(const Napi::CallbackInfo &info);
  static Napi::Value SetCallbackOnScanUpdated(const Napi::CallbackInfo &info);
  static Napi::Value SetCallbackOnScanFound(const Napi::CallbackInfo &info);
};
