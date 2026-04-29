import * as SecureStore from "expo-secure-store";

export const getToken = () => SecureStore.getItemAsync("authToken");
export const getDriverId = () => SecureStore.getItemAsync("driverId");

export async function saveAuth(token: string, driverId: string) {
  await Promise.all([
    SecureStore.setItemAsync("authToken", token),
    SecureStore.setItemAsync("driverId", driverId),
  ]);
}

export async function clearAuth() {
  await Promise.all([
    SecureStore.deleteItemAsync("authToken"),
    SecureStore.deleteItemAsync("driverId"),
  ]);
}
