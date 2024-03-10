#include "peripheral.h"
#include "simpleble_c/simpleble.h"

Napi::FunctionReference Peripheral::constructor;

Napi::Object Peripheral::Init(Napi::Env env, Napi::Object exports) {
  // clang-format off
  Napi::Function func = DefineClass(env, "Peripheral", {
    InstanceAccessor<&Peripheral::Identifier>("identifier"),
    InstanceAccessor<&Peripheral::Address>("address"),
    InstanceAccessor<&Peripheral::AddressType>("addressType"),
    InstanceAccessor<&Peripheral::RSSI>("rssi"),
    InstanceAccessor<&Peripheral::MTU>("mtu"),
    InstanceAccessor<&Peripheral::TxPower>("txPower"),
    InstanceAccessor<&Peripheral::Connected>("connected"),
    InstanceAccessor<&Peripheral::Connectable>("connectable"),
    InstanceAccessor<&Peripheral::Paired>("paired"),
    InstanceAccessor<&Peripheral::GetServices>("services"),
    InstanceAccessor<&Peripheral::GetManufacturerData>("manufacturerData"),
    InstanceMethod("connect", &Peripheral::Connect),
    InstanceMethod("disconnect", &Peripheral::Disconnect),
    InstanceMethod("unpair", &Peripheral::Unpair),
    InstanceMethod("read", &Peripheral::Read),
    InstanceMethod("writeRequest", &Peripheral::WriteRequest),
    InstanceMethod("writeCommand", &Peripheral::WriteCommand),
    InstanceMethod("notify", &Peripheral::Notify),
    InstanceMethod("indicate", &Peripheral::Indicate),
    InstanceMethod("unsubscribe", &Peripheral::Unsubscribe),
    InstanceMethod("readDescriptor", &Peripheral::ReadDescriptor),
    InstanceMethod("writeDescriptor", &Peripheral::WriteDescriptor),
    InstanceMethod("setCallbackOnConnected", &Peripheral::SetCallbackOnConnected),
    InstanceMethod("setCallbackOnDisconnected", &Peripheral::SetCallbackOnDisconnected),
  });
  // clang-format on

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("Peripheral", func);
  return exports;
}

Peripheral::Peripheral(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Peripheral>(info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::TypeError::New(env, "Peripheral should not be created directly")
        .ThrowAsJavaScriptException();
    return;
  } else if (!info[0].IsBigInt()) {
    Napi::Error::New(env, "Internal error - handle pointer")
        .ThrowAsJavaScriptException();
    return;
  }

  bool lossless;
  this->handle = reinterpret_cast<simpleble_peripheral_t>(
      info[0].As<Napi::BigInt>().Uint64Value(&lossless));
  if (!lossless || handle == nullptr) {
    Napi::Error::New(env, "Internal handle error").ThrowAsJavaScriptException();
    return;
  }
}

#include <iostream>

Peripheral::~Peripheral() {
  if (this->handle != nullptr) {
    simpleble_peripheral_release_handle(this->handle);
  }

  for (auto [k, fn] : notifyFns) fn.Release();
  for (auto [k, fn] : indicateFns) fn.Release();

  if (this->onConnectedFn) {
    this->onConnectedFn.Release();
  }

  if (this->onDisconnectedFn) {
    this->onDisconnectedFn.Release();
  }

  this->handle = nullptr;
}

Napi::Value Peripheral::Identifier(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *identifier = simpleble_peripheral_identifier(this->handle);
  auto ret = Napi::String::New(env, identifier);
  simpleble_free(identifier);
  return ret;
}

Napi::Value Peripheral::Address(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *address = simpleble_peripheral_address(this->handle);
  auto ret = Napi::String::New(env, address);
  free(address);
  return ret;
}

Napi::Value Peripheral::AddressType(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  simpleble_address_type_t address_type =
      simpleble_peripheral_address_type(this->handle);
  return Napi::Number::New(env, address_type);
}

Napi::Value Peripheral::RSSI(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const int16_t rssi = simpleble_peripheral_rssi(this->handle);
  return Napi::Number::New(env, rssi);
}

