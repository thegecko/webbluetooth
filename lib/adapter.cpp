#include "adapter.h"
#include <functional>

#define GET_AND_CHECK_HANDLE(env, info, handle)                                \
  if (info.Length() < 1) {                                                     \
    Napi::TypeError::New(env, "No handle given").ThrowAsJavaScriptException(); \
    return env.Null();                                                         \
  }                                                                            \
                                                                               \
  if (!info[0].IsBigInt()) {                                                   \
    Napi::TypeError::New(env, "Invalid handle given")                          \
        .ThrowAsJavaScriptException();                                         \
    return env.Null();                                                         \
  }                                                                            \
                                                                               \
  bool lossless;                                                               \
  const uint64_t addr = info[0].As<Napi::BigInt>().Uint64Value(&lossless);     \
  if (!lossless) {                                                             \
    Napi::TypeError::New(env, "Not lossless").ThrowAsJavaScriptException();    \
    return env.Null();                                                         \
  }                                                                            \
                                                                               \
  handle = reinterpret_cast<simpleble_adapter_t>(addr);                        \
  if (handle == nullptr) {                                                     \
    Napi::TypeError::New(env, "Invalid handle").ThrowAsJavaScriptException();  \
    return env.Null();                                                         \
  }

Napi::Object AdapterWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  // clang-format off
  exports.Set("simpleble_adapter_get_count",
              Napi::Function::New(env, &AdapterWrapper::GetCount));
  exports.Set("simpleble_adapter_get_handle",
              Napi::Function::New(env, &AdapterWrapper::GetHandle));
  exports.Set("simpleble_adapter_release_handle",
              Napi::Function::New(env, &AdapterWrapper::ReleaseHandle));
  exports.Set("simpleble_adapter_identifier",
              Napi::Function::New(env, &AdapterWrapper::Identifier));
  exports.Set("simpleble_adapter_address",
              Napi::Function::New(env, &AdapterWrapper::Address));
  exports.Set("simpleble_adapter_scan_start",
              Napi::Function::New(env, &AdapterWrapper::ScanStart));
  exports.Set("simpleble_adapter_scan_stop",
              Napi::Function::New(env, &AdapterWrapper::ScanStop));
  exports.Set("simpleble_adapter_scan_is_active",
              Napi::Function::New(env, &AdapterWrapper::ScanIsActive));
  exports.Set("simpleble_adapter_scan_for",
              Napi::Function::New(env, &AdapterWrapper::ScanFor));
  exports.Set("simpleble_adapter_scan_get_results_count",
              Napi::Function::New(env, &AdapterWrapper::ScanGetResultsCount));
  exports.Set("simpleble_adapter_scan_get_results_handle",
              Napi::Function::New(env, &AdapterWrapper::ScanGetResultsHandle));
  exports.Set("simpleble_adapter_get_paired_peripherals_count",
              Napi::Function::New(env, &AdapterWrapper::GetPairedPeripheralsCount));
  exports.Set("simpleble_adapter_get_paired_peripherals_handle",
              Napi::Function::New(env, &AdapterWrapper::GetPairedPeripheralsHandle));
  exports.Set("simpleble_adapter_set_callback_on_scan_start",
              Napi::Function::New(env, &AdapterWrapper::SetCallbackOnScanStart));
  exports.Set("simpleble_adapter_set_callback_on_scan_stop",
              Napi::Function::New(env, &AdapterWrapper::SetCallbackOnScanStop));
  exports.Set("simpleble_adapter_set_callback_on_updated",
              Napi::Function::New(env, &AdapterWrapper::SetCallbackOnScanUpdated));
  exports.Set("simpleble_adapter_set_callback_on_found",
              Napi::Function::New(env, &AdapterWrapper::SetCallbackOnScanFound));
  // clang-format on

  return exports;
}

Napi::Value AdapterWrapper::GetCount(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  const size_t count = simpleble_adapter_get_count();
  Napi::Number ret = Napi::Number::New(env, count);

  return ret;
}

Napi::Value AdapterWrapper::GetHandle(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "Index is not a number")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  uint32_t index = info[0].As<Napi::Number>().Uint32Value();
  simpleble_adapter_t handle = simpleble_adapter_get_handle(index);

  return Napi::BigInt::New(env, reinterpret_cast<uint64_t>(handle));
}

Napi::Value AdapterWrapper::ReleaseHandle(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  simpleble_adapter_release_handle(handle);
  return env.Null();
}

Napi::Value AdapterWrapper::Identifier(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  char *identifier = simpleble_adapter_identifier(handle);
  auto ret = Napi::String::New(env, identifier);
  free(identifier);

  return ret;
}

Napi::Value AdapterWrapper::Address(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  char *address = simpleble_adapter_address(handle);
  auto ret = Napi::String::New(env, address);
  free(address);

  return ret;
}

Napi::Value AdapterWrapper::ScanStart(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  auto err = simpleble_adapter_scan_start(handle);

  return Napi::Boolean::New(env, err == SIMPLEBLE_SUCCESS);
}

