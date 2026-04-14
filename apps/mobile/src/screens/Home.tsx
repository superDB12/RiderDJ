import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createRide } from "../api/rides";

export default function Home({ navigation }: any) {
  const [rideId] = useState(() =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );

  const handleStartRide = async () => {
    try {
      await createRide(rideId);
      navigation.navigate("Driver", { rideId });
    } catch (err) {
      Alert.alert("Error", "Could not create ride. Is the backend running?");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 Start a Ride</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SpotifyConnect", { rideId })}
      >
        <Text style={styles.buttonText}>Connect Spotify</Text>
      </TouchableOpacity>

      {/*<TouchableOpacity
        style={styles.button}
        onPress={handleStartRide}
      >
        <Text style={styles.buttonText}>Start Ride</Text>
      </TouchableOpacity>
      */}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  button: { backgroundColor: "black", padding: 12, margin: 10 },
  buttonText: { color: "white" },
});