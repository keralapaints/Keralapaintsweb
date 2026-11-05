type DeviceNavigator = Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };

/** Connection, data-saver and memory hints; these may be missing outside Chromium. */
export function deviceHints(nav: Navigator | undefined = typeof navigator === "undefined" ? undefined : navigator) {
  const device = nav as DeviceNavigator | undefined;
  return {
    saveData: !!device?.connection?.saveData,
    slowConnection: ["slow-2g", "2g", "3g"].includes(device?.connection?.effectiveType ?? ""),
    memory: device?.deviceMemory,
  };
}

/** True when the device reports this much memory (GB) or less; unknown memory is never low. */
export const memoryAtMost = (memory: number | undefined, gigabytes: number) => memory !== undefined && memory <= gigabytes;
