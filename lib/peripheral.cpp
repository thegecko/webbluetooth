#include "peripheral.h"

#include <algorithm>
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
  handle = reinterpret_cast<simpleble_peripheral_t>(addr);                     \
  if (handle == nullptr) {                                                     \
    Napi::TypeError::New(env, "Invalid handle").ThrowAsJavaScriptException();  \
    return env.Null();                                                         \
  }

Napi::Object PeripheralWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  // clang-format off
  exports.Set("simpleble_peripheral_release_handle",
              Napi::Function::New(env, &PeripheralWrapper::ReleaseHandle));
  exports.Set("simpleble_peripheral_identifier",
              Napi::Function::New(env, &PeripheralWrapper::Identifier));
  exports.Set("simpleble_peripheral_address",
              Napi::Function::New(env, &PeripheralWrapper::Address));
  exports.Set("simpleble_peripheral_rssi",
              Napi::Function::New(env, &PeripheralWrapper::RSSI));
  exports.Set("simpleble_peripheral_connect",
              Napi::Function::New(env, &PeripheralWrapper::Connect));
  exports.Set("simpleble_peripheral_disconnect",
              Napi::Function::New(env, &PeripheralWrapper::Disconnect));
  exports.Set("simpleble_peripheral_is_connected",
              Napi::Function::New(env, &PeripheralWrapper::IsConnected));
  exports.Set("simpleble_peripheral_is_connectable",
              Napi::Function::New(env, &PeripheralWrapper::IsConnectable));
  exports.Set("simpleble_peripheral_is_paired",
              Napi::Function::New(env, &PeripheralWrapper::IsPaired));
  exports.Set("simpleble_peripheral_services_count",
              Napi::Function::New(env, &PeripheralWrapper::ServicesCount));
  exports.Set("simpleble_peripheral_services_get",
              Napi::Function::New(env, &PeripheralWrapper::ServicesGet));
  exports.Set("simpleble_peripheral_manufacturer_data_count",
              Napi::Function::New(env, &PeripheralWrapper::ManufacturerDataCount));
  exports.Set("simpleble_peripheral_manufacturer_data_get",
              Napi::Function::New(env, &PeripheralWrapper::ManufacturerDataGet));
  exports.Set("simpleble_peripheral_read",
              Napi::Function::New(env, &PeripheralWrapper::Read));
  exports.Set("simpleble_peripheral_write_command",
              Napi::Function::New(env, &PeripheralWrapper::WriteCommand));
  exports.Set("simpleble_peripheral_write_request",
              Napi::Function::New(env, &PeripheralWrapper::WriteRequest));
  exports.Set("simpleble_peripheral_notify",
              Napi::Function::New(env, &PeripheralWrapper::Notify));
  exports.Set("simpleble_peripheral_indicate",
              Napi::Function::New(env, &PeripheralWrapper::Indicate));
  exports.Set("simpleble_peripheral_unsubscribe",
              Napi::Function::New(env, &PeripheralWrapper::Unsubscribe));
  exports.Set("simpleble_peripheral_read_descriptor",
              Napi::Function::New(env, &PeripheralWrapper::ReadDescriptor));
  exports.Set("simpleble_peripheral_write_descriptor",
              Napi::Function::New(env, &PeripheralWrapper::WriteDescriptor));
  exports.Set("simpleble_peripheral_set_callback_on_connected",
              Napi::Function::New(env, &PeripheralWrapper::SetCallbackOnConnected));
  exports.Set("simpleble_peripheral_set_callback_on_disconnected",
              Napi::Function::New(env, &PeripheralWrapper::SetCallbackOnDisconnected));
  // clang-format on

  return exports;
}

Napi::Value PeripheralWrapper::ReleaseHandle(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  simpleble_peripheral_release_handle(handle);
  return env.Null();
}

