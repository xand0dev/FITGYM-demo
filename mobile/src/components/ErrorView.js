import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';

export default function ErrorView({ message = 'Не вдалося завантажити дані', onRetry }) {
  const COLORS = useTheme();
  const s = getStyles(COLORS);
  return (
    <View style={s.wrap}>
      <Ionicons name="cloud-offline-outline" size={56} color={COLORS.muted} />
      <Text style={s.msg}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={s.btn} onPress={onRetry}>
          <Text style={s.btnText}>Спробувати знову</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 40 },
  msg: { color: COLORS.muted, fontSize: 16, textAlign: 'center' },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
