#include "adapter.h"
#include "peripheral.h"

Napi::FunctionReference Adapter::constructor;

Napi::Object Adapter::Init(Napi::Env env, Napi::Object exports) {
  // clang-format off
  Napi::Function func = DefineClass(env, "Adapter", {
    InstanceAccessor<&Adapter::Identifier>("identifier"),
    InstanceAccessor<&Adapter::Address>("address"),
    InstanceAccessor<&Adapter::IsActive>("active"),
    InstanceAccessor<&Adapter::GetPeripherals>("peripherals"),
    InstanceAccessor<&Adapter::GetPairedPeripherals>("pairedPeripherals"),
    InstanceMethod("scanFor", &Adapter::ScanFor),
    InstanceMethod("scanStart", &Adapter::ScanStart),
    InstanceMethod("scanStop", &Adapter::ScanStop),
    InstanceMethod("setCallbackOnScanStart", &Adapter::SetCallbackOnScanStart),
    InstanceMethod("setCallbackOnScanStop", &Adapter::SetCallbackOnScanStop),
    InstanceMethod("setCallbackOnScanUpdated", &Adapter::SetCallbackOnScanUpdated),
    InstanceMethod("setCallbackOnScanFound", &Adapter::SetCallbackOnScanFound),
    InstanceMethod("release", &Adapter::Release)
  });
  // clang-format on

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("Adapter", func);
  return exports;
}

Adapter::Adapter(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Adapter>(info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::TypeError::New(env, "Adapter should not be created directly")
        .ThrowAsJavaScriptException();
    return;
  }
  size_t index = info[0].As<Napi::Number>().Int64Value();
  this->handle = simpleble_adapter_get_handle(index);
}

Adapter::~Adapter() {
  if (this->handle != nullptr) {
    simpleble_adapter_release_handle(this->handle);
  }

  if (!this->onScanStartCbRef.IsEmpty()) {
    this->onScanStartCbRef.Reset();
  }

  if (!this->onScanStopCbRef.IsEmpty()) {
    this->onScanStopCbRef.Reset();
  }

  if (!this->onScanUpdatedCbRef.IsEmpty()) {
    this->onScanUpdatedCbRef.Reset();
  }

  if (!this->onScanFoundCbRef.IsEmpty()) {
    this->onScanFoundCbRef.Reset();
  }

  this->handle = nullptr;
}

Napi::Value Adapter::Identifier(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *identifier = simpleble_adapter_identifier(this->handle);
  auto ret = Napi::String::New(env, identifier);
  free(identifier);
  return ret;
}

Napi::Value Adapter::Address(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *address = simpleble_adapter_address(this->handle);
  auto ret = Napi::String::New(env, address);
  free(address);
  return ret;
}

Napi::Value Adapter::IsActive(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  bool active;

  auto err = simpleble_adapter_scan_is_active(this->handle, &active);
  if (err != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, active);
}

Napi::Value Adapter::ScanStart(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  auto err = simpleble_adapter_scan_start(this->handle);

  return Napi::Boolean::New(env, err == SIMPLEBLE_SUCCESS);
}

Napi::Value Adapter::ScanStop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  auto err = simpleble_adapter_scan_stop(this->handle);

  return Napi::Boolean::New(env, err == SIMPLEBLE_SUCCESS);
}

Napi::Value Adapter::ScanFor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing timeout").ThrowAsJavaScriptException();
    return env.Null();
  } else if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "Timeout is not a number")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  auto timeout = info[0].As<Napi::Number>().Int64Value();
  auto err = simpleble_adapter_scan_for(this->handle, timeout);

  return Napi::Boolean::New(env, err == SIMPLEBLE_SUCCESS);
}

Napi::Value Adapter::GetPeripherals(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  size_t count = simpleble_adapter_scan_get_results_count(this->handle);
  Napi::Array peripherals = Napi::Array::New(env);

  for (size_t i = 0; i < count; i++) {
    simpleble_peripheral_t peripheral =
        simpleble_adapter_scan_get_results_handle(this->handle, i);
    Napi::Value peripheralInstance = Peripheral::constructor.New(
        {Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheral))});
    peripherals.Set(i, peripheralInstance);
  }

  return peripherals;
}

Napi::Value Adapter::GetPairedPeripherals(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  size_t count = simpleble_adapter_get_paired_peripherals_count(this->handle);
  Napi::Array peripherals = Napi::Array::New(env, count);

  for (size_t i = 0; i < count; i++) {
    simpleble_peripheral_t peripheral =
        simpleble_adapter_get_paired_peripherals_handle(this->handle, i);
    Napi::Value peripheralInstance = Peripheral::constructor.New(
        {Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheral))});
    peripherals.Set(i, peripheralInstance);
  }

  return peripherals;
}

Napi::Value Adapter::SetCallbackOnScanStart(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  } else if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  this->onScanStartCbRef.Reset(info[0].As<Napi::Function>(), 1);

  auto callback = [](simpleble_adapter_t handle, void *userdata) {
    auto adapter = reinterpret_cast<Adapter *>(userdata);
    Napi::Function jsCallback = adapter->onScanStartCbRef.Value();
    jsCallback.Call({});
  };

  const auto ret = simpleble_adapter_set_callback_on_scan_start(this->handle,
                                                                callback, this);

  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Value Adapter::SetCallbackOnScanStop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  } else if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  this->onScanStopCbRef.Reset(info[0].As<Napi::Function>(), 1);

  const auto callback = [](simpleble_adapter_t handle, void *userdata) {
    auto adapter = reinterpret_cast<Adapter *>(userdata);
    Napi::Function jsCallback = adapter->onScanStopCbRef.Value();
    jsCallback.Call({});
  };

  const auto ret =
      simpleble_adapter_set_callback_on_scan_stop(this->handle, callback, this);

  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Value Adapter::SetCallbackOnScanUpdated(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  } else if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  this->onScanUpdatedCbRef.Reset(info[0].As<Napi::Function>(), 1);

  const auto callback = [](simpleble_adapter_t handle,
                           simpleble_peripheral_t peripheral, void *userdata) {
    auto adapter = reinterpret_cast<Adapter *>(userdata);

    Napi::Function jsCallback = adapter->onScanUpdatedCbRef.Value();
    Napi::HandleScope scope(jsCallback.Env());
    adapter->onPeripheralFound(jsCallback.Env(), jsCallback, peripheral);
  };

  const auto ret = simpleble_adapter_set_callback_on_scan_updated(
      this->handle, callback, this);

  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Value Adapter::SetCallbackOnScanFound(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  } else if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  this->onScanFoundCbRef.Reset(info[0].As<Napi::Function>(), 1);

  const auto callback = [](simpleble_adapter_t handle,
                           simpleble_peripheral_t peripheral, void *userdata) {
    auto adapter = reinterpret_cast<Adapter *>(userdata);

    Napi::Function jsCallback = adapter->onScanFoundCbRef.Value();
    Napi::HandleScope scope(jsCallback.Env());
    adapter->onPeripheralFound(jsCallback.Env(), jsCallback, peripheral);
  };

  const auto ret = simpleble_adapter_set_callback_on_scan_found(this->handle,
                                                                callback, this);

  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

void Adapter::onPeripheralFound(Napi::Env env, Napi::Function jsCallback,
                                simpleble_peripheral_t peripheral) {
  Napi::Value peripheralInstance = Peripheral::constructor.New(
      {Napi::BigInt::New(env, reinterpret_cast<uint64_t>(peripheral))});
  jsCallback.Call({peripheralInstance});
}

Napi::Value Adapter::Release(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  delete this;

  return env.Null();
}
