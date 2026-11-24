import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated, AccessibilityInfo, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { imageSourceFor } from '../utils/images';

// Shows the dish photo.
// - Bundled photos render instantly.
// - Remote photos show a soft pulsing placeholder while loading, then fade in.
// - No photo (or it fails to load): show the dish's emoji instead.
export default function MenuImage({ item, style }) {
  const source = imageSourceFor(item);
  const isRemote = !!source && typeof source === 'object' && !!source.uri;

  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRemote || loaded || failed || reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isRemote, loaded, failed, reduceMotion, pulse]);

  const onLoad = () => {
    setLoaded(true);
    Animated.timing(fade, { toValue: 1, duration: reduceMotion ? 0 : 250, useNativeDriver: true }).start();
  };

  if (!source || failed) {
    return (
      <View style={[style, styles.fallback]} accessible accessibilityLabel={`${item.name} (no photo)`}>
        <Text style={styles.emoji}>{item.emoji || '🍋'}</Text>
      </View>
    );
  }

  if (!isRemote) {
    return <Image source={source} style={style} resizeMode="cover" accessibilityLabel={item.name} />;
  }

  return (
    <View style={[style, { overflow: 'hidden', backgroundColor: colors.light }]}>
      {!loaded && <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.border, opacity: pulse }]} />}
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, { opacity: fade }]}
        resizeMode="cover"
        onLoad={onLoad}
        onError={() => setFailed(true)}
        accessibilityLabel={item.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.light, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 44 },
});
