import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

// `label` names what is being counted (e.g. a dish or "guests") for screen readers.
export default function QuantityStepper({ value, onChange, min = 0, label = 'quantity' }) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, value <= min && styles.btnDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        accessibilityState={{ disabled: value <= min }}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value} accessibilityLabel={`${value} ${label}`}>{value}</Text>
      <Pressable
        style={styles.btn}
        onPress={() => onChange(value + 1)}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

// 44x44 buttons meet the recommended minimum touch target size.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { backgroundColor: colors.border },
  btnText: { color: colors.white, fontSize: 24, lineHeight: 28, fontFamily: fonts.bold },
  value: { minWidth: 36, textAlign: 'center', fontFamily: fonts.bold, fontSize: 18, color: colors.dark },
});
