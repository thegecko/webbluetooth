#include <cstdio>
#include <napi.h>
#include <simpleble_c/simpleble.h>

#include "adapter.h"
#include "peripheral.h"

Napi::Value GetAdapters(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const size_t count = simpleble_adapter_get_count();

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
