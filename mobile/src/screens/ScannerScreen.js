import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ActivityIndicator, Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { granted, reason }
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  // --- Дозвіл на камеру ---
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Ionicons name="camera-outline" size={64} color={COLORS.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.permissionText}>Потрібен доступ до камери</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Дозволити</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Після сканування: показуємо результат ---
  if (result !== null) {
    const granted = result.granted;
    return (
      <View style={[styles.resultContainer, { backgroundColor: granted ? '#0a1a0a' : '#1a0a0a' }]}>
        <View style={[styles.resultCard, { borderColor: granted ? '#22c55e' : COLORS.primary }]}>

          {/* Іконка */}
          <View style={[styles.resultIcon, {
            backgroundColor: granted ? 'rgba(34,197,94,0.15)' : 'rgba(255,0,0,0.15)',
          }]}>
            <Ionicons
              name={granted ? 'checkmark-circle' : 'close-circle'}
              size={80}
              color={granted ? '#22c55e' : COLORS.primary}
            />
          </View>

          {/* Заголовок */}
          <Text style={[styles.resultTitle, { color: granted ? '#22c55e' : COLORS.primary }]}>
            {granted ? 'ДОСТУП ДОЗВОЛЕНО' : 'ДОСТУП ЗАБОРОНЕНО'}
          </Text>

          {/* Причина */}
          <Text style={styles.resultReason}>
            {result.reason || (granted ? 'Вхід дозволено' : 'Немає активного абонемента')}
          </Text>

          {/* Кнопка повторного сканування */}
          <TouchableOpacity
            style={[styles.rescanBtn, { borderColor: granted ? '#22c55e' : COLORS.primary }]}
            onPress={() => { setResult(null); setScanned(false); }}
          >
            <Ionicons name="scan-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.rescanBtnText}>Сканувати знову</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Основний екран камери ---
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    Vibration.vibrate(50);

    try {
      // Парсимо QR payload: { member_id, gym_id }
      let payload;
      try {
        payload = JSON.parse(data);
      } catch {
        setResult({ granted: false, reason: 'Невідомий формат QR-коду' });
        return;
      }

      if (!payload.member_id || !payload.gym_id) {
        setResult({ granted: false, reason: 'QR-код не містить даних клієнта' });
        return;
      }

      const response = await apiClient.post('/access/check/', {
        member_id: payload.member_id,
        gym_id: payload.gym_id,
      });

      Vibration.vibrate(response.data.granted ? [0, 100, 50, 100] : [0, 50, 50, 50, 50, 50]);
      setResult(response.data);

    } catch (error) {
      const errData = error?.response?.data;
      setResult({
        granted: false,
        reason: errData?.reason || errData?.detail || 'Помилка сервера',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Відскануйте перепустку клієнта</Text>

          {/* Рамка сканера */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {/* Лоадер */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Перевірка...</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  containerCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, paddingHorizontal: 40,
  },
  permissionText: {
    color: COLORS.text, fontSize: 18, fontWeight: '700',
    textAlign: 'center', marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14,
    paddingHorizontal: 40, borderRadius: 30,
  },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  // --- Overlay сканера ---
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    color: '#fff', fontSize: 18, fontWeight: '700',
    marginBottom: 40, textAlign: 'center', paddingHorizontal: 20,
  },
  scanFrame: {
    width: width * 0.68, height: width * 0.68,
    backgroundColor: 'transparent', position: 'relative',
  },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderColor: COLORS.primary, borderWidth: 4,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },

  loadingBox: { marginTop: 40, alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 16, fontWeight: '600' },

  // --- Result screen ---
  resultContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  resultCard: {
    width: '100%', maxWidth: 360, borderRadius: 28,
    borderWidth: 1.5, padding: 36, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  resultIcon: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24, fontWeight: '900', letterSpacing: 2,
    textTransform: 'uppercase', textAlign: 'center', marginBottom: 12,
  },
  resultReason: {
    color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center',
    lineHeight: 22, marginBottom: 36, paddingHorizontal: 10,
  },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 30,
    paddingVertical: 14, paddingHorizontal: 28,
  },
  rescanBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
