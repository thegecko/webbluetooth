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
import { ptr, CString, dlopen, toArrayBuffer } from "bun:ffi";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { Bindings } from "./bindings.ts";
import { symbols } from "./symbols.bun.ts";
import pkg from "../package.json" assert { type: "json" };

import type { Library } from "bun:ffi";

const LIBNAME = "simpleble";

const UUID_STRUCT_SIZE = 37;
//const SERVICE_STRUCT_SIZE = 10288;
const SERVICE_STRUCT_SIZE = 10416;
const MANUFACTURER_SIZE = 40;
const DESCRIPTOR_STRUCT_SIZE = 37;
const SERVICE_CHAR_COUNT_OFFSET = 40;
const SERVICE_CHARS_OFFSET = 48;
// Was 640
const CHARACTERISTIC_STRUCT_SIZE = 648; // sizeof(simpleble_characteristic_t)
const CHAR_DESC_COUNT_OFFSET = 40; // simpleble_characteristic_t.descriptor_count
// Was 48
const CHAR_DESCRIPTORS_OFFSET = 56; // simpleble_characteristic_t.descriptors

/** SimpleBLE Adapter. */
export type Adapter = bigint;
/** SimpleBLE Peripheral. */
export type Peripheral = bigint;
/** SimpleBLE UserData. */
export type UserData = bigint | null;

/** SimpleBLE Characteristic. */
export interface Characteristic {
  uuid: string;
  descriptors: string[];
}

/** A Bluetooth service. */
export interface Service {
  uuid: string;
  characteristics: Characteristic[];
}

/** Bluetooth manufacturer data. */
export interface ManufacturerData {
  id: number;
  data: Uint8Array;
}


/** FFI symbols. */
let lib: Library;

/** Load locally or remotely depending on if this file is HTTP-hosted. */
const PRODUCTION = !import.meta.url.includes("file://");

/** Global {@link cstr} encoder. */
const encoder = new TextEncoder();

/**
 * All active instances. This is used internally for automatically
 * destroying all instances once {@link unload} is called.
 */
const instances: DenoBindings[] = [];

/**
 * Unload the library and destroy all SimpleBLE instances. Should be called
 * automatically.
 */
function unload(): void {
  for (const instance of instances) {
    instance.destroy();
  }
  lib?.close();
}

self.addEventListener("unload", unload);

async function resolvePath() {
  let cacheDir = "";
  let libName = "";
  const home = homedir();

  switch (process.platform) {
    case "win32":
      libName = `${LIBNAME}.dll`;
      cacheDir = join(home, "bun");
      break;
    case "darwin":
      libName = `lib${LIBNAME}.dylib`;
      cacheDir = join(home, "Library", "Caches", "bun");
      break;
    default:
      libName = `lib${LIBNAME}.so`;
      cacheDir = join(home, ".cache", "bun");
  }

  const url = `${pkg.repository.url}/releases/download/v${pkg.version}/${libName}`;
  const hash = Bun.sha(url, "hex");

  const localFile = join(Bun.cwd, "build", "Release", libName);
  const cachedFile = join(cacheDir, hash);

  if (existsSync(localFile)) {
    return localFile;
  } else if (existsSync(cachedFile)) {
    return cachedFile;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const buffer = await response.arrayBuffer();
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cachedFile, new Uint8Array(buffer));
  } catch (err) {
    throw new Error(`Error while downloading library: ${err.message}`);
  }

  return cachedFile;
}

/** @hidden SimpleBLE bindings for Bun. */
export class SimpleBLE implements Bindings {
  #adapters: Set<Adapter> = new Set();
  #peripherals: Set<Peripheral> = new Set();
  /*
  #callbacks: Map<
    string,
    Deno.UnsafeCallback<{
      parameters: ("buffer" | "pointer" | "usize")[];
      result: "void";
    }>
  > = new Map();
  */

  /** Creates a new FFI instance. */
  constructor() {
    instances.push(this);
  }

  static async load(): Promise<SimpleBLE> {
    if (!lib) {
      const libPath = await resolvePath();
      lib = dlopen(libPath, symbols);
    }

    return new SimpleBLE();
  }