Napi::Value Peripheral::TxPower(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const uint16_t txPower = simpleble_peripheral_tx_power(this->handle);
  return Napi::Number::New(env, txPower);
}

Napi::Value Peripheral::MTU(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const uint16_t mtu = simpleble_peripheral_mtu(this->handle);
  return Napi::Number::New(env, mtu);
}

Napi::Value Peripheral::Connect(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const auto ret = simpleble_peripheral_connect(this->handle);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::Disconnect(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const auto ret = simpleble_peripheral_disconnect(this->handle);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::Connected(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool connected;
  const auto ret = simpleble_peripheral_is_connected(this->handle, &connected);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS && connected);
}

Napi::Value Peripheral::Connectable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool connectable;
  const auto ret =
      simpleble_peripheral_is_connectable(this->handle, &connectable);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS && connectable);
}

Napi::Value Peripheral::Paired(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool paired;
  const auto ret = simpleble_peripheral_is_paired(this->handle, &paired);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS && paired);
}

Napi::Value Peripheral::Unpair(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const auto ret = simpleble_peripheral_unpair(this->handle);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::GetServices(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const size_t count = simpleble_peripheral_services_count(this->handle);
  Napi::Array services = Napi::Array::New(env, count);

  for (size_t index = 0; index < count; index++) {
    simpleble_service_t service;
    Napi::Object serviceObj = Napi::Object::New(env);
    auto ret = simpleble_peripheral_services_get(this->handle, index, &service);
    if (ret != SIMPLEBLE_SUCCESS) {
      break;
    }

    Napi::String uuid =
        Napi::String::New(env, service.uuid.value, SIMPLEBLE_UUID_STR_LEN_TS);

    Napi::Uint8Array data = Napi::Uint8Array::New(env, service.data_length);
    for (size_t i = 0; i < service.data_length; i++) {
      data[i] = service.data[i];
    }

    Napi::Array characteristics =
        Napi::Array::New(env, service.characteristic_count);
    for (size_t i = 0; i < service.characteristic_count; i++) {
      simpleble_characteristic_t characteristic = service.characteristics[i];
      Napi::Object obj = Napi::Object::New(env);
      Napi::Array descriptors =
          Napi::Array::New(env, characteristic.descriptor_count);

      for (size_t j = 0; j < characteristic.descriptor_count; j++) {
        descriptors[j] =
            Napi::String::New(env, characteristic.descriptors[j].uuid.value,
                              SIMPLEBLE_UUID_STR_LEN_TS);
      }

      obj.Set("uuid", characteristic.uuid.value);
      obj.Set("canRead", characteristic.can_read);
      obj.Set("canWriteRequest", characteristic.can_write_request);
      obj.Set("canWriteCommand", characteristic.can_write_command);
      obj.Set("canNotify", characteristic.can_notify);
      obj.Set("canIndicate", characteristic.can_indicate);
      obj.Set("descriptors", descriptors);
      characteristics[i] = obj;
    }

    serviceObj.Set("uuid", uuid);
    serviceObj.Set("data", data);
    serviceObj.Set("characteristics", characteristics);

    services[index] = serviceObj;
  }

  return services;
}

Napi::Value Peripheral::GetManufacturerData(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  const size_t count =
      simpleble_peripheral_manufacturer_data_count(this->handle);
  Napi::Object obj = Napi::Object::New(env);

  for (size_t index = 0; index < count; index++) {
    simpleble_manufacturer_data_t manufacturerData;
    const auto ret = simpleble_peripheral_manufacturer_data_get(
        this->handle, index, &manufacturerData);
    if (ret != SIMPLEBLE_SUCCESS) {
      continue;
    }

    Napi::Uint8Array data =
        Napi::Uint8Array::New(env, manufacturerData.data_length);
    for (size_t i = 0; i < manufacturerData.data_length; i++) {
      data[i] = manufacturerData.data[i];
    }

    uint16_t id = manufacturerData.manufacturer_id;
    obj[uint32_t(id)] = data;
  }

  return obj;
}

Napi::Value Peripheral::Read(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();

  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);

  uint8_t *data_ptr = nullptr;
  size_t data_length;

  auto ret = simpleble_peripheral_read(this->handle, service, characteristic,
                                       &data_ptr, &data_length);
  if (ret != SIMPLEBLE_SUCCESS) {
    return env.Undefined();
  }

  Napi::Uint8Array data = Napi::Uint8Array::New(env, data_length);
  for (size_t i = 0; i < data_length; i++) {
    data[i] = data_ptr[i];
  }

  return data;
}

Napi::Value Peripheral::WriteRequest(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing data").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[2].IsTypedArray()) {
    Napi::TypeError::New(env, "Invalid data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;
  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();
  const uint8_t *data = info[2].As<Napi::Uint8Array>().Data();
  const size_t data_size = info[2].As<Napi::Uint8Array>().ByteLength();

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);

  const auto ret = simpleble_peripheral_write_request(
      this->handle, service, characteristic, data, data_size);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::WriteCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing data").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[2].IsTypedArray()) {
    Napi::TypeError::New(env, "Invalid data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;
  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();
  const uint8_t *data = info[2].As<Napi::Uint8Array>().Data();
  const size_t data_size = info[2].As<Napi::Uint8Array>().ByteLength();

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);

  const auto ret = simpleble_peripheral_write_command(
      this->handle, service, characteristic, data, data_size);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::Unsubscribe(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;
  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);
  const auto ret =
      simpleble_peripheral_unsubscribe(this->handle, service, characteristic);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::ReadDescriptor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing descriptor")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Descriptor is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();
  const Napi::String cbDesc = info[2].As<Napi::String>();

  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;
  simpleble_uuid_t descriptor;

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);
  memcpy(descriptor.value, cbDesc.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);

  uint8_t *data_ptr = nullptr;
  size_t data_length;

  auto ret = simpleble_peripheral_read_descriptor(this->handle, service,
                                                  characteristic, descriptor,
                                                  &data_ptr, &data_length);
  if (ret != SIMPLEBLE_SUCCESS) {
    return env.Undefined();
  }

  Napi::Uint8Array data = Napi::Uint8Array::New(env, data_length);
  for (size_t i = 0; i < data_length; i++) {
    data[i] = data_ptr[i];
  }

  return data;
}

Napi::Value Peripheral::WriteDescriptor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing descriptor")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[2].IsString()) {
    Napi::TypeError::New(env, "Descriptor is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Missing data").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[3].IsTypedArray()) {
    Napi::TypeError::New(env, "Invalid data").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;
  simpleble_uuid_t descriptor;
  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();
  const Napi::String cbDesc = info[2].As<Napi::String>();
  const uint8_t *data = info[3].As<Napi::Uint8Array>().Data();
  const size_t data_size = info[3].As<Napi::Uint8Array>().ByteLength();

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);
  memcpy(descriptor.value, cbDesc.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);

  const auto ret = simpleble_peripheral_write_descriptor(
      this->handle, service, characteristic, descriptor, data, data_size);
  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::Notify(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing callback").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[2].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();
  Napi::Function cbFn = info[2].As<Napi::Function>();
  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);

  const auto [it, _] = notifyFns.emplace(std::string(characteristic.value), Napi::ThreadSafeFunction::New(env, cbFn, "onNotify", 0, 1));
  it->second.Unref(env);

  const auto ret = simpleble_peripheral_notify(this->handle, service,
                                               characteristic, onNotify, this);

  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::Indicate(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Missing service").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Service is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Missing characteristic")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[1].IsString()) {
    Napi::TypeError::New(env, "Characteristic is not a string")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Missing callback").ThrowAsJavaScriptException();
    return env.Undefined();
  } else if (!info[2].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  const Napi::String cbService = info[0].As<Napi::String>();
  const Napi::String cbChar = info[1].As<Napi::String>();
  Napi::Function cbFn = info[2].As<Napi::Function>();
  simpleble_uuid_t service;
  simpleble_uuid_t characteristic;

  memcpy(service.value, cbService.Utf8Value().c_str(), SIMPLEBLE_UUID_STR_LEN);
  memcpy(characteristic.value, cbChar.Utf8Value().c_str(),
         SIMPLEBLE_UUID_STR_LEN);

  const auto [it, _] = indicateFns.emplace(std::string(characteristic.value), Napi::ThreadSafeFunction::New(env, cbFn, "onIndicate", 0, 1));
    it->second.Unref(env);

  const auto ret = simpleble_peripheral_indicate(
      this->handle, service, characteristic, onIndicate, this);

  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value Peripheral::SetCallbackOnConnected(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  } else if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  this->onConnectedFn = Napi::ThreadSafeFunction::New(
      env, info[0].As<Napi::Function>(), "onConnected", 0, 1);
  this->onConnectedFn.Unref(env);

  const auto ret = simpleble_peripheral_set_callback_on_connected(
      this->handle, onConnected, this);

  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

Napi::Value
Peripheral::SetCallbackOnDisconnected(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "No callback given").ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  } else if (!info[0].IsFunction()) {
    Napi::TypeError::New(env, "Callback is not a function")
        .ThrowAsJavaScriptException();
    return Napi::Boolean::New(env, false);
  }

  this->onDisconnectedFn = Napi::ThreadSafeFunction::New(
      env, info[0].As<Napi::Function>(), "onDisconnectedFn", 0, 1);
  this->onDisconnectedFn.Unref(env);

  const auto ret = simpleble_peripheral_set_callback_on_disconnected(
      this->handle, onDisconnected, this);

  return Napi::Boolean::New(env, ret == SIMPLEBLE_SUCCESS);
}

void Peripheral::onConnected(simpleble_peripheral_t, void *userdata) {
  auto peripheral = reinterpret_cast<Peripheral *>(userdata);
  auto callback = [](Napi::Env env, Napi::Function jsCallback) {
    jsCallback.Call({});
  };
  peripheral->onConnectedFn.NonBlockingCall(callback);
}

void Peripheral::onDisconnected(simpleble_peripheral_t, void *userdata) {
  auto peripheral = reinterpret_cast<Peripheral *>(userdata);
  auto callback = [](Napi::Env env, Napi::Function jsCallback) {
    jsCallback.Call({});
  };
  peripheral->onDisconnectedFn.NonBlockingCall(callback);
}

void Peripheral::onNotify(simpleble_uuid_t service,
                          simpleble_uuid_t characteristic, const uint8_t *data,
                          size_t data_length, void *userdata) {
  auto peripheral = reinterpret_cast<Peripheral *>(userdata);
  std::vector<uint8_t> vecData(data, data + data_length);
  auto callback = [vecData](Napi::Env env, Napi::Function jsCallback) {
    auto arrayBuffer = Napi::ArrayBuffer::New(env, vecData.size());
    std::memcpy(arrayBuffer.Data(), vecData.data(), vecData.size());
    auto uint8Array =
        Napi::Uint8Array::New(env, vecData.size(), arrayBuffer, 0);
    jsCallback.Call({uint8Array});
  };

  auto& notifyFns = peripheral->notifyFns;
  if (const auto it = notifyFns.find(std::string(characteristic.value)); it != notifyFns.end())
    it->second.NonBlockingCall(callback);
}

void Peripheral::onIndicate(simpleble_uuid_t service,
                            simpleble_uuid_t characteristic,
                            const uint8_t *data, size_t data_length,
                            void *userdata) {
  auto peripheral = reinterpret_cast<Peripheral *>(userdata);
  std::vector<uint8_t> vecData(data, data + data_length);
  auto callback = [vecData](Napi::Env env, Napi::Function jsCallback) {
    auto arrayBuffer = Napi::ArrayBuffer::New(env, vecData.size());
    std::memcpy(arrayBuffer.Data(), vecData.data(), vecData.size());
    auto uint8Array =
        Napi::Uint8Array::New(env, vecData.size(), arrayBuffer, 0);
    jsCallback.Call({uint8Array});
  };

  auto& indicateFns = peripheral->indicateFns;
  if (const auto it = indicateFns.find(std::string(characteristic.value)); it != indicateFns.end())
    it->second.NonBlockingCall(callback);
}
