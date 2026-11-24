import React, { useMemo, useState } from 'react';
import {
  View, Text, Modal, Pressable, ScrollView, TextInput, Alert, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, fonts } from '../theme';
import QuantityStepper from './QuantityStepper';
import { useCart } from '../context/CartContext';
import { suggestMeals, cheapestMain } from '../utils/menu';

// `menu` is already filtered by the user's dietary preferences.
export default function BudgetModal({ visible, onClose, menu }) {
  const { addItem } = useCart();
  const [budgetText, setBudgetText] = useState('');
  const [people, setPeople] = useState(2);

  const budget = parseFloat(budgetText.replace(',', '.'));
  const hasBudget = !Number.isNaN(budget) && budget > 0;
  const perPerson = hasBudget ? budget / people : 0;

  const meals = useMemo(() => (hasBudget ? suggestMeals(menu, perPerson) : []), [menu, hasBudget, perPerson]);
  const minMain = useMemo(() => cheapestMain(menu), [menu]);

  const addMeal = (meal) => {
    meal.items.forEach((item) => addItem(item, people));
    onClose();
    Alert.alert('Added to your order', `${meal.items.length} dishes × ${people} added.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close budget planner" />
        <View style={styles.sheet}>
          <Text style={styles.title}>Budget planner</Text>
          <Text style={styles.sub}>Tell us your budget and group size, and we'll build a meal that fits.</Text>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Total budget ($)</Text>
              <TextInput
                style={styles.input}
                value={budgetText}
                onChangeText={setBudgetText}
                placeholder="e.g. 60"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                accessibilityLabel="Total budget in dollars"
              />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.label}>People</Text>
              <QuantityStepper value={people} onChange={setPeople} min={1} label="people" />
            </View>
          </View>

          {hasBudget && <Text style={styles.perPerson}>≈ ${perPerson.toFixed(2)} per person</Text>}

          <ScrollView style={{ marginTop: 8 }} keyboardShouldPersistTaps="handled">
            {hasBudget && meals.length === 0 && (
              <Text style={styles.empty}>
                Nothing fits that budget with your current filters.
                {minMain != null ? ` The cheapest main is $${minMain.toFixed(2)} per person.` : ' No mains match your filters.'}
              </Text>
            )}
            {meals.map((meal, idx) => (
              <View key={idx} style={styles.card}>
                {meal.items.map((i) => (
                  <Text key={i.name} style={styles.itemLine}>
                    {i.emoji}  {i.name} <Text style={styles.itemPrice}>${Number(i.price).toFixed(2)}</Text>
                  </Text>
                ))}
                <Text style={styles.cardTotal}>
                  ${meal.total.toFixed(2)} per person · ${(meal.total * people).toFixed(2)} for {people}
                </Text>
                <Pressable style={styles.addButton} onPress={() => addMeal(meal)} accessibilityRole="button">
                  <Text style={styles.addText}>Add for {people} to my order</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.close} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 28, maxHeight: '88%' },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.primary },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.dark, marginBottom: 6 },
  input: { backgroundColor: colors.light, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 17, color: colors.dark },
  perPerson: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary, marginTop: 12 },
  empty: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, marginTop: 14, lineHeight: 21 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginTop: 12 },
  itemLine: { fontFamily: fonts.medium, fontSize: 15, color: colors.dark, marginBottom: 4 },
  itemPrice: { fontFamily: fonts.bold, color: colors.primary },
  cardTotal: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary, marginTop: 8 },
  addButton: { backgroundColor: colors.secondary, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 10 },
  addText: { fontFamily: fonts.bold, fontSize: 15, color: colors.dark },
  close: { alignItems: 'center', paddingTop: 16 },
  closeText: { fontFamily: fonts.bold, fontSize: 15, color: colors.muted },
});