  /** Releases all resources. */
  destroy(): void {
    for (const callback of Object.keys(this.#callbacks)) {
      this.#unbind(callback);
    }

    for (const handle of this.#peripherals) {
      this.simpleble_peripheral_release_handle(handle);
    }

    for (const handle of this.#adapters) {
      this.simpleble_adapter_release_handle(handle);
    }
  }

  /**
   * Unbinds a previously bound function freeing its resource and removing it
   * from the webview JavaScript context.
   *
   * @param _name The name of the bound function
   */
  #unbind(_name: string): void {
    /*
    this.#callbacks.get(name)?.close();
    this.#callbacks.delete(name);
    */
  }

  /** Returns if one or more Bluetooth adapters are enabled. */
  simpleble_adapter_is_bluetooth_enabled(): boolean {
    const ret = lib.symbols.simpleble_adapter_is_bluetooth_enabled_wrapper();
    return ret > 0 ? false : true;
  }

  /** Returns the number of adapters found. */
  simpleble_adapter_get_count(): number {
    return lib.symbols.simpleble_adapter_get_count_wrapper() as number;
  }

  /** Get a handle for an adapter. */
  simpleble_adapter_get_handle(index: number): Adapter {
    const ret = lib.symbols.simpleble_adapter_get_handle_wrapper(index);
    this.#adapters.add(ret);
    return ret;
  }

  /** Release an adapter. */
  simpleble_adapter_release_handle(handle: Adapter): void {
    this.#adapters.delete(handle);
    lib.symbols.simpleble_adapter_release_handle_wrapper(handle);
  }

  /** Returns the name of an adapter. */
  simpleble_adapter_identifier(handle: Adapter): string {
    const ptr = lib.symbols.simpleble_adapter_identifier_wrapper(handle);
    const cstr = new CString(ptr);
    this.simpleble_free(ptr);
    return cstr;
  }

  /** Returns the MAC address of an adapter. */
  simpleble_adapter_address(handle: Adapter): string {
    const ptr = lib.symbols.simpleble_adapter_address_wrapper(handle);
    const cstr = new CString(ptr);
    this.simpleble_free(ptr);
    return cstr;
  }

  /**
   * Begin scanning (with timeout).
   *
   * **NOTE**: This function blocks until the timeout is reached.
   * @param timeout Timeout (in milliseconds).
   */
  simpleble_adapter_scan_for(
    handle: Adapter,
    timeout: number,
  ): boolean {
    const ret = lib.symbols.simpleble_adapter_scan_for_wrapper(handle, timeout);
    return ret > 0 ? false : true;
  }

  /** Begin scanning. */
  simpleble_adapter_scan_start(handle: Adapter): boolean {
    const ret = lib.symbols.simpleble_adapter_scan_start_wrapper(handle);
    return ret > 0 ? false : true;
  }
  /** Stop scanning. */
  simpleble_adapter_scan_stop(handle: Adapter): boolean {
    const ret = lib.symbols.simpleble_adapter_scan_stop_wrapper(handle);
    return ret > 0 ? false : true;
  }
  /** Returns the scanning status. */
  simpleble_adapter_scan_is_active(handle: Adapter): boolean {
    const isActive = new Uint8Array(1);
    const ret = lib.symbols.simpleble_adapter_scan_is_active_wrapper(handle, isActive);
    if (ret > 0) {
      return false;
    }
    const active = isActive[0];
    return Boolean(active);
  }
  /** Returns the number of devices found. */
  simpleble_adapter_scan_get_results_count(
    handle: Adapter,
  ): number {
    return lib.symbols.simpleble_adapter_scan_get_results_count_wrapper(handle) as number;
  }
  /** Returns a handle for a peripheral device. */
  simpleble_adapter_scan_get_results_handle(
    handle: Adapter,
    index: number,
  ): Peripheral {
    const ret = lib.symbols.simpleble_adapter_scan_get_results_handle_wrapper(handle, index);
    this.#peripherals.add(ret);
    return ret;
  }
  /** Returns the number of paired devices. */
  simpleble_adapter_get_paired_peripherals_count(
    handle: Adapter,
  ): number {
    return lib.symbols.simpleble_adapter_get_paired_peripherals_count_wrapper(handle) as number;
  }
  /** Returns a handle to a paired device. */
  simpleble_adapter_get_paired_peripherals_handle(
    handle: Adapter,
    index: number,
  ): Peripheral {
    return lib.symbols.simpleble_adapter_get_paired_peripherals_handle_wrapper(
      handle,
      index,
    );
  }

