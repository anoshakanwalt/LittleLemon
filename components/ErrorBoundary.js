import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

// Catches unexpected render errors so the app shows a friendly screen instead of crashing.
export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.log('App error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🍋</Text>
        <Text style={styles.title} accessibilityRole="header">Something went sour</Text>
        <Text style={styles.text}>Sorry about that. Please try again.</Text>
        <Pressable style={styles.button} onPress={() => this.setState({ hasError: false })} accessibilityRole="button">
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, padding: 30 },
  emoji: { fontSize: 56 },
  title: { fontFamily: fonts.display, fontSize: 38, color: colors.primary, marginTop: 8 },
  text: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, marginTop: 4 },
  button: { marginTop: 24, backgroundColor: colors.secondary, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.dark },
});
