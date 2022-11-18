// @ts-nocheck
import { delay } from "https://deno.land/std@0.158.0/async/mod.ts";
import { bindings } from "../../mod.ts";

const SCAN_TIMEOUT = 2000;
const DISCONNECT_TIMEOUT = 5000;

try {
  const adaptersCount = bindings.simpleble_adapter_get_count();
  if (adaptersCount === 0n) {
    console.error("No Bluetooth adapters found");
    Deno.exit(1);
  }

  console.log(`Found ${adaptersCount} adapters`);
  const adapter = bindings.simpleble_adapter_get_handle(0);

  console.log(`Starting scan for ${SCAN_TIMEOUT / 1000} seconds`);
  bindings.simpleble_adapter_scan_start(adapter);
  await delay(SCAN_TIMEOUT);
  bindings.simpleble_adapter_scan_stop(adapter);
  console.log(`Finished scan`);

  const resultsCount = bindings.simpleble_adapter_scan_get_results_count(adapter);
  if (resultsCount === 0n) {
    console.error("No devices found");
    Deno.exit(1);
  }
  console.log(`Found ${resultsCount} devices`);

  for (let i = 0; i < resultsCount; i++) {
    const d = bindings.simpleble_adapter_scan_get_results_handle(adapter, i);
    const id = bindings.simpleble_peripheral_identifier(d);
    const address = bindings.simpleble_peripheral_address(d);
    const str = id.length > 0 ? `${id} [${address}]` : `[${address}]`;
    console.log(`[${i}] - ${str}`);
  }

  const inputString = prompt("Please select a device to connect to:");
  const input = parseInt(inputString || "", 10);
  if (isNaN(input) || input < 0 || input >= resultsCount) {
    console.error("Invalid device selected");
    Deno.exit(1);
  }

  const device = bindings.simpleble_adapter_scan_get_results_handle(adapter, input);
  const connected = bindings.simpleble_peripheral_connect(device);
  if (!connected) {
    console.error("Failed to connect");
    bindings.simpleble_release_handles();
    Deno.exit(1);
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
    console.error("Invalid service selected");
    bindings.simpleble_peripheral_disconnect(device);
    bindings.simpleble_release_handles()
    Deno.exit(1);
  }
  const service = bindings.simpleble_peripheral_services_get(device, serviceNum);

  const charsCount = service.characteristics.length;
  console.log(`Found ${charsCount} characteristics`);
  for (let i = 0; i < charsCount; i++) {
    console.log(`[${i}] ${service.characteristics[i].uuid}`);
    for (let j = 0; j < service.characteristics[i].descriptors.length; j++) {
      console.log(
        `  Descriptor ${j} = ${service.characteristics[i].descriptors[j]}`,
      );
    }
  }

  console.log(`Disconnecting in ${DISCONNECT_TIMEOUT / 1000} seconds`);

  await delay(DISCONNECT_TIMEOUT);

  bindings.simpleble_peripheral_disconnect(device);
  Deno.exit(0);
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  Deno.exit(1);
}