Napi::Value AdapterWrapper::ScanStop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  auto err = simpleble_adapter_scan_stop(handle);

  return Napi::Boolean::New(env, err == SIMPLEBLE_SUCCESS);
}

Napi::Value AdapterWrapper::ScanIsActive(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;
  bool active;

  GET_AND_CHECK_HANDLE(env, info, handle);

  auto err = simpleble_adapter_scan_is_active(handle, &active);
  if (err != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, active);
}

Napi::Value AdapterWrapper::ScanFor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing timeout").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsNumber()) {
    Napi::TypeError::New(env, "Timeout is not a number")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  auto timeout = info[1].As<Napi::Number>().Int64Value();

  auto err = simpleble_adapter_scan_for(handle, timeout);

  return Napi::Boolean::New(env, err == SIMPLEBLE_SUCCESS);
}

Napi::Value
AdapterWrapper::ScanGetResultsCount(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  size_t count = simpleble_adapter_scan_get_results_count(handle);

  return Napi::Number::New(env, count);
}

Napi::Value
AdapterWrapper::ScanGetResultsHandle(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing index").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsNumber()) {
    Napi::TypeError::New(env, "Index is not a number")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  uint32_t index = info[1].As<Napi::Number>().Uint32Value();
  simpleble_peripheral_t peripheral =
      simpleble_adapter_scan_get_results_handle(handle, index);

  return Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheral));
}

Napi::Value
AdapterWrapper::GetPairedPeripheralsCount(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  size_t count = simpleble_adapter_get_paired_peripherals_count(handle);

  return Napi::Number::New(env, count);
}

Napi::Value
AdapterWrapper::GetPairedPeripheralsHandle(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing index").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsNumber()) {
    Napi::TypeError::New(env, "Index is not a number")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  uint32_t index = info[1].As<Napi::Number>().Uint32Value();
  simpleble_peripheral_t peripheral =
      simpleble_adapter_get_paired_peripherals_handle(handle, index);

  return Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheral));
}

Napi::Value
AdapterWrapper::SetCallbackOnScanStart(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::Value userdata = env.Null();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (info.Length() >= 3) {
    userdata = info[2].As<Napi::BigInt>();
  }

  Napi::Function cb = info[1].As<Napi::Function>();
  Napi::BigInt cbAdapter = info[0].As<Napi::BigInt>();

  SimpleBLE::Safe::Adapter *adapter = (SimpleBLE::Safe::Adapter *)handle;

  bool success = adapter->set_callback_on_scan_start([=]() {
    cb.Call(env.Global(), {cbAdapter, userdata});
  });

  return Napi::Boolean::New(env, success);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanStop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::Value userdata = env.Null();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (info.Length() >= 3) {
    userdata = info[2].As<Napi::BigInt>();
  }

  Napi::Function cb = info[1].As<Napi::Function>();
  Napi::BigInt cbAdapter = info[0].As<Napi::BigInt>();

  SimpleBLE::Safe::Adapter *adapter = (SimpleBLE::Safe::Adapter *)handle;

  bool success = adapter->set_callback_on_scan_stop([=]() {
    cb.Call(env.Global(), {cbAdapter, userdata});
  });

  return Napi::Boolean::New(env, success);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanUpdated(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::Value userdata = env.Null();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (info.Length() >= 3) {
    userdata = info[2].As<Napi::BigInt>();
  }

  Napi::Function cb = info[1].As<Napi::Function>();
  Napi::BigInt cbAdapter = info[0].As<Napi::BigInt>();

  SimpleBLE::Safe::Adapter *adapter = (SimpleBLE::Safe::Adapter *)handle;

  // clang-format off
  bool success = adapter->set_callback_on_scan_updated([=](SimpleBLE::Safe::Peripheral peripheral) {
    SimpleBLE::Safe::Peripheral *peripheralHandle = new SimpleBLE::Safe::Peripheral(peripheral);
    Napi::Value cbHandle = Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheralHandle));
    cb.Call(env.Global(), {cbAdapter, cbHandle, userdata});
  });
  // clang-format on

  return Napi::Boolean::New(env, success);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanFound(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::Value userdata = env.Null();
  simpleble_adapter_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (info.Length() >= 3) {
    userdata = info[2].As<Napi::BigInt>();
  }

  Napi::Function cb = info[1].As<Napi::Function>();
  Napi::BigInt cbAdapter = info[0].As<Napi::BigInt>();

  SimpleBLE::Safe::Adapter *adapter = (SimpleBLE::Safe::Adapter *)handle;

  // clang-format off
  bool success = adapter->set_callback_on_scan_found([=](SimpleBLE::Safe::Peripheral peripheral) {
    SimpleBLE::Safe::Peripheral *peripheralHandle = new SimpleBLE::Safe::Peripheral(peripheral);
    Napi::Value cbHandle = Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheralHandle));
    cb.Call(env.Global(), {cbAdapter, cbHandle, userdata});
  });
  // clang-format on

  return Napi::Boolean::New(env, success);
}
