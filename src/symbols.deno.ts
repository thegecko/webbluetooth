/*
 * Node Web Bluetooth
 * Copyright (c) 2019 Rob Moran
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** @hidden SimpleBLE symbols. */
export const symbols = {
  simpleble_adapter_get_count_wrapper: {
    parameters: [],
    result: "usize",
  },
  simpleble_adapter_get_handle_wrapper: {
    parameters: ["usize"],
    result: "pointer",
  },
  simpleble_adapter_release_handle_wrapper: {
    parameters: ["pointer"],
    result: "void",
  },
  simpleble_adapter_identifier_wrapper: {
    parameters: ["pointer"],
    result: "pointer",
  },
  simpleble_adapter_address_wrapper: {
    parameters: ["pointer"],
    result: "pointer",
  },
  simpleble_adapter_scan_for_wrapper: {
    parameters: ["pointer", "i32"],
    result: "u32",
  },
  simpleble_adapter_scan_start_wrapper: {
    parameters: ["pointer"],
    result: "u32",
  },
  simpleble_adapter_scan_stop_wrapper: {
    parameters: ["pointer"],
    result: "u32",
  },
  simpleble_adapter_scan_is_active_wrapper: {
    parameters: ["pointer", "buffer"],
    result: "u32",
  },
  simpleble_adapter_scan_get_results_count_wrapper: {
    parameters: ["pointer"],
    result: "usize",
  },
  simpleble_adapter_scan_get_results_handle_wrapper: {
    parameters: ["pointer", "usize"],
    result: "pointer",
  },
  simpleble_adapter_set_callback_on_scan_found_wrapper: {
    parameters: ["pointer", "function", "pointer"],
    result: "u32",
  },
  simpleble_adapter_set_callback_on_scan_start_wrapper: {
    parameters: ["pointer", "function", "pointer"],
    result: "u32",
  },
  simpleble_adapter_set_callback_on_scan_stop_wrapper: {
    parameters: ["pointer", "function", "pointer"],
    result: "u32",
  },
  simpleble_adapter_set_callback_on_scan_updated_wrapper: {
    parameters: ["pointer", "function", "pointer"],
    result: "u32",
  },
  simpleble_adapter_get_paired_peripherals_count_wrapper: {
    parameters: ["pointer"],
    result: "usize",
  },
  simpleble_adapter_get_paired_peripherals_handle_wrapper: {
    parameters: ["pointer", "usize"],
    result: "pointer",
  },
  simpleble_peripheral_release_handle_wrapper: {
    parameters: ["pointer"],
    result: "void",
  },
  simpleble_peripheral_identifier_wrapper: {
    parameters: ["pointer"],
    result: "pointer",
  },
  simpleble_peripheral_address_wrapper: {
    parameters: ["pointer"],
    result: "pointer",
  },
  simpleble_peripheral_rssi_wrapper: {
    parameters: ["pointer"],
    result: "i16",
  },
  simpleble_peripheral_connect_wrapper: {
    parameters: ["pointer"],
    result: "u32",
  },
  simpleble_peripheral_disconnect_wrapper: {
    parameters: ["pointer"],
    result: "u32",
  },
  simpleble_peripheral_notify_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "function", // ["buffer", "usize"]
    ],
    result: "u32",
  },
  simpleble_peripheral_indicate_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "function", // ["buffer", "buffer", "buffer", "usize", "u64"]
      "u64", // void* userdata
    ],
    result: "u32",
  },
  simpleble_peripheral_is_connected_wrapper: {
    parameters: ["pointer", "buffer"],
    result: "u32",
  },
  simpleble_peripheral_is_connectable_wrapper: {
    parameters: ["pointer", "buffer"],
    result: "u32",
  },
  simpleble_peripheral_is_paired_wrapper: {
    parameters: ["pointer", "buffer"],
    result: "u32",
  },
  simpleble_peripheral_unpair_wrapper: {
    parameters: ["pointer"],
    result: "u32",
  },
  simpleble_peripheral_services_count_wrapper: {
    parameters: ["pointer"],
    result: "usize",
  },
  simpleble_peripheral_services_get_wrapper: {
    parameters: ["pointer", "usize", "pointer"],
    result: "u32",
  },
  simpleble_peripheral_manufacturer_data_count_wrapper: {
    parameters: ["pointer"],
    result: "usize",
  },
  simpleble_peripheral_manufacturer_data_get_wrapper: {
    parameters: ["pointer", "usize", "buffer"],
    result: "u32",
  },
  simpleble_peripheral_read_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "buffer", // uint8_t** data
      "buffer", // size_t* data_length
    ],
    result: "u32",
  },
  simpleble_peripheral_set_callback_on_connected_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "function", // ["pointer", "pointer"]
      "pointer", // void* userdata
    ],
    result: "u32",
  },
  simpleble_peripheral_set_callback_on_disconnected_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "function", // ["pointer", "pointer"]
      "pointer", // void* userdata
    ],
    result: "u32",
  },
  simpleble_peripheral_write_request_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "buffer", // uint8_t* data
      "usize", // size_t data_length
    ],
    result: "u32",
  },
  simpleble_peripheral_write_command_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "buffer", // uint8_t* data
      "usize", // size_t data_length
    ],
    result: "u32",
  },
  simpleble_peripheral_unsubscribe_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
    ],
    result: "u32",
  },
  simpleble_peripheral_read_descriptor_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "buffer", // const char* descriptor
      "buffer", // uint8_t** data
      "buffer", // size_t* data_length
    ],
    result: "u32",
  },
  simpleble_peripheral_write_descriptor_wrapper: {
    parameters: [
      "pointer", // simpleble_peripheral_t handle
      "buffer", // const char* service
      "buffer", // const char* characteristic
      "buffer", // const char* descriptor
      "buffer", // uint8_t* data
      "usize", // size_t data_length
    ],
    result: "u32",
  },
  simpleble_free_wrapper: {
    parameters: ["pointer"],
    result: "void",
  },
} as const;
