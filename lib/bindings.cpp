#include <cstdio>
#include <napi.h>
#include <simpleble_c/simpleble.h>

#include "adapter.h"
#include "peripheral.h"

Napi::Value GetAdapters(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  const size_t count = simpleble_adapter_get_count();

  // Respect `SIMPLEBLE_ADAPTER` if it exists.
  const char* adapterIndexEnv = std::getenv("SIMPLEBLE_ADAPTER");
  if (adapterIndexEnv) {
    int adapterIndex = -1;
    char* end;
    long index = std::strtol(adapterIndexEnv, &end, 10);
    if (end != adapterIndexEnv && *end == '\0') {
      adapterIndex = static_cast<int>(index);
    }
    if (adapterIndex < 0 || adapterIndex >= count) {
      Napi::RangeError::New(env, "SIMPLEBLE_ADAPTER is out of range")
        .ThrowAsJavaScriptException();
      return env.Null();
    }
    Napi::Value adapterInstance = Adapter::constructor.New({Napi::Number::New(env, adapterIndex)});
    Napi::Array adapters = Napi::Array::New(env, 1);
    adapters.Set(0u, adapterInstance);
    return adapters;
  }

  Napi::Array adapters = Napi::Array::New(env, count);

  for (size_t i = 0; i < count; i++) {
    Napi::Value adapterInstance =
        Adapter::constructor.New({Napi::Number::New(env, i)});
    adapters.Set(i, adapterInstance);
  }

  return adapters;
}

Napi::Value IsEnabled(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const bool enabled = simpleble_adapter_is_bluetooth_enabled();
  return Napi::Boolean::New(env, enabled);
}

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  Adapter::Init(env, exports);
  Peripheral::Init(env, exports);
  exports.Set("getAdapters", Napi::Function::New(env, GetAdapters));
  exports.Set("isEnabled", Napi::Function::New(env, IsEnabled));

  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
