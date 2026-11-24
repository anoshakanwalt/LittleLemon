import React from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import MenuImage from '../components/MenuImage';
import QuantityStepper from '../components/QuantityStepper';
import { useCart } from '../context/CartContext';
import { colors, fonts } from '../theme';

export default function Cart({ navigation }) {
  const { items, setQty, clear, total } = useCart();

  const placeOrder = () => {
    // Demo app: there's no backend, so we just confirm and clear the cart.
    Alert.alert('Order placed 🎉', `Your order of $${total.toFixed(2)} is on its way. Thank you!`, [
      { text: 'OK', onPress: () => { clear(); navigation.navigate('Home'); } },
    ]);
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🍋</Text>
        <Text style={styles.emptyTitle}>Your order is empty</Text>
        <Text style={styles.emptyText}>Pick something tasty from the menu.</Text>
        <Pressable style={styles.browse} onPress={() => navigation.navigate('Home')} accessibilityRole="button">
          <Text style={styles.browseText}>Browse menu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.name}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <MenuImage item={item} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${(item.price * item.qty).toFixed(2)}</Text>
            </View>
            <QuantityStepper value={item.qty} onChange={(q) => setQty(item.name, q)} min={0} label={item.name} />
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.orderButton, pressed && { opacity: 0.85 }]} onPress={placeOrder} accessibilityRole="button">
          <Text style={styles.orderText}>Place order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  info: { flex: 1, paddingHorizontal: 12 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.dark },
  price: { fontFamily: fonts.medium, fontSize: 15, color: colors.primary, marginTop: 4 },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { fontFamily: fonts.bold, fontSize: 18, color: colors.dark },
  totalValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary },
  orderButton: { backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  orderText: { fontFamily: fonts.bold, fontSize: 18, color: colors.dark },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, padding: 30 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 34, color: colors.primary, marginTop: 8 },
  emptyText: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, marginTop: 4 },
  browse: { marginTop: 24, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
  browseText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
});
