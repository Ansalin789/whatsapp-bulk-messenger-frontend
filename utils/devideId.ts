export const getDeviceId = (): string => {
  if (typeof window === "undefined") {
    return "server-side";
  }
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};
