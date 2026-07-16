import { Capacitor } from "@capacitor/core";

export type NativeStorePlatform = "ios" | "android" | null;

export function getNativeStorePlatform(): NativeStorePlatform {
  if (!Capacitor.isNativePlatform()) return null;
  const platform = Capacitor.getPlatform();
  return platform === "ios" || platform === "android" ? platform : null;
}

export function isNativeStoreApp(): boolean {
  return getNativeStorePlatform() !== null;
}
