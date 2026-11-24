import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { DIET_OPTIONS, AVOID_OPTIONS, EMPTY_PREFS } from '../utils/menu';

const Chip = ({ label, selected, onPress }) => (
  <Pressable
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

export default function FiltersModal({ visible, onClose, prefs, onChange }) {
  const toggle = (group, key) => {
    const list = prefs[group];
    onChange({ ...prefs, [group]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close filters" />
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Dietary filters</Text>
            <Pressable onPress={() => onChange(EMPTY_PREFS)} accessibilityRole="button">
              <Text style={styles.clear}>Clear all</Text>
            </Pressable>
          </View>

          <ScrollView>
            <Text style={styles.group}>I eat</Text>
            <View style={styles.row}>
              {DIET_OPTIONS.map((o) => (
                <Chip key={o.key} label={o.label} selected={prefs.diets.includes(o.key)} onPress={() => toggle('diets', o.key)} />
              ))}
            </View>

            <Text style={styles.group}>Hide dishes containing</Text>
            <View style={styles.row}>
              {AVOID_OPTIONS.map((o) => (
                <Chip key={o.key} label={o.label} selected={prefs.avoid.includes(o.key)} onPress={() => toggle('avoid', o.key)} />
              ))}
            </View>

            <Text style={styles.disclaimer}>
              Dietary and allergen details in this demo are sample data. In a real restaurant, always confirm
              allergens with the staff.
            </Text>
          </ScrollView>

          <Pressable style={styles.done} onPress={onClose} accessibilityRole="button">
            <Text style={styles.doneText}>Show dishes</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 32, maxHeight: '80%' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.primary },
  clear: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  group: { fontFamily: fonts.bold, fontSize: 15, color: colors.dark, marginTop: 18, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: colors.light, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 16, marginRight: 10, marginBottom: 10 },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  chipTextSelected: { color: colors.white },
  disclaimer: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 14, lineHeight: 17 },
  done: { backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  doneText: { fontFamily: fonts.bold, fontSize: 17, color: colors.dark },
});
