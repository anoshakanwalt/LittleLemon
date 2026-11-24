import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../theme';

const isValidName = (s) => /^[A-Za-z]+$/.test(s.trim());
const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export default function Onboarding({ onDone }) {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const savedFirst = await AsyncStorage.getItem('firstName');
      const savedEmail = await AsyncStorage.getItem('email');
      if (savedFirst) setFirstName(savedFirst);
      if (savedEmail) setEmail(savedEmail);
    })();
  }, []);

  const nameOk = isValidName(firstName);
  const emailOk = isValidEmail(email);
  const canContinue = nameOk && emailOk;

  const saveAndFinish = async () => {
    await AsyncStorage.setItem('firstName', firstName.trim());
    await AsyncStorage.setItem('email', email.trim());
    onDone();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Image source={require('../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Let us get to know you</Text>

        <Text style={styles.label}>First name</Text>
        <TextInput
          style={[styles.input, firstName.length > 0 && !nameOk && styles.inputError]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Your first name"
          accessibilityLabel="First name"
          placeholderTextColor={colors.muted}
        />
        {firstName.length > 0 && !nameOk && (
          <Text style={styles.error}>Use letters only, no spaces or numbers.</Text>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, email.length > 0 && !emailOk && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          accessibilityLabel="Email"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {email.length > 0 && !emailOk && <Text style={styles.error}>Enter a valid email address.</Text>}

        <Pressable
          style={({ pressed }) => [styles.button, !canContinue && styles.buttonDisabled, pressed && canContinue && { opacity: 0.85 }]}
          onPress={saveAndFinish}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={[styles.buttonText, !canContinue && { color: colors.muted }]}>Next</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: { backgroundColor: colors.white, paddingBottom: 14, alignItems: 'center' },
  logo: { width: 204, height: 56 },
  body: { padding: 24 },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.primary, textAlign: 'center', marginVertical: 28 },
  label: { fontFamily: fonts.bold, fontSize: 16, color: colors.dark, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 16, color: colors.dark,
  },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: 13, marginTop: 5 },
  button: { backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 40 },
  buttonDisabled: { backgroundColor: colors.border },
  buttonText: { fontFamily: fonts.bold, fontSize: 18, color: colors.dark },
});
