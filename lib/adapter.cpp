#include "adapter.h"
#include <atomic>
#include <functional>

#define GET_AND_CHECK_HANDLE(env, info, handle)                                \
  if (info.Length() < 1) {                                                     \
    Napi::TypeError::New(env, "No handle given").ThrowAsJavaScriptException(); \
    return env.Null();                                                         \
  }                                                                            \
                                                                               \
  if (!info[0].IsExternal()) {                                                 \
    Napi::TypeError::New(env, "Invalid handle given")                          \
        .ThrowAsJavaScriptException();                                         \
    return env.Null();                                                         \
  }                                                                            \
                                                                               \
  handle = info[0].As<Napi::External<simpleble_adapter_t>>().Data();           \
  if (handle == nullptr) {                                                     \
    Napi::TypeError::New(env, "Invalid handle").ThrowAsJavaScriptException();  \
    return env.Null();                                                         \
  }

struct AdapterContext {
  AdapterContext() : done(false) {}
  Napi::FunctionReference cb;
  std::atomic<bool> done;
};

extern "C" void onAdapterCallback(simpleble_adapter_t adapter, void* userdata) {
  AdapterContext* context = static_cast<AdapterContext*>(userdata);
  if (!context->done) {
    context->done = true;
    context->cb.Call({});
    context->cb.Unref();
  }
}

extern "C" void onAdapterPeripheralCallback(simpleble_adapter_t adapter, simpleble_peripheral_t peripheral, void* userdata) {
  AdapterContext* context = static_cast<AdapterContext*>(userdata);
  if (!context->done) {
    context->done = true;
    context->cb.Call({});
    context->cb.Unref();
  }
}

Napi::Object AdapterWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  // clang-format off
  exports.Set("simpleble_adapter_is_bluetooth_enabled",
              Napi::Function::New(env, &AdapterWrapper::IsEnabled));
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

Napi::Value AdapterWrapper::IsEnabled(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  const bool enabled = simpleble_adapter_is_bluetooth_enabled();
  Napi::Number ret = Napi::Number::New(env, enabled);

  return ret;
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

  return Napi::External<simpleble_adapter_t>::New(env, &handle);
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

  //
  return Napi::External<simpleble_peripheral_t>::New(env, &peripheral);
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

  return Napi::External<simpleble_peripheral_t>::New(env, &peripheral);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanStart(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
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

  auto cbData = new AdapterContext();
  cbData->cb = Napi::Persistent(info[1].As<Napi::Function>());

  const auto ret = simpleble_adapter_set_callback_on_scan_start(handle, onAdapterCallback, cbData);
  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanStop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
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

  auto cbData = new AdapterContext();
  cbData->cb = Napi::Persistent(info[1].As<Napi::Function>());

  const auto ret = simpleble_adapter_set_callback_on_scan_stop(handle, onAdapterCallback, cbData);
  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanUpdated(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
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

  Napi::TypeError::New(env, "InternalError - simpleble_adapter_set_callback_on_scan_updated causes an exception").ThrowAsJavaScriptException();

  return Napi::Boolean::New(env, false);
}

Napi::Value
AdapterWrapper::SetCallbackOnScanFound(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
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

  Napi::TypeError::New(env, "InternalError - simpleble_adapter_set_callback_on_scan_found causes an exception").ThrowAsJavaScriptException();

  return Napi::Boolean::New(env, false);
}
