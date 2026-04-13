import React, { useState } from "react"
import { View, Text, TextInput, Button, StyleSheet } from "react-native"
import { joinRide } from "../api/rides"

export default function JoinRideScreen({ navigation }: any) {
  const [rideCode, setRideCode] = useState("")
  const [error, setError] = useState("")
  const [passengerName, setPassengerName] = useState("")

  const handleJoinRide = async () => {
    if (!rideCode.trim()) {
      setError("Please enter a ride code");
      return;
    }
    if (!passengerName.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      const data = await joinRide(rideCode.trim().toUpperCase(), passengerName.trim())

      navigation.navigate("Queue", {
        rideId: data.id
      })

    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to join ride";
      console.error("joinRide error:", err);
      setError(message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Ride 🚗🎵</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Ride Code"
        value={rideCode}
        onChangeText={setRideCode}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        value={passengerName}
        onChangeText={setPassengerName}
      />

      <Button title="Join Ride" onPress={handleJoinRide} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20
  },
  error: {
    color: "red",
    marginTop: 10
  }
})