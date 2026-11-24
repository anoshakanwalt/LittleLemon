import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaskedTextInput } from 'react-native-mask-text';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts } from '../theme';
import { useCart } from '../context/CartContext';

const Profile = ({ onLogout }) => {
  const { clear: clearCart } = useCart();
  const [avatarUri, setAvatarUri] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notifications, setNotifications] = useState({
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsletter: true,
  });

  useEffect(() => {
    // Load data on mount
    (async () => {
      const savedAvatar = await AsyncStorage.getItem('avatarUri');
      const savedFirst = await AsyncStorage.getItem('firstName');
      const savedLast = await AsyncStorage.getItem('lastName');
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPhone = await AsyncStorage.getItem('phoneNumber');
      const savedNotifs = await AsyncStorage.getItem('notifications');

      if (savedAvatar) setAvatarUri(savedAvatar);
      if (savedFirst) setFirstName(savedFirst);
      if (savedLast) setLastName(savedLast);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhoneNumber(savedPhone);
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    })();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access media library is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setAvatarUri(null);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveChanges = async () => {
    try {
      await AsyncStorage.multiSet([
        ['avatarUri', avatarUri || ''],
        ['firstName', firstName],
        ['lastName', lastName],
        ['email', email],
        ['phoneNumber', phoneNumber],
        ['notifications', JSON.stringify(notifications)],
      ]);
      Alert.alert('Success', 'Profile saved successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const discardChanges = () => {
    // Reload from AsyncStorage or clear fields - here just reload
    (async () => {
      const savedAvatar = await AsyncStorage.getItem('avatarUri');
      const savedFirst = await AsyncStorage.getItem('firstName');
      const savedLast = await AsyncStorage.getItem('lastName');
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPhone = await AsyncStorage.getItem('phoneNumber');
      const savedNotifs = await AsyncStorage.getItem('notifications');

      setAvatarUri(savedAvatar || null);
      setFirstName(savedFirst || '');
      setLastName(savedLast || '');
      setEmail(savedEmail || '');
      setPhoneNumber(savedPhone || '');
      setNotifications(savedNotifs ? JSON.parse(savedNotifs) : {
        orderStatuses: true,
        passwordChanges: true,
        specialOffers: true,
        newsletter: true,
      });
    })();
  };

  const logout = async () => {
    clearCart();
    onLogout(); // clears storage and returns to Onboarding (handled in App.js)
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Personal information</Text>

      <Text style={styles.label}>Avatar</Text>
      <View style={styles.avatarRow}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} accessibilityLabel="Your profile photo" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>
              {(firstName?.[0] ?? '') + (lastName?.[0] ?? '')}
            </Text>
          </View>
        )}
        <View style={styles.avatarButtons}>
          <TouchableOpacity style={styles.changeButton} onPress={pickImage} accessibilityRole="button" accessibilityLabel="Change profile photo">
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={removeImage} accessibilityRole="button" accessibilityLabel="Remove profile photo">
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>First name</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} accessibilityLabel="First name" />

      <Text style={styles.label}>Last name</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} accessibilityLabel="Last name" />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Email"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone number</Text>
      <MaskedTextInput
        mask="(999) 999-9999"
        keyboardType="phone-pad"
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        accessibilityLabel="Phone number"
      />

      <Text style={[styles.heading, { marginTop: 24 }]}>Email notifications</Text>
      {[
        { key: 'orderStatuses', label: 'Order statuses' },
        { key: 'passwordChanges', label: 'Password changes' },
        { key: 'specialOffers', label: 'Special offers' },
        { key: 'newsletter', label: 'Newsletter' },
      ].map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={styles.checkboxContainer}
          onPress={() => toggleNotification(key)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!notifications[key] }}
          accessibilityLabel={label}
        >
          <View style={[styles.checkbox, notifications[key] && styles.checkboxChecked]}>
            {notifications[key] && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={logout} accessibilityRole="button">
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.discardButton} onPress={discardChanges} accessibilityRole="button">
          <Text style={styles.discardButtonText}>Discard changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveChanges} accessibilityRole="button">
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.white },
  heading: { fontFamily: fonts.display, fontSize: 32, color: colors.primary, marginBottom: 8 },
  label: { fontFamily: fonts.bold, fontSize: 15, marginBottom: 6, marginTop: 14, color: colors.dark },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: 'white', fontFamily: fonts.bold, fontSize: 28 },
  avatarButtons: { flexDirection: 'row' },
  changeButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  changeButtonText: { fontFamily: fonts.bold, color: 'white', fontWeight: '600' },
  removeButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removeButtonText: { fontFamily: fonts.bold, color: colors.primary, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: { color: 'white', fontWeight: '700' },
  checkboxLabel: { fontSize: 16, fontFamily: fonts.body, color: colors.dark },
  logoutButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 28,
    alignItems: 'center',
  },
  logoutButtonText: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 18, color: '#333' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  discardButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  discardButtonText: { fontFamily: fonts.bold, color: colors.primary, fontWeight: '700', fontSize: 16 },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: { fontFamily: fonts.bold, color: 'white', fontWeight: '700', fontSize: 16 },
});

export default Profile;