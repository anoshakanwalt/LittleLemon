import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, Alert, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuantityStepper from '../components/QuantityStepper';
import { colors, fonts } from '../theme';
import {
  SLOTS, nextDays, formatDate, formatTime, isPast, isFullyBooked, sortReservations,
} from '../utils/reservations';

const STORAGE_KEY = 'reservations';

export default function Reservations() {
  const days = useMemo(() => nextDays(14), []);
  const [dateKey, setDateKey] = useState(days[0].key);
  const [time, setTime] = useState(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [reservations, setReservations] = useState([]);

  // Load saved reservations and prefill the name from the profile.
  useEffect(() => {
    (async () => {
      try {
        const [[, saved], [, first], [, last]] = await AsyncStorage.multiGet([STORAGE_KEY, 'firstName', 'lastName']);
        if (saved) setReservations(JSON.parse(saved));
        const full = [first, last].filter(Boolean).join(' ');
        if (full) setName(full);
      } catch (e) {
        console.log('Error loading reservations', e);
      }
    })();
  }, []);

  const persist = (list) => {
    setReservations(list);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
  };

  const upcoming = useMemo(
    () => sortReservations(reservations).filter((r) => !isPast(r.date, r.time)),
    [reservations]
  );

  const alreadyBooked = (slot) => reservations.some((r) => r.date === dateKey && r.time === slot);
  const slotState = (slot) => {
    if (isPast(dateKey, slot)) return 'past';
    if (alreadyBooked(slot)) return 'yours';
    if (isFullyBooked(dateKey, slot)) return 'full';
    return 'open';
  };

  const book = () => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (!time) return Alert.alert('Pick a time', 'Choose an available time slot first.');
    if (name.trim().length < 2) return Alert.alert('Name needed', 'Please enter the name for the booking.');
    if (phoneDigits.length < 7) return Alert.alert('Phone needed', 'Please enter a valid phone number.');

    const reservation = {
      id: String(Date.now()),
      date: dateKey,
      time,
      people,
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    };
    persist([...reservations, reservation]);
    setTime(null);
    setNotes('');
    Alert.alert('Table booked 🎉', `${formatDate(dateKey)} at ${formatTime(time)} for ${people}. See you at Little Lemon!`);
  };

  const cancel = (r) => {
    Alert.alert('Cancel reservation?', `${formatDate(r.date)} at ${formatTime(r.time)}`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => persist(reservations.filter((x) => x.id !== r.id)) },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {upcoming.length > 0 && (
          <View style={styles.block}>
            <Text style={styles.heading}>Your reservations</Text>
            {upcoming.map((r) => (
              <View key={r.id} style={styles.resCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resTitle}>{formatDate(r.date)} · {formatTime(r.time)}</Text>
                  <Text style={styles.resSub}>
                    {r.people} {r.people === 1 ? 'guest' : 'guests'} · {r.name}
                  </Text>
                  {r.notes ? <Text style={styles.resSub}>“{r.notes}”</Text> : null}
                </View>
                <Pressable onPress={() => cancel(r)} accessibilityRole="button" accessibilityLabel={`Cancel reservation on ${formatDate(r.date)} at ${formatTime(r.time)}`}>
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.heading}>Book a table</Text>

        <Text style={styles.label}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((d) => {
            const selected = d.key === dateKey;
            return (
              <Pressable
                key={d.key}
                style={[styles.dateChip, selected && styles.chipSelected]}
                onPress={() => { setDateKey(d.key); setTime(null); }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${d.weekday} ${d.month} ${d.day}`}
              >
                <Text style={[styles.dateWeekday, selected && styles.chipTextSelected]}>{d.weekday}</Text>
                <Text style={[styles.dateDay, selected && styles.chipTextSelected]}>{d.day}</Text>
                <Text style={[styles.dateMonth, selected && styles.chipTextSelected]}>{d.month}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Time</Text>
        <View style={styles.slotGrid}>
          {SLOTS.map((slot) => {
            const state = slotState(slot);
            const disabled = state !== 'open';
            const selected = time === slot;
            return (
              <Pressable
                key={slot}
                disabled={disabled}
                style={[styles.slot, selected && styles.chipSelected, disabled && styles.slotDisabled]}
                onPress={() => setTime(slot)}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                accessibilityLabel={`${formatTime(slot)}${state === 'full' ? ', fully booked' : ''}`}
              >
                <Text style={[styles.slotText, selected && styles.chipTextSelected, disabled && styles.slotTextDisabled]}>
                  {formatTime(slot)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>Greyed-out times are unavailable. Availability is simulated in this demo.</Text>

        <Text style={styles.label}>Guests</Text>
        <QuantityStepper value={people} onChange={(n) => setPeople(Math.min(10, n))} min={1} label="guests" />

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name for the booking" placeholderTextColor={colors.muted} accessibilityLabel="Name for the booking" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.muted} keyboardType="phone-pad" accessibilityLabel="Phone number" />

        <Text style={styles.label}>Special requests (optional)</Text>
        <TextInput
          style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          accessibilityLabel="Special requests"
          placeholder="Birthday, window seat, allergies…"
          placeholderTextColor={colors.muted}
          multiline
        />

        <Pressable style={({ pressed }) => [styles.book, pressed && { opacity: 0.85 }]} onPress={book} accessibilityRole="button">
          <Text style={styles.bookText}>
            {time ? `Book ${formatTime(time)} · ${people} ${people === 1 ? 'guest' : 'guests'}` : 'Choose a time'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { padding: 20, paddingBottom: 48 },
  block: { marginBottom: 12 },
  heading: { fontFamily: fonts.display, fontSize: 34, color: colors.primary, marginBottom: 6 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.dark, marginTop: 18, marginBottom: 8 },
  resCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light, borderRadius: 14, padding: 14, marginTop: 8 },
  resTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.dark },
  resSub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 2 },
  cancel: { fontFamily: fonts.bold, fontSize: 14, color: colors.danger, padding: 6 },
  dateChip: { alignItems: 'center', backgroundColor: colors.light, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginRight: 10, minWidth: 68 },
  dateWeekday: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  dateDay: { fontFamily: fonts.bold, fontSize: 22, color: colors.primary },
  dateMonth: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  chipSelected: { backgroundColor: colors.primary },
  chipTextSelected: { color: colors.white },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  slot: { backgroundColor: colors.light, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  slotDisabled: { backgroundColor: '#f4f4f4' },
  slotText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  slotTextDisabled: { color: '#b5b9b7', textDecorationLine: 'line-through' },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  input: { backgroundColor: colors.light, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 16, color: colors.dark },
  book: { backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  bookText: { fontFamily: fonts.bold, fontSize: 17, color: colors.dark },
});
