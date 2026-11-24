import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import MenuImage from '../components/MenuImage';
import QuantityStepper from '../components/QuantityStepper';
import { useCart } from '../context/CartContext';
import { colors, fonts } from '../theme';
import { tagsFor, containsText } from '../utils/menu';

export default function ItemDetails({ route, navigation }) {
  const { item } = route.params;
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const total = (Number(item.price) * qty).toFixed(2);

  const add = () => {
    addItem(item, qty);
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <MenuImage item={item} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.tagRow}>
            {tagsFor(item).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.contains}>{containsText(item)}</Text>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <QuantityStepper value={qty} onChange={setQty} min={1} label={item.name} />
        <Pressable style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.85 }]} onPress={add} accessibilityRole="button">
          <Text style={styles.addText}>Add to order · ${total}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  image: { width: '100%', height: 260 },
  body: { padding: 20 },
  category: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.primary, marginTop: 4 },
  description: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.dark, marginTop: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: { backgroundColor: colors.light, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 6 },
  tagText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  contains: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4 },
  price: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary, marginTop: 16 },
  footer: {
    flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  addButton: { flex: 1, marginLeft: 16, backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  addText: { fontFamily: fonts.bold, fontSize: 17, color: colors.dark },
});
