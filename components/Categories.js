import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { colors, fonts } from '../theme';

// `categories` is the list of category names (e.g. 'starters'); null selected means "All".
export default function Categories({ categories, selectedCategory, setSelectedCategory }) {
  const label = (c) => c.charAt(0).toUpperCase() + c.slice(1);
  const chips = [null, ...categories];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Pressable
            key={category ?? 'all'}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => setSelectedCategory(category)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${category ? label(category) : 'All'} category`}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {category ? label(category) : 'All'}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 20, paddingVertical: 4 },
  chip: { backgroundColor: colors.light, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 20, marginRight: 10 },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: 15, fontFamily: fonts.bold, color: colors.primary },
  chipTextSelected: { color: colors.white },
});
