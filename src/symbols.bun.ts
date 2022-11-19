// @denoify-ignore
// @ts-nocheck
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
    simpleble_adapter_is_bluetooth_enabled_wrapper: {
        args: [],
        returns: "u8",
    },
    simpleble_adapter_get_count_wrapper: {
        args: [],
        returns: "u64",
    },
    simpleble_adapter_get_handle_wrapper: {
        args: ["u64"],
        returns: "ptr",
    },
    simpleble_adapter_release_handle_wrapper: {
        args: ["pointer"],
        returns: "void",
    },
    simpleble_adapter_identifier_wrapper: {
        args: ["pointer"],
        returns: "pointer",
    },
    simpleble_adapter_address_wrapper: {
        args: ["pointer"],
        returns: "pointer",
    },
    simpleble_adapter_scan_for_wrapper: {
        args: ["pointer", "int"],
        returns: "u32",
    },
    simpleble_adapter_scan_start_wrapper: {
        args: ["pointer"],
        returns: "u32",
    },
    simpleble_adapter_scan_stop_wrapper: {
        args: ["pointer"],
        returns: "u32",
    },
    simpleble_adapter_scan_is_active_wrapper: {
        args: ["pointer", "buffer"],
        returns: "u32",
    },
    simpleble_adapter_scan_get_results_count_wrapper: {
        args: ["pointer"],
        returns: "u64",
    },
    simpleble_adapter_scan_get_results_handle_wrapper: {
        args: ["pointer", "u64"],
        returns: "pointer",
    },
    /*
    simpleble_adapter_set_callback_on_scan_found_wrapper: {
      args: ["pointer", "function", "pointer"],
      returns: "u32",
    },
    simpleble_adapter_set_callback_on_scan_start_wrapper: {
      args: ["pointer", "function", "pointer"],
      returns: "u32",
    },
    simpleble_adapter_set_callback_on_scan_stop_wrapper: {
      args: ["pointer", "function", "pointer"],
      returns: "u32",
    },
    simpleble_adapter_set_callback_on_scan_updated_wrapper: {
      args: ["pointer", "function", "pointer"],
      returns: "u32",
    },
    */
    simpleble_adapter_get_paired_peripherals_count_wrapper: {
        args: ["pointer"],
        returns: "u64",
    },
    simpleble_adapter_get_paired_peripherals_handle_wrapper: {
        args: ["pointer", "u64"],
        returns: "pointer",
    },
    simpleble_peripheral_release_handle_wrapper: {
        args: ["pointer"],
        returns: "void",
    },
    simpleble_peripheral_identifier_wrapper: {
        args: ["pointer"],
        returns: "pointer",
    },
    simpleble_peripheral_address_wrapper: {
        args: ["pointer"],
        returns: "pointer",
    },
    simpleble_peripheral_rssi_wrapper: {
        args: ["pointer"],
        returns: "i16",
    },
    simpleble_peripheral_mtu_wrapper: {
        args: ["pointer"],
        returns: "u16",
    },
    simpleble_peripheral_connect_wrapper: {
        args: ["pointer"],
        returns: "u32",
    },
    simpleble_peripheral_disconnect_wrapper: {
        args: ["pointer"],
        returns: "u32",
    },
    /*
    simpleble_peripheral_notify_wrapper: {
      args: [
        "pointer", // simpleble_peripheral_t handle
        "buffer", // const char* service
        "buffer", // const char* characteristic
        "function", // ["buffer", "u64"]
      ],
      returns: "u32",
    },
    simpleble_peripheral_indicate_wrapper: {
      args: [
        "pointer", // simpleble_peripheral_t handle
        "buffer", // const char* service
        "buffer", // const char* characteristic
        "function", // ["buffer", "buffer", "buffer", "u64", "u64"]
        "u64", // void* userdata
      ],
      returns: "u32",
    },
    */
    simpleble_peripheral_is_connected_wrapper: {
        args: ["pointer", "ptr"],
        returns: "u32",
    },
    simpleble_peripheral_is_connectable_wrapper: {
        args: ["pointer", "ptr"],
        returns: "u32",
    },
    simpleble_peripheral_is_paired_wrapper: {
        args: ["pointer", "ptr"],
        returns: "u32",
    },
    simpleble_peripheral_unpair_wrapper: {
        args: ["pointer"],
        returns: "u32",
    },
    simpleble_peripheral_services_count_wrapper: {
        args: ["pointer"],
        returns: "u64",
    },
    simpleble_peripheral_services_get_wrapper: {
        args: ["pointer", "u64", "pointer"],
        returns: "u32",
    },
    simpleble_peripheral_manufacturer_data_count_wrapper: {
        args: ["pointer"],
        returns: "u64",
    },
    simpleble_peripheral_manufacturer_data_get_wrapper: {
        args: ["pointer", "u64", "ptr"],
        returns: "u32",
    },
    simpleble_peripheral_read_wrapper: {
        args: [
            "pointer", // simpleble_peripheral_t handle
            "cstring", // const char* service
            "cstring", // const char* characteristic
            "ptr", // uint8_t** data
            "ptr", // size_t* data_length
        ],
        returns: "u32",
    },
    /*
    simpleble_peripheral_set_callback_on_connected_wrapper: {
      args: [
        "pointer", // simpleble_peripheral_t handle
        "function", // ["pointer", "pointer"]
        "pointer", // void* userdata
      ],
      returns: "u32",
    },
    simpleble_peripheral_set_callback_on_disconnected_wrapper: {
      args: [
        "pointer", // simpleble_peripheral_t handle
        "function", // ["pointer", "pointer"]
        "pointer", // void* userdata
      ],
      returns: "u32",
    },
    */
    simpleble_peripheral_write_request_wrapper: {
        args: [
            "pointer", // simpleble_peripheral_t handle
            "cstring", // const char* service
            "cstring", // const char* characteristic
            "ptr", // uint8_t* data
            "u64", // size_t data_length
        ],
        returns: "u32",
    },
    simpleble_peripheral_write_command_wrapper: {
        args: [
            "pointer", // simpleble_peripheral_t handle
            "cstring", // const char* service
            "cstring", // const char* characteristic
            "ptr", // uint8_t* data
            "u64", // size_t data_length
        ],
        returns: "u32",
    },
    simpleble_peripheral_unsubscribe_wrapper: {
        args: [
            "pointer", // simpleble_peripheral_t handle
            "cstring", // const char* service
            "cstring", // const char* characteristic
        ],
        returns: "u32",
    },
    simpleble_peripheral_read_descriptor_wrapper: {
        args: [
            "pointer", // simpleble_peripheral_t handle
            "cstring", // const char* service
            "cstring", // const char* characteristic
            "cstring", // const char* descriptor
            "ptr", // uint8_t** data
            "ptr", // size_t* data_length
        ],
        returns: "u32",
    },
    simpleble_peripheral_write_descriptor_wrapper: {
        args: [
            "pointer", // simpleble_peripheral_t handle
            "cstring", // const char* service
            "cstring", // const char* characteristic
            "cstring", // const char* descriptor
            "ptr", // uint8_t* data
            "u64", // size_t data_length
        ],
        returns: "u32",
    },
    simpleble_free_wrapper: {
        args: ["pointer"],
        returns: "void",
    },
} as const;
