import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RoleSelect({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RiderDJ</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>🚗 I'm Driving</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("JoinRide")}
      >
        <Text style={styles.buttonText}>🪑 I'm Riding</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, marginBottom: 40 },

  button: {
    backgroundColor: "black",
    padding: 15,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },

  buttonText: { color: "white", fontSize: 16 },
});