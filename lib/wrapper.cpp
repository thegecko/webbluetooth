#include <stdint.h>
#include <string.h>
#include <simpleble/SimpleBLE.h>
#include <simpleble_c/simpleble.h>

#ifdef _MSC_VER
#define EXPORT __declspec(dllexport)
#else
#define EXPORT __attribute__((visibility("default")))
#endif

#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

EXPORT size_t simpleble_adapter_get_count_wrapper(void) {
  return simpleble_adapter_get_count();
}

EXPORT simpleble_adapter_t simpleble_adapter_get_handle_wrapper(size_t index) {
  return simpleble_adapter_get_handle(index);
}

EXPORT void simpleble_adapter_release_handle_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_release_handle(handle);
}

EXPORT char* simpleble_adapter_identifier_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_identifier(handle);
}

EXPORT char* simpleble_adapter_address_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_address(handle);
}

EXPORT simpleble_err_t simpleble_adapter_scan_start_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_scan_start(handle);
}

EXPORT simpleble_err_t simpleble_adapter_scan_stop_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_scan_stop(handle);
}

EXPORT simpleble_err_t simpleble_adapter_scan_is_active_wrapper(simpleble_adapter_t handle, bool* active) {
  return simpleble_adapter_scan_is_active(handle, active);
}

EXPORT simpleble_err_t simpleble_adapter_scan_for_wrapper(simpleble_adapter_t handle, int timeout_ms) {
  return simpleble_adapter_scan_for(handle, timeout_ms);
}

EXPORT size_t simpleble_adapter_scan_get_results_count_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_scan_get_results_count(handle);
}

EXPORT simpleble_peripheral_t simpleble_adapter_scan_get_results_handle_wrapper(simpleble_adapter_t handle, size_t index) {
  return simpleble_adapter_scan_get_results_handle(handle, index);
}

EXPORT size_t simpleble_adapter_get_paired_peripherals_count_wrapper(simpleble_adapter_t handle) {
  return simpleble_adapter_get_paired_peripherals_count(handle);
}

EXPORT simpleble_peripheral_t simpleble_adapter_get_paired_peripherals_handle_wrapper(simpleble_adapter_t handle, size_t index) {
  return simpleble_adapter_get_paired_peripherals_handle(handle, index);
}

EXPORT simpleble_err_t simpleble_adapter_set_callback_on_scan_start_wrapper(simpleble_adapter_t handle, void (*callback)(simpleble_adapter_t adapter, void* userdata), void* userdata) {
  return simpleble_adapter_set_callback_on_scan_start(handle, callback, userdata);
}

EXPORT simpleble_err_t simpleble_adapter_set_callback_on_scan_stop_wrapper(simpleble_adapter_t handle, void (*callback)(simpleble_adapter_t adapter, void* userdata), void* userdata) {
  return simpleble_adapter_set_callback_on_scan_stop(handle, callback, userdata);
}

EXPORT simpleble_err_t simpleble_adapter_set_callback_on_scan_updated_wrapper(simpleble_adapter_t handle, void (*callback)(simpleble_adapter_t adapter, simpleble_peripheral_t peripheral, void* userdata), void* userdata) {
  return simpleble_adapter_set_callback_on_scan_updated(handle, callback, userdata);
}

EXPORT simpleble_err_t simpleble_adapter_set_callback_on_scan_found_wrapper(simpleble_adapter_t handle, void (*callback)(simpleble_adapter_t adapter, simpleble_peripheral_t peripheral, void* userdata), void* userdata) {
  return simpleble_adapter_set_callback_on_scan_found(handle, callback, userdata);
}

EXPORT void simpleble_peripheral_release_handle_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_release_handle(handle);
}

EXPORT char* simpleble_peripheral_identifier_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_identifier(handle);
}

EXPORT char* simpleble_peripheral_address_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_address(handle);
}

EXPORT int16_t simpleble_peripheral_rssi_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_rssi(handle);
}

EXPORT simpleble_err_t simpleble_peripheral_connect_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_connect(handle);
}

EXPORT simpleble_err_t simpleble_peripheral_disconnect_wrapper(simpleble_peripheral_t handle) {
  printf("> PREDISCONNECT\n");
  const auto ret = simpleble_peripheral_disconnect(handle);
  printf("> POSTDISCONNECT\n");
  return ret;
}

EXPORT simpleble_err_t simpleble_peripheral_is_connected_wrapper(simpleble_peripheral_t handle, bool* connected) {
  return simpleble_peripheral_is_connected(handle, connected);
}

EXPORT simpleble_err_t simpleble_peripheral_is_connectable_wrapper(simpleble_peripheral_t handle, bool* connectable) {
  return simpleble_peripheral_is_connectable(handle, connectable);
}

EXPORT simpleble_err_t simpleble_peripheral_is_paired_wrapper(simpleble_peripheral_t handle, bool* paired) {
  return simpleble_peripheral_is_paired(handle, paired);
}

EXPORT simpleble_err_t simpleble_peripheral_unpair_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_unpair(handle);
}

