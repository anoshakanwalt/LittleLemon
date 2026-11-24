import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, Image, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Categories from '../components/Categories';
import MenuImage from '../components/MenuImage';
import FiltersModal from '../components/FiltersModal';
import BudgetModal from '../components/BudgetModal';
import HelperModal from '../components/HelperModal';
import menuData from '../menu.json';
import { colors, fonts } from '../theme';
import { COURSE_ORDER, CATEGORY_INFO, EMPTY_PREFS, matchesPrefs, tagsFor } from '../utils/menu';

const MENU = menuData.menu;
const CATEGORIES = COURSE_ORDER.filter((c) => MENU.some((i) => i.category === c));

export default function Home({ navigation }) {
  const [avatarUri, setAvatarUri] = useState(null);
  const [initials, setInitials] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [prefs, setPrefs] = useState(EMPTY_PREFS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [helperOpen, setHelperOpen] = useState(false);

  // Reload the avatar/name whenever we come back from the Profile screen.
  useEffect(() => {
    const load = async () => {
      const [[, avatar], [, first], [, last]] = await AsyncStorage.multiGet(['avatarUri', 'firstName', 'lastName']);
      setAvatarUri(avatar || null);
      setInitials(((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase());
    };
    load();
    return navigation.addListener('focus', load);
  }, [navigation]);

  // Remember dietary filters between launches.
  useEffect(() => {
    AsyncStorage.getItem('menuPrefs')
      .then((v) => {
        if (v) setPrefs({ ...EMPTY_PREFS, ...JSON.parse(v) });
      })
      .catch(() => {});
  }, []);

  const updatePrefs = (next) => {
    setPrefs(next);
    AsyncStorage.setItem('menuPrefs', JSON.stringify(next)).catch(() => {});
  };

  // Debounce the search box so we don't filter on every keystroke.
  useEffect(() => {
    const handler = setTimeout(() => setSearchQuery(searchText), 400);
    return () => clearTimeout(handler);
  }, [searchText]);

  const allowedMenu = useMemo(() => MENU.filter((i) => matchesPrefs(i, prefs)), [prefs]);

  const sections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATEGORIES.filter((c) => !selectedCategory || c === selectedCategory)
      .map((c) => ({
        key: c,
        data: allowedMenu.filter((i) => i.category === c && (!q || i.name.toLowerCase().includes(q))),
      }))
      .filter((s) => s.data.length > 0);
  }, [allowedMenu, searchQuery, selectedCategory]);

  const activeFilters = prefs.diets.length + prefs.avoid.length;

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
      onPress={() => navigation.navigate('ItemDetails', { item })}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, $${Number(item.price).toFixed(2)}. ${tagsFor(item).join(', ')}`}
    >
      <View style={styles.cardText}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={3}>{item.description}</Text>
        <View style={styles.tagRow}>
          {tagsFor(item).map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <MenuImage item={item} style={styles.itemImage} />
    </Pressable>
  );

  // Each category opens with a "story" banner instead of a plain list heading.
  const renderSectionHeader = ({ section }) => {
    const info = CATEGORY_INFO[section.key];
    return (
      <View style={[styles.banner, { backgroundColor: info.color }]}>
        <Text style={styles.bannerEmoji}>{info.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle} accessibilityRole="header">{info.title}</Text>
          <Text style={styles.bannerStory}>{info.story}</Text>
        </View>
      </View>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Little Lemon</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroSubtitle}>Chicago</Text>
            <Text style={styles.heroDescription}>
              We are a family-owned Mediterranean restaurant, focused on traditional
              recipes served with a modern twist.
            </Text>
          </View>
          <Image source={require('../assets/Hero.png')} style={styles.heroImage} resizeMode="cover" accessibilityLabel="Little Lemon dish" />
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes"
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            accessibilityLabel="Search dishes"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolRow}>
        <Pressable style={styles.toolButton} onPress={() => setFiltersOpen(true)} accessibilityRole="button" accessibilityLabel="Dietary filters">
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={styles.toolText}>Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => setHelperOpen(true)} accessibilityRole="button" accessibilityLabel="What should I eat">
          <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
          <Text style={styles.toolText}>What should I eat?</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => setBudgetOpen(true)} accessibilityRole="button" accessibilityLabel="Budget planner">
          <Ionicons name="wallet-outline" size={18} color={colors.primary} />
          <Text style={styles.toolText}>Budget planner</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => navigation.navigate('Reservations')} accessibilityRole="button" accessibilityLabel="Reserve a table">
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.toolText}>Reserve a table</Text>
        </Pressable>
      </ScrollView>

      <Text style={styles.sectionTitle} accessibilityRole="header">ORDER FOR DELIVERY!</Text>
      <Categories
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <View style={{ height: 12 }} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} avatarUri={avatarUri} initials={initials} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No dishes match your search{activeFilters > 0 ? ' and filters' : ''}.
          </Text>
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

      <FiltersModal visible={filtersOpen} onClose={() => setFiltersOpen(false)} prefs={prefs} onChange={updatePrefs} />
      <BudgetModal visible={budgetOpen} onClose={() => setBudgetOpen(false)} menu={allowedMenu} />
      <HelperModal visible={helperOpen} onClose={() => setHelperOpen(false)} menu={allowedMenu} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  hero: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  heroTitle: { fontFamily: fonts.display, fontSize: 54, color: colors.secondary, lineHeight: 58 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4 },
  heroTextContainer: { flex: 1, paddingRight: 14 },
  heroSubtitle: { fontFamily: fonts.displayRegular, fontSize: 34, color: colors.light, marginBottom: 6 },
  heroDescription: { fontFamily: fonts.medium, fontSize: 16, color: colors.light, lineHeight: 22 },
  heroImage: { width: 124, height: 140, borderRadius: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light,
    borderRadius: 12, paddingHorizontal: 12, marginTop: 18,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: fonts.body, fontSize: 16, color: colors.dark },
  toolRow: { paddingHorizontal: 20, paddingTop: 16 },
  toolButton: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 10,
  },
  toolText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginLeft: 6 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 19, color: colors.dark, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12 },
  banner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 14, marginBottom: 14, padding: 16, borderRadius: 20 },
  bannerEmoji: { fontSize: 44, marginRight: 14 },
  bannerTitle: { fontFamily: fonts.display, fontSize: 34, color: colors.primary, lineHeight: 36 },
  bannerStory: { fontFamily: fonts.body, fontSize: 14, color: colors.dark, lineHeight: 20, marginTop: 2 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    marginHorizontal: 20, marginBottom: 14, padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  cardText: { flex: 1, paddingRight: 12 },
  itemTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.dark },
  itemDescription: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 19 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: { backgroundColor: colors.light, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6, marginBottom: 2 },
  tagText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary },
  itemPrice: { fontFamily: fonts.bold, fontSize: 17, color: colors.primary, marginTop: 6 },
  itemImage: { width: 92, height: 92, borderRadius: 12, overflow: 'hidden' },
  empty: { fontFamily: fonts.body, textAlign: 'center', color: colors.muted, marginTop: 30, fontSize: 16, paddingHorizontal: 30 },
});