Napi::Value PeripheralWrapper::Identifier(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  char *identifier = simpleble_peripheral_identifier(handle);
  auto ret = Napi::String::New(env, identifier);
  free(identifier);

  return ret;
}

Napi::Value PeripheralWrapper::Address(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  char *address = simpleble_peripheral_address(handle);
  auto ret = Napi::String::New(env, address);
  free(address);

  return ret;
}

Napi::Value PeripheralWrapper::RSSI(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  const int16_t rssi = simpleble_peripheral_rssi(handle);
  return Napi::Number::New(env, rssi);
}

Napi::Value PeripheralWrapper::Connect(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  const auto ret = simpleble_peripheral_connect(handle);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value PeripheralWrapper::Disconnect(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  const auto ret = simpleble_peripheral_disconnect(handle);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value PeripheralWrapper::IsConnected(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  bool connected;
  const auto ret = simpleble_peripheral_is_connected(handle, &connected);
  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }
  return Napi::Boolean::New(env, connected);
}

Napi::Value PeripheralWrapper::IsConnectable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  bool connectable;
  const auto ret = simpleble_peripheral_is_connectable(handle, &connectable);
  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }
  return Napi::Boolean::New(env, connectable);
}

Napi::Value PeripheralWrapper::IsPaired(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  bool paired;
  const auto ret = simpleble_peripheral_is_paired(handle, &paired);
  if (ret != SIMPLEBLE_SUCCESS) {
    return Napi::Boolean::New(env, false);
  }
  return Napi::Boolean::New(env, paired);
}

