import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { colors, fonts } from '../theme';

export default function Header({ navigation, avatarUri, initials }) {
  const insets = useSafeAreaInsets();
  const { count } = useCart();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable
        style={({ pressed }) => [styles.side, pressed && { opacity: 0.6 }]}
        onPress={() => navigation.navigate('Cart')}
        accessibilityRole="button"
        accessibilityLabel={count > 0 ? `Open order, ${count} ${count === 1 ? 'item' : 'items'}` : 'Open order, empty'}
      >
        <Ionicons name="cart-outline" size={28} color={colors.primary} />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </Pressable>
      <Image source={require('../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
      <Pressable
        style={({ pressed }) => [styles.side, styles.right, pressed && { opacity: 0.6 }]}
        onPress={() => navigation.navigate('Profile')}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : initials ? (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        ) : (
          <Image source={require('../assets/Profile.png')} style={styles.avatar} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.white,
  },
  side: { width: 48 },
  right: { alignItems: 'flex-end' },
  badge: {
    position: 'absolute', top: -4, left: 18, minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.dark },
  logo: { width: 180, height: 48 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  placeholder: { backgroundColor: colors.sage, justifyContent: 'center', alignItems: 'center' },
  initials: { color: colors.white, fontFamily: fonts.bold, fontSize: 17 },
});
