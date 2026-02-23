import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Головна сторінка (В розробці)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  text: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' }
});