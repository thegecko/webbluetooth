// @ts-nocheck
import { delay } from "https://deno.land/std@0.158.0/async/mod.ts";
import { bindings } from "../../mod.ts";

const DELAY = 2000;

try {
  const adaptersCount = bindings.simpleble_adapter_get_count();
  if (adaptersCount === 0) {
    console.error("No Bluetooth adapters found");
    Deno.exit(1);
  }

  console.log(`Found ${adaptersCount} adapters`);
  const adapter = bindings.simpleble_adapter_get_handle(0);

  console.log(`Starting scan`);
  bindings.simpleble_adapter_scan_start(adapter);
  await delay(DELAY);
  bindings.simpleble_adapter_scan_stop(adapter);
  console.log(`Finished scan`);

  const resultsCount = bindings.simpleble_adapter_scan_get_results_count(adapter);
  if (resultsCount === 0) {
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
  Deno.exit(0);
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  Deno.exit(1);
}
