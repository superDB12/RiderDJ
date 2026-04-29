import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login, register } from "../api/auth";
import { saveAuth } from "../lib/auth";
import { colors, glow } from "../theme";

export default function DriverAuth({ navigation }: any) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { token, driverId } = mode === "login"
        ? await login(email.trim(), password)
        : await register(email.trim(), password);
      await saveAuth(token, driverId);
      navigation.replace("Home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.brandLogo}>RiderDJ</Text>
          <Text style={styles.brandTagline}>YOUR RIDE. YOUR MUSIC.</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{mode === "login" ? "Driver Login" : "Create Account"}</Text>
          <Text style={styles.subtitle}>
            {mode === "login" ? "Sign in to manage your rides" : "Set up your driver account"}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.buttonText}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        >
          <Text style={styles.toggleText}>
            {mode === "login" ? "No account? Register here" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    gap: 16,
    paddingVertical: 40,
  },

  brand: {
    marginBottom: 8,
  },

  brandLogo: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 2,
  },

  brandTagline: {
    fontSize: 10,
    letterSpacing: 4,
    color: colors.cyan,
    fontWeight: "600",
    marginTop: 2,
  },

  header: {
    gap: 4,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },

  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },

  button: {
    backgroundColor: colors.purple,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    ...glow.purple,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  toggleButton: {
    alignItems: "center",
    paddingVertical: 8,
  },

  toggleText: {
    color: colors.purple,
    fontSize: 14,
  },
});