EXPORT size_t simpleble_peripheral_services_count_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_services_count(handle);
}

EXPORT simpleble_err_t simpleble_peripheral_services_get_wrapper(simpleble_peripheral_t handle, size_t index, simpleble_service_t* services) {
  return simpleble_peripheral_services_get(handle, index, services);
}

EXPORT size_t simpleble_peripheral_manufacturer_data_count_wrapper(simpleble_peripheral_t handle) {
  return simpleble_peripheral_manufacturer_data_count(handle);
}

EXPORT simpleble_err_t simpleble_peripheral_manufacturer_data_get_wrapper(simpleble_peripheral_t handle, size_t index, simpleble_manufacturer_data_t* manufacturer_data) {
  return simpleble_peripheral_manufacturer_data_get(handle, index, manufacturer_data);
}

EXPORT simpleble_err_t simpleble_peripheral_read_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, uint8_t** data, size_t* data_length) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_read(handle, service_uuid, characteristic_uuid, data, data_length);
}

EXPORT simpleble_err_t simpleble_peripheral_write_request_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, const uint8_t* data, size_t data_length) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_write_request(handle, service_uuid, characteristic_uuid, data, data_length);
}

EXPORT simpleble_err_t simpleble_peripheral_write_command_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, const uint8_t* data, size_t data_length) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_write_command(handle, service_uuid, characteristic_uuid, data, data_length);
}

EXPORT simpleble_err_t
simpleble_peripheral_notify_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, void (*callback)(const uint8_t* data, size_t data_length)) {
#if 0
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_notify(handle, service_uuid, characteristic_uuid, callback, userdata);
#else
  if (handle == nullptr || callback == nullptr) {
        return SIMPLEBLE_FAILURE;
    }

    const auto service_length = strnlen(service, SIMPLEBLE_UUID_STR_LEN);
    const auto characteristic_length = strnlen(service, SIMPLEBLE_UUID_STR_LEN);

    SimpleBLE::Safe::Peripheral* peripheral = (SimpleBLE::Safe::Peripheral*)handle;

    bool success = peripheral->notify(SimpleBLE::BluetoothUUID(service, service_length), SimpleBLE::BluetoothUUID(characteristic, characteristic_length), [=](SimpleBLE::ByteArray data) {
      callback((const uint8_t*)data.data(), data.size());
    });
    return success ? SIMPLEBLE_SUCCESS : SIMPLEBLE_FAILURE;
#endif
}

EXPORT simpleble_err_t simpleble_peripheral_indicate_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, void (*callback)(simpleble_uuid_t service, simpleble_uuid_t characteristic, const uint8_t* data, size_t data_length, void* userdata), void* userdata) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_indicate(handle, service_uuid, characteristic_uuid, callback, userdata);
}

EXPORT simpleble_err_t simpleble_peripheral_unsubscribe_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_unsubscribe(handle, service_uuid, characteristic_uuid);
}

EXPORT simpleble_err_t simpleble_peripheral_read_descriptor_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, const char* descriptor, uint8_t** data, size_t* data_length) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  simpleble_uuid_t descriptor_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&descriptor_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  strncpy(descriptor_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_read_descriptor(handle, service_uuid, characteristic_uuid, descriptor_uuid, data, data_length);
}

EXPORT simpleble_err_t simpleble_peripheral_write_descriptor_wrapper(simpleble_peripheral_t handle, const char* service, const char* characteristic, const char* descriptor, const uint8_t* data, size_t data_length) {
  simpleble_uuid_t service_uuid;
  simpleble_uuid_t characteristic_uuid;
  simpleble_uuid_t descriptor_uuid;
  memset(&service_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&characteristic_uuid, 0x00, sizeof(simpleble_uuid_t));
  memset(&descriptor_uuid, 0x00, sizeof(simpleble_uuid_t));
  strncpy(service_uuid.value, service, SIMPLEBLE_UUID_STR_LEN);
  strncpy(characteristic_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  strncpy(descriptor_uuid.value, characteristic, SIMPLEBLE_UUID_STR_LEN);
  return simpleble_peripheral_write_descriptor(handle, service_uuid, characteristic_uuid, descriptor_uuid, data, data_length);
}

EXPORT simpleble_err_t simpleble_peripheral_set_callback_on_connected_wrapper(simpleble_peripheral_t handle, void (*callback)(simpleble_peripheral_t peripheral, void* userdata), void* userdata) {
  return simpleble_peripheral_set_callback_on_connected(handle, callback, userdata);
}

EXPORT simpleble_err_t simpleble_peripheral_set_callback_on_disconnected_wrapper(simpleble_peripheral_t handle, void (*callback)(simpleble_peripheral_t peripheral, void* userdata), void* userdata) {
  return simpleble_peripheral_set_callback_on_disconnected(handle, callback, userdata);
}

EXPORT void simpleble_free_wrapper(void* handle) {
  simpleble_free(handle);
}

#ifdef __cplusplus
}
#endif