  /** Register a callback for when a peripheral is found. */
  simpleble_adapter_set_callback_on_scan_found(
    handle: Adapter,
    cb: (adapter: Adapter, peripheral: Peripheral, userdata: UserData) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_adapter_set_callback_on_scan_found is not implemented yet");
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer", "pointer"],
        result: "void",
      },
      (handlePtr: Deno.PointerValue, peripheralPtr: Deno.PointerValue, userdataPtr: UserData) => {
        cb(handlePtr, peripheralPtr, userdataPtr);
      },
    );
    const key = `${handle}-onfound`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_adapter_set_callback_on_scan_found_wrapper(
      handle,
      cbResource.pointer,
      userdata ?? 0n,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Register a callback for when scanning begins. */
  simpleble_adapter_set_callback_on_scan_start(
    handle: Adapter,
    cb: (adapter: Adapter, userdata: UserData) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_adapter_set_callback_on_scan_start is not implemented yet")
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer"],
        result: "void",
      },
      (handlePtr: Deno.PointerValue, userdataPtr: Deno.PointerValue) => {
        cb(handlePtr, userdataPtr);
      },
    );
    const key = `${handle}-onstart`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_adapter_set_callback_on_scan_start_wrapper(
      handle,
      cbResource.pointer,
      userdata,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Register a callback for when scanning stops. */
  simpleble_adapter_set_callback_on_scan_stop_wrapper(
    handle: Adapter,
    cb: (adapter: Adapter, userdata: UserData) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_adapter_set_callback_on_scan_stop_wrapper is not implemented yet");
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer"],
        result: "void",
      },
      (handlePtr: Deno.PointerValue, userdataPtr: Deno.PointerValue) => {
        cb(handlePtr, userdataPtr);
      },
    );
    const key = `${handle}-onstop`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_adapter_set_callback_on_scan_stop_wrapper(
      handle,
      cbResource.pointer,
      userdata,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Register a callback for when an adapter is updated. */
  simpleble_adapter_set_callback_on_scan_updated(
    handle: Adapter,
    cb: (adapter: Adapter, peripheral: Peripheral, userdata: UserData) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_adapter_set_callback_on_scan_updated is not implemented yet");
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer", "pointer"],
        result: "void",
      },
      (handlePtr: Deno.PointerValue, peripheralPtr: Deno.PointerValue, userdataPtr: Deno.PointerValue) => {
        cb(handlePtr, peripheralPtr, userdataPtr);
      },
    );
    const key = `${handle}-onupdated`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_adapter_set_callback_on_scan_updated_wrapper(
      handle,
      cbResource.pointer,
      userdata,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Releases a peripheral device handle. */
  simpleble_peripheral_release_handle(handle: Peripheral): void {
    this.#peripherals.delete(handle);
    lib.symbols.simpleble_peripheral_release_handle_wrapper(handle);
  }
  /** Returns the ID of a peripheral. */
  simpleble_peripheral_identifier(handle: Peripheral): string {
    const ret = lib.symbols.simpleble_peripheral_identifier_wrapper(handle);
    const cstr = new CString(ret);
    this.simpleble_free(ret);
    return cstr;
  }
  /** Returns the MAC address of a peripheral. */
  simpleble_peripheral_address(handle: Peripheral): string {
    const ret = lib.symbols.simpleble_peripheral_address_wrapper(handle);
    const cstr = new CString(ret);
    this.simpleble_free(ret);
    return cstr;
  }
  /** Returns the RSSI (signal strength) of a peripheral. */
  simpleble_peripheral_rssi(handle: Peripheral): number {
    return lib.symbols.simpleble_peripheral_rssi_wrapper(handle);
  }
  /** Returns the MTU (Maximum Transmission Unit) of a peripheral. */
  simpleble_peripheral_rssi(handle: Peripheral): number {
    return lib.symbols.simpleble_peripheral_mtu_wrapper(handle);
  }
  /** Begins connecting to a peripheral. */
  simpleble_peripheral_connect(handle: Peripheral): boolean {
    const ret = lib.symbols.simpleble_peripheral_connect_wrapper(handle);
    return ret > 0 ? false : true;
  }
  /** Disconnects from a peripheral. */
  simpleble_peripheral_disconnect(handle: Peripheral): boolean {
    const ret = lib.symbols.simpleble_peripheral_disconnect_wrapper(handle);
    return ret > 0 ? false : true;
  }
  /** Returns true if a peripheral is currently connected. */
  simpleble_peripheral_is_connected(handle: Peripheral): boolean {
    const result = new Uint8Array(1);
    const ret = lib.symbols.simpleble_peripheral_is_connected_wrapper(handle, result);
    return ret === 0 && Boolean(result[0]);
  }
  /** Returns true if a peripheral can be connected to. */
  simpleble_peripheral_is_connectable(
    handle: Peripheral,
  ): boolean {
    const result = new Uint8Array(1);
    const ret = lib.symbols.simpleble_peripheral_is_connectable_wrapper(handle, result);
    return ret === 0 && Boolean(result[0]);
  }
  /** Returns true if a peripheral is already paired. */
  simpleble_peripheral_is_paired(handle: Peripheral): boolean {
    const result = new Uint8Array(1);
    const ret = lib.symbols.simpleble_peripheral_is_paired_wrapper(handle, result);
    return ret === 0 && Boolean(result[0]);
  }
  /** Unpair a peripheral. */
  simpleble_peripheral_unpair(handle: Peripheral): boolean {
    const ret = lib.symbols.simpleble_peripheral_unpair_wrapper(handle);
    return ret > 0 ? false : true;
  }
  /** Returns the number of services a peripheral has. */
  simpleble_peripheral_services_count(
    handle: Peripheral,
  ): number {
    return lib.symbols.simpleble_peripheral_services_count_wrapper(handle) as number;
  }

  /** Returns a {@link Service} found on a peripheral. */
  simpleble_peripheral_services_get(
    handle: Peripheral,
    index: number,
  ): Service {
    const u8 = new Uint8Array(SERVICE_STRUCT_SIZE);
    const services = ptr(u8);

    const err = lib.symbols.simpleble_peripheral_services_get_wrapper(handle, index, services);
    if (err !== 0) {
      return {
        uuid: "",
        characteristics: [],
      };
    }

    const characteristics: Characteristic[] = [];
    const uuid = new CString(services, 0, UUID_STRUCT_SIZE - 1);
    const view = new DataView(toArrayBuffer(services, 0, SERVICE_STRUCT_SIZE));

    const charsCount = view.getBigUint64(SERVICE_CHAR_COUNT_OFFSET);
    for (let i = 0; i < charsCount; i++) {
      const charsOffset = SERVICE_CHARS_OFFSET + (i * CHARACTERISTIC_STRUCT_SIZE);
      const charUuid = new CString(services, charsOffset, UUID_STRUCT_SIZE - 1);

      const descCountOffset = charsOffset + CHAR_DESC_COUNT_OFFSET;
      const descriptorsCount = view.getBigUint64(descCountOffset);

      const descriptorUuids: string[] = [];

      for (let j = 0; j < descriptorsCount; j++) {
        const descOffset = charsOffset + CHAR_DESCRIPTORS_OFFSET +
          (DESCRIPTOR_STRUCT_SIZE * i);
        const descUuid = new CString(services, descOffset, DESCRIPTOR_STRUCT_SIZE - 1);
        descriptorUuids.push(descUuid);
      }

      characteristics.push({
        uuid: charUuid,
        descriptors: descriptorUuids,
      });
    }

    return { uuid, characteristics };
  }

  /** Returns the size of the manufacturer data. */
  simpleble_peripheral_manufacturer_data_count(
    handle: Peripheral,
  ): number {
    return lib.symbols.simpleble_peripheral_manufacturer_data_count_wrapper(handle) as number;
  }

  /** Returns the manufacturer data for device. */
  simpleble_peripheral_manufacturer_data_get(
    handle: Peripheral,
    index: number,
  ): ManufacturerData | undefined {
    const struct = new Uint8Array(MANUFACTURER_SIZE + 1);
    const view = new DataView(struct.buffer);

    const err = lib.symbols.simpleble_peripheral_manufacturer_data_get_wrapper(
      handle,
      index,
      ptr(struct),
    );
    if (err !== 0) return undefined;

    const id = view.getUint16(0, true);
    const dataLength = Number(view.getBigUint64(8, true));
    if (dataLength > 24) {
      //throw new Error("Invalid data length");
    }

    const data = dataLength > 0
      ? struct.slice(16, 16 + dataLength)
      : new Uint8Array(0);

    return { id, data };
  }

  /** Read data from a service characteristic. */
  simpleble_peripheral_read(
    handle: Peripheral,
    service: string,
    characteristic: string,
  ): Uint8Array | undefined {
    const dataPtr = new BigUint64Array(1);
    const lengthPtr = new BigUint64Array(1);

    const err = lib.symbols.simpleble_peripheral_read_wrapper(
      handle,
      Buffer.from(service, "utf-8"),
      Buffer.from(characteristic, "utf-8"),
      ptr(dataPtr),
      ptr(lengthPtr),
    );
    if (err !== 0) return undefined;

    const dataLength = Number(lengthPtr[0]);
    const ab = toArrayBuffer(Number(dataPtr[0]), 0, dataLength);
    const data = new Uint8Array(ab)

    return data;
  }

  /** Write data to a characteristic (no response). */
  simpleble_peripheral_write_request(
    handle: Peripheral,
    service: string,
    characteristic: string,
    data: Uint8Array,
  ): boolean {
    const err = lib.symbols.simpleble_peripheral_write_request_wrapper(
      handle,
      cstr(service),
      cstr(characteristic),
      data,
      data.length,
    );
    if (err !== 0) return false;

    return true;
  }

  /** Write data to a characteristic (response required). */
  simpleble_peripheral_write_command(
    handle: Peripheral,
    service: string,
    characteristic: string,
    data: Uint8Array,
  ): boolean {
    const err = lib.symbols.simpleble_peripheral_write_command_wrapper(
      handle,
      Buffer.from(service, "utf-8"),
      Buffer.from(characteristic, "utf-8"),
      ptr(data),
      data.length,
    );
    if (err !== 0) return false;

    return true;
  }

  /** Stop listening for characteristic value changes. */
  simpleble_peripheral_unsubscribe(
    handle: Peripheral,
    service: string,
    characteristic: string,
  ): boolean {
    const err = lib.symbols.simpleble_peripheral_unsubscribe_wrapper(
      handle,
      Buffer.from(service, "utf-8"),
      Buffer.from(characteristic, "utf-8"),
    );
    if (err !== 0) return false;

    return true;
  }

  /** Register a callback for peripheral indications. */
  simpleble_peripheral_indicate(
    handle: Peripheral,
    service: string,
    characteristic: string,
    cb: (
      service: string,
      characteristic: string,
      data: Uint8Array,
      userdata: UserData,
    ) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_peripheral_indicate is not implemented yet");
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["buffer", "buffer", "buffer", "usize", "pointer"],
        result: "void",
      },
      (
        servicePtr: Deno.PointerValue,
        charPtr: Deno.PointerValue,
        dataPtr: Deno.PointerValue,
        dataSize: Deno.PointerValue,
        userdataPtr: Deno.PointerValue | null,
      ) => {
        const service = new Deno.UnsafePointerView(BigInt(servicePtr)).getCString();
        const char = new Deno.UnsafePointerView(BigInt(charPtr)).getCString();
        const data = new Uint8Array(Number(dataSize));
        const dataView = new Deno.UnsafePointerView(BigInt(dataPtr));
        dataView.copyInto(data);
        cb(service, char, data, userdataPtr);
      },
    );
    const key = `${handle}-${service}-${characteristic}-indicate`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_peripheral_indicate_wrapper(
      handle,
      cstr(service),
      cstr(characteristic),
      cbResource.pointer,
      userdata ?? 0n,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Register a callback for peripheral notifications. */
  simpleble_peripheral_notify(
    handle: Peripheral,
    service: string,
    characteristic: string,
    cb: (
      service: string,
      characteristic: string,
      data: Uint8Array
    ) => void,
  ): boolean {
    throw new Error("simpleble_peripheral_notify is not implemented yet");
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["buffer", "usize"],
        result: "void",
      },
      (
        dataPtr: Deno.PointerValue,
        dataSize: Deno.PointerValue,
      ) => {
        const data = new Uint8Array(Number(dataSize));
        const dataView = new Deno.UnsafePointerView(BigInt(dataPtr));
        dataView.copyInto(data);
        cb(service, characteristic, data);
      },
    );
    const key = `${handle}-${service}-${characteristic}-notify`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_peripheral_notify_wrapper(
      handle,
      cstr(service),
      cstr(characteristic),
      cbResource.pointer ?? 0n,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Register a callback for when a peripheral is connected. */
  simpleble_peripheral_set_callback_on_connected(
    handle: Peripheral,
    cb: (peripheral: Peripheral, userdata: UserData) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_peripheral_set_callback_on_connected is not implemented yet")
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer"],
        result: "void",
      },
      (handlePtr: Deno.PointerValue, userdataPtr: Deno.PointerValue) => {
        cb(handlePtr, userdataPtr);
      },
    );
    const key = `${handle}-onconnected`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_peripheral_set_callback_on_connected_wrapper(
      handle,
      cbResource.pointer,
      userdata,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Register a callback for when a peripheral is disconnected. */
  simpleble_peripheral_set_callback_on_disconnected(
    handle: Peripheral,
    cb: (peripheral: Peripheral, userdata: UserData) => void,
    userdata: UserData = null,
  ): boolean {
    throw new Error("simpleble_peripheral_set_callback_on_disconnected is not implemented yet");
    /*
    const cbResource = new Deno.UnsafeCallback(
      {
        parameters: ["pointer", "pointer"],
        result: "void",
      },
      (handlePtr: Deno.PointerValue, userdataPtr: Deno.PointerValue) => {
        cb(handlePtr, userdataPtr);
      },
    );
    const key = `${handle}-ondisconnected`;
    this.#callbacks.set(key, cbResource);
    const ret = lib.symbols.simpleble_peripheral_set_callback_on_disconnected_wrapper(
      handle,
      cbResource.pointer,
      userdata,
    );
    return ret > 0 ? false : true;
    */
  }

  /** Read data from a descriptor. */
  simpleble_peripheral_read_descriptor(
    handle: Peripheral,
    service: string,
    characteristic: string,
    descriptor: string,
  ): Uint8Array | undefined {
    const dataPtr = new BigUint64Array(1);
    const lengthPtr = new BigUint64Array(1);

    const err = lib.symbols.simpleble_peripheral_read_descriptor_wrapper(
      handle,
      Buffer.from(service, "utf-8"),
      Buffer.from(characteristic, "utf-8"),
      Buffer.from(descriptor, "utf-8"),
      ptr(dataPtr),
      ptr(lengthPtr),
    );
    if (err !== 0) return undefined;

    const dataLength = Number(lengthPtr[0]);
    const ab = toArrayBuffer(dataPtr[0], 0, dataLength);
    const data = new Uint8Array(ab);

    return data;
  }

  /** Write data to a descriptor. */
  simpleble_peripheral_write_descriptor(
    handle: Peripheral,
    service: string,
    characteristic: string,
    descriptor: string,
    data: Uint8Array,
  ): boolean {
    const err = lib.symbols.simpleble_peripheral_write_descriptor_wrapper(
      handle,
      Buffer.from(service, "utf-8"),
      Buffer.from(characteristic, "utf-8"),
      Buffer.from(descriptor, "utf-8"),
      ptr(data),
      data.length,
    );
    if (err !== 0) return false;

    return true;
  }

  /** Deallocate memory for a SimpleBLE-C handle. */
  simpleble_free(handle: Deno.PointerValue): void {
    lib.symbols.simpleble_free_wrapper(handle);
  }
}
