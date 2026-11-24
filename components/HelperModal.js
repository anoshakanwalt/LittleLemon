import React, { useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { useCart } from '../context/CartContext';
import { MOODS, APPETITES, recommend } from '../utils/recommend';

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

// `menu` is already filtered by the user's dietary preferences.
export default function HelperModal({ visible, onClose, menu }) {
  const { addItem } = useCart();
  const [mood, setMood] = useState(null);
  const [appetite, setAppetite] = useState(null);
  const [seed, setSeed] = useState(0);

  const plans = useMemo(
    () => (mood && appetite ? recommend(menu, { mood, appetite }) : []),
    [menu, mood, appetite, seed] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const reason = MOODS.find((m) => m.key === mood)?.reason;

  const reset = () => {
    setMood(null);
    setAppetite(null);
  };

  const addPlan = (plan) => {
    plan.items.forEach((item) => addItem(item, 1));
    onClose();
    Alert.alert('Added to your order', `${plan.items.length} dishes added.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close helper" />
        <View style={styles.sheet}>
          <Text style={styles.title}>What should I eat?</Text>
          <Text style={styles.sub}>Two quick questions and we'll pick for you. Your dietary filters apply.</Text>

          <ScrollView>
            <Text style={styles.group}>What's the mood?</Text>
            <View style={styles.row}>
              {MOODS.map((m) => (
                <Chip key={m.key} label={`${m.emoji} ${m.label}`} selected={mood === m.key} onPress={() => setMood(m.key)} />
              ))}
            </View>

            <Text style={styles.group}>How hungry are you?</Text>
            <View style={styles.row}>
              {APPETITES.map((a) => (
                <Chip key={a.key} label={a.label} selected={appetite === a.key} onPress={() => setAppetite(a.key)} />
              ))}
            </View>

            {mood && appetite && (
              <View style={{ marginTop: 8 }}>
                {plans.length === 0 ? (
                  <Text style={styles.empty}>Nothing on the menu fits your filters for that. Try loosening them.</Text>
                ) : (
                  <>
                    <Text style={styles.reason}>{reason}</Text>
                    {plans.map((plan) => (
                      <View key={plan.key} style={styles.card}>
                        {plan.items.map((i) => (
                          <Text key={i.name} style={styles.itemLine}>
                            {i.emoji}  {i.name} <Text style={styles.itemPrice}>${Number(i.price).toFixed(2)}</Text>
                          </Text>
                        ))}
                        <Text style={styles.total}>${plan.total.toFixed(2)} total</Text>
                        <Pressable style={styles.addButton} onPress={() => addPlan(plan)} accessibilityRole="button">
                          <Text style={styles.addText}>Add to my order</Text>
                        </Pressable>
                      </View>
                    ))}
                    <View style={styles.actions}>
                      <Pressable onPress={() => setSeed((s) => s + 1)} accessibilityRole="button">
                        <Text style={styles.link}>🔀 Shuffle</Text>
                      </Pressable>
                      <Pressable onPress={reset} accessibilityRole="button">
                        <Text style={styles.link}>Start over</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>

          <Pressable style={styles.close} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 28, maxHeight: '88%' },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.primary },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 2 },
  group: { fontFamily: fonts.bold, fontSize: 15, color: colors.dark, marginTop: 18, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: colors.light, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 16, marginRight: 10, marginBottom: 10 },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  chipTextSelected: { color: colors.white },
  reason: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted, marginBottom: 4 },
  empty: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, lineHeight: 21 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginTop: 12 },
  itemLine: { fontFamily: fonts.medium, fontSize: 15, color: colors.dark, marginBottom: 4 },
  itemPrice: { fontFamily: fonts.bold, color: colors.primary },
  total: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary, marginTop: 6 },
  addButton: { backgroundColor: colors.secondary, borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 10 },
  addText: { fontFamily: fonts.bold, fontSize: 15, color: colors.dark },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  link: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  close: { alignItems: 'center', paddingTop: 16 },
  closeText: { fontFamily: fonts.bold, fontSize: 15, color: colors.muted },
});
