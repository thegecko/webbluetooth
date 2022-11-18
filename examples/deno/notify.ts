// @ts-nocheck
import { delay } from "https://deno.land/std@0.158.0/async/mod.ts";
import { bindings } from "../../mod.ts";

function delay(ms: number): Promise<void> {
  return new Promise((resolve): void => {
    // No need to keep the return value.
    setTimeout(resolve, ms);
  });
}

const SCAN_TIMEOUT = 2000;
const DISCONNECT_TIMEOUT = 5000;

try {
  const adaptersCount = bindings.simpleble_adapter_get_count();
  if (adaptersCount === 0) {
    throw new Error("No Bluetooth adapters found");
  }

  console.log(`Found ${adaptersCount} adapters`);
  const adapter = bindings.simpleble_adapter_get_handle(0);

  console.log(`Starting scan for ${SCAN_TIMEOUT / 1000} seconds`);
  bindings.simpleble_adapter_scan_start(adapter);
  await delay(SCAN_TIMEOUT);
  bindings.simpleble_adapter_scan_stop(adapter);
  console.log(`Finished scan`);

  const resultsCount = bindings.simpleble_adapter_scan_get_results_count(adapter);
  if (resultsCount === 0) {
    throw new Error("No devices found");
  }
  console.log(`Found ${resultsCount} devices`);

  for (let i = 0; i < resultsCount; i++) {
    const d = bindings.simpleble_adapter_scan_get_results_handle(adapter, i);
    const id = bindings.simpleble_peripheral_identifier(d);
    const address = bindings.simpleble_peripheral_address(d);
    const str = id.length > 0 ? `${id} [${address}]` : `[${address}]`;
    console.log(`[${i}] - ${str}`);
  }

  const indexString = prompt("Please select a device to connect to:");
  const index = parseInt(indexString || "", 10);
  if (isNaN(index) || index < 0 || index >= resultsCount) {
    throw new Error("Invalid device selected");
  }

  const device = bindings.simpleble_adapter_scan_get_results_handle(adapter, index);
  const connected = bindings.simpleble_peripheral_connect(device);
  if (!connected) {
    throw new Error("Failed to connect");
  }

  const servicesCount = bindings.simpleble_peripheral_services_count(device);
  console.log(`Found ${servicesCount} services`);
  for (let i = 0; i < servicesCount; i++) {
    const service = bindings.simpleble_peripheral_services_get(device, i);
    console.log(`[${i}] - ${service.uuid}`);
  }

  const serviceString = prompt("Please select a service:");
  const serviceNum = parseInt(serviceString || "", 10);
  if (isNaN(serviceNum) || serviceNum < 0 || serviceNum >= servicesCount) {
    bindings.simpleble_peripheral_disconnect(device);
    throw new Error("Invalid service selected");
  }
  const service = bindings.simpleble_peripheral_services_get(device, serviceNum);

  const charsCount = service.characteristics.length;
  console.log(`Found ${charsCount} characteristics`);
  for (let i = 0; i < charsCount; i++) {
    console.log(`[${i}] ${service.characteristics[i].uuid}`);
  }

  const charString = prompt("Please select a characteristic:");
  const charNum = parseInt(charString || "", 10);
  if (isNaN(charNum) || charNum < 0 || charNum >= charsCount) {
    bindings.simpleble_peripheral_disconnect(device);
    throw new Error("Invalid characteristic selected");
  }
  const char = service.characteristics[charNum];

  const registered = simpleble_peripheral_notify(device, service.uuid, char.uuid, (_service: string, _characteristic: string, data: Uint8Array) => {
    const nums: string[] = [];
    data.forEach((num) => {
      nums.push(num.toString(16).padStart(2, "0"));
    });
    const arr = nums.join(" ");
    console.log(`Received: ${arr}`);
  }, null);
  if (!registered) {
    console.error("Failed to register notify callback");
    simpleble_peripheral_disconnect(device);
    simpleble_release_handles();
    Deno.exit(1);
  }

  console.log(`Disconnecting in ${DISCONNECT_TIMEOUT / 1000} seconds`);

  await delay(DISCONNECT_TIMEOUT);
  console.log("Finished - preparing to disconnect");
  bindings.simpleble_peripheral_unsubscribe(device, service.uuid, char.uuid);
  bindings.simpleble_peripheral_disconnect(device);
  process.exit(0);
} catch (err: any) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
