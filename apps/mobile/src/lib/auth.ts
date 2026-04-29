import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) { localStorage.setItem(key, value); return; }
  return SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) { localStorage.removeItem(key); return; }
  return SecureStore.deleteItemAsync(key);
}

export const getToken = () => getItem("authToken");
export const getDriverId = () => getItem("driverId");

export async function saveAuth(token: string, driverId: string) {
  await Promise.all([setItem("authToken", token), setItem("driverId", driverId)]);
}

export async function clearAuth() {
  await Promise.all([deleteItem("authToken"), deleteItem("driverId")]);
}
