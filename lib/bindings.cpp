#include <cstdio>
#include <napi.h>
#include <simpleble_c/simpleble.h>

#include "adapter.h"
#include "peripheral.h"

static Napi::Value Free(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (!info[0].IsBigInt()) {
    Napi::TypeError::New(env, "Invalid handle given")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  bool lossless;
  const uint64_t addr = info[0].As<Napi::BigInt>().Uint64Value(&lossless);
  if (!lossless) {
    Napi::TypeError::New(env, "Not lossless").ThrowAsJavaScriptException();
    return env.Null();
  }

  void *handle = reinterpret_cast<void *>(addr);
  if (handle == nullptr) {
    Napi::TypeError::New(env, "Invalid handle").ThrowAsJavaScriptException();
    return env.Null();
  }

  simpleble_free(handle);
  return env.Null();
}

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  AdapterWrapper::Init(env, exports);
  PeripheralWrapper::Init(env, exports);
  exports.Set("simpleble_free", Napi::Function::New(env, &Free));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