Napi::Value PeripheralWrapper::Unpair(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  const auto ret = simpleble_peripheral_unpair(handle);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value PeripheralWrapper::ServicesCount(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  const size_t count = simpleble_peripheral_services_count(handle);
  return Napi::Number::New(env, count);
}

Napi::Value PeripheralWrapper::ServicesGet(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

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

  auto index = info[1].As<Napi::Number>().Uint32Value();

  // Remove use of simpleble_peripheral_services_get to save memory.
  auto peripheral = (SimpleBLE::Safe::Peripheral *)handle;

  auto peripheralServices = peripheral->services();
  if (!peripheralServices.has_value()) {
    Napi::Error::New(
        env, "simpleble_peripheral_services_get called before connected")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (index >= peripheralServices.value().size()) {
    Napi::RangeError::New(env, "Index is out-of-range")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  SimpleBLE::Service service = peripheralServices.value()[index];
  std::vector<SimpleBLE::Characteristic> characteristics =
      service.characteristics();

  Napi::Object serviceObj = Napi::Object::New(env);
  serviceObj.Set("uuid", service.uuid());

  Napi::Array charArray =
      Napi::Array::New(env, service.characteristics().size());

  for (size_t i = 0; i < service.characteristics().size(); i++) {
    SimpleBLE::Characteristic characteristic = service.characteristics()[i];
    Napi::Object charObj = Napi::Object::New(env);
    Napi::Array descriptorsArray =
        Napi::Array::New(env, characteristic.descriptors().size());
    charObj.Set("uuid", characteristic.uuid());

    for (size_t j = 0; j < characteristic.descriptors().size(); j++) {
      SimpleBLE::Descriptor descriptor = characteristic.descriptors()[j];
      descriptorsArray[j] = descriptor.uuid();
    }
    charObj.Set("descriptors", descriptorsArray);
    charArray[i] = charObj;
  }
  serviceObj.Set("characteristics", charArray);

  return serviceObj;
}

Napi::Value
PeripheralWrapper::ManufacturerDataCount(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  const size_t count = simpleble_peripheral_manufacturer_data_count(handle);
  return Napi::Number::New(env, count);
}

Napi::Value
PeripheralWrapper::ManufacturerDataGet(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;
  simpleble_manufacturer_data_t manufacturerData;

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

  auto index = info[1].As<Napi::Number>().Uint32Value();

  const auto ret = simpleble_peripheral_manufacturer_data_get(
      handle, index, &manufacturerData);
  if (ret != SIMPLEBLE_SUCCESS) {
    Napi::Error::New(env, "No manufacturer data").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Object dataObject = Napi::Object::New(env);
  dataObject.Set("id", manufacturerData.manufacturer_id);

  Napi::Uint32Array data =
      Napi::Uint32Array::New(info.Env(), manufacturerData.data_length);

  for (size_t i = 0; i < manufacturerData.data_length; i++) {
    data[i] = manufacturerData.data[i];
  }
  dataObject.Set("data", data);

  return dataObject;
}

Napi::Value PeripheralWrapper::Read(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;

  // Converting strings to structs leaks memory.
  std::optional<SimpleBLE::ByteArray> data =
      peripheral->read(service, characteristic);
  if (!data.has_value()) {
    return env.Undefined();
  }

  const std::string value = data.value();
  Napi::Uint8Array ret = Napi::Uint8Array::New(env, value.size());
  for (size_t i = 0; i < value.size(); i++) {
    ret[i] = static_cast<uint8_t>(value.at(i));
  }

  return ret;
}

Napi::Value PeripheralWrapper::WriteRequest(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsTypedArray()) {
    Napi::TypeError::New(env, "Invalid data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  const auto u8 = info[3].As<Napi::TypedArrayOf<uint8_t>>().Data();
  const auto length = info[3].As<Napi::TypedArrayOf<uint8_t>>().ByteLength();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;
  auto data = SimpleBLE::ByteArray((const char *)u8, length);

  bool success = peripheral->write_request(service, characteristic, data);

  return Napi::Boolean::New(env, success);
}

Napi::Value PeripheralWrapper::WriteCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsTypedArray()) {
    Napi::TypeError::New(env, "Invalid data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  const auto u8 = info[3].As<Napi::TypedArrayOf<uint8_t>>().Data();
  const auto length = info[3].As<Napi::TypedArrayOf<uint8_t>>().ByteLength();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;
  auto data = SimpleBLE::ByteArray((const char *)u8, length);

  bool success = peripheral->write_command(service, characteristic, data);

  return Napi::Boolean::New(env, success);
}

Napi::Value PeripheralWrapper::Notify(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;
  Napi::Value userdata = env.Null();

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsFunction()) {
    Napi::TypeError::New(env, "Invalid callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() >= 5) {
    userdata = info[4].As<Napi::BigInt>();
  }

  const Napi::String cbService = info[1].As<Napi::String>();
  const Napi::String cbChar = info[2].As<Napi::String>();
  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  Napi::Function cb = info[3].As<Napi::Function>();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;

  // clang-format off
  bool success = peripheral->notify(service, characteristic, [=](SimpleBLE::ByteArray data) {
    Napi::Uint8Array cbData = Napi::Uint8Array::New(env, data.size());
    for (size_t i = 0; i < data.size(); i++) {
      cbData[i] = static_cast<uint8_t>(data.at(i));
    }
    cb.Call(env.Global(), {cbService, cbChar, cbData, userdata});
  });
  // clang-format on

  return Napi::Boolean::New(env, success);
}

Napi::Value PeripheralWrapper::Indicate(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;
  Napi::Value userdata = env.Null();

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsFunction()) {
    Napi::TypeError::New(env, "Invalid callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() >= 5) {
    userdata = info[4].As<Napi::BigInt>();
  }

  const Napi::String cbService = info[1].As<Napi::String>();
  const Napi::String cbChar = info[2].As<Napi::String>();
  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  Napi::Function cb = info[3].As<Napi::Function>();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;

  // clang-format off
  bool success = peripheral->indicate(service, characteristic, [=](SimpleBLE::ByteArray data) {
    Napi::Uint8Array cbData = Napi::Uint8Array::New(env, data.size());
    for (size_t i = 0; i < data.size(); i++) {
      cbData[i] = static_cast<uint8_t>(data.at(i));
    }
    cb.Call(env.Global(), {cbService, cbChar, cbData, userdata});
  });
  // clang-format on

  return Napi::Boolean::New(env, success);
}

Napi::Value PeripheralWrapper::Unsubscribe(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const std::string serviceStr = info[1].As<Napi::String>();
  const std::string charStr = info[2].As<Napi::String>();
  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;

  memcpy(service.value, serviceStr.c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, charStr.c_str(), SIMPLEBLE_UUID_STR_LEN);

  const auto ret =
      simpleble_peripheral_unsubscribe(handle, service, characteristic);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value PeripheralWrapper::ReadDescriptor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing descriptor")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsString()) {
    Napi::TypeError::New(env, "Descriptor is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  const std::string descriptor = info[3].As<Napi::String>();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;

  // Converting strings to structs leaks memory.
  std::optional<SimpleBLE::ByteArray> data =
      peripheral->read(service, characteristic, descriptor);
  if (!data.has_value()) {
    return env.Undefined();
  }

  const std::string value = data.value();
  Napi::Uint8Array ret = Napi::Uint8Array::New(env, value.size());
  for (size_t i = 0; i < value.size(); i++) {
    ret[i] = static_cast<uint8_t>(value.at(i));
  }

  return ret;
}

Napi::Value PeripheralWrapper::WriteDescriptor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing descriptor")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 5) {
    Napi::TypeError::New(env, "Missing data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsString()) {
    Napi::TypeError::New(env, "Descriptor is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[4].IsTypedArray()) {
    Napi::TypeError::New(env, "Invalid data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  const std::string descriptor = info[3].As<Napi::String>();
  const auto u8 = info[4].As<Napi::TypedArrayOf<uint8_t>>().Data();
  const auto length = info[4].As<Napi::TypedArrayOf<uint8_t>>().ByteLength();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;
  auto data = SimpleBLE::ByteArray((const char *)u8, length);

  bool success = peripheral->write(service, characteristic, descriptor, data);

  return Napi::Boolean::New(env, success);
}

Napi::Value
PeripheralWrapper::SetCallbackOnConnected(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;
  Napi::Value userdata = env.Null();

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Invalid callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() >= 3) {
    userdata = info[2].As<Napi::BigInt>();
  }

  const Napi::String cbService = info[1].As<Napi::String>();
  const Napi::String cbChar = info[2].As<Napi::String>();
  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  Napi::Function cb = info[3].As<Napi::Function>();
  Napi::BigInt cbPeripheral = info[0].As<Napi::BigInt>();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;

  // clang-format off
  bool success = peripheral->set_callback_on_connected([=]() {
    cb.Call(env.Global(), {cbPeripheral, userdata});
  });
  // clang-format on

  return Napi::Boolean::New(env, success);
}

Napi::Value
PeripheralWrapper::SetCallbackOnDisconnected(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  simpleble_peripheral_t handle;
  Napi::Value userdata = env.Null();

  GET_AND_CHECK_HANDLE(env, info, handle);

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Invalid callback").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() >= 3) {
    userdata = info[2].As<Napi::BigInt>();
  }

  const Napi::String cbService = info[1].As<Napi::String>();
  const Napi::String cbChar = info[2].As<Napi::String>();
  const std::string service = info[1].As<Napi::String>();
  const std::string characteristic = info[2].As<Napi::String>();
  Napi::Function cb = info[3].As<Napi::Function>();
  Napi::BigInt cbPeripheral = info[0].As<Napi::BigInt>();
  SimpleBLE::Safe::Peripheral *peripheral =
      (SimpleBLE::Safe::Peripheral *)handle;

  // clang-format off
  bool success = peripheral->set_callback_on_disconnected([=]() {
    cb.Call(env.Global(), {cbPeripheral, userdata});
  });
  // clang-format on

  return Napi::Boolean::New(env, success);
}
