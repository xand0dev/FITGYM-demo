import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, TouchableOpacity, Alert } from 'react-native';
// Note: Requires "expo-camera" installed
// npx expo install expo-camera
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.textCenter}>Нам потрібен доступ до камери</Text>
        <Button onPress={requestPermission} title="Дозволити" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // Here we can open a video or add exercise based on QR token
    Alert.alert(
      "Тренажер знайдено!",
      `Дія для: ${data}`,
      [
        { text: "Дивитись відео", onPress: () => setScanned(false) },
        { text: "Додати в тренування", onPress: () => setScanned(false) },
        { text: "Скасувати", style: "cancel", onPress: () => setScanned(false) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Відскануйте QR-код на тренажері</Text>
          <View style={styles.scanFrame} />
          
          {scanned && (
            <TouchableOpacity 
              style={styles.scanAgainButton} 
              onPress={() => setScanned(false)}
            >
              <Text style={styles.btnText}>Сканувати знову</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  textCenter: {
    color: COLORS.text,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Keep scanner overlay dark for contrast
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff', // Overlay text is white
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 4,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  scanAgainButton: {
    marginTop: 40,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  btnText: {
    color: '#ffffff', // primary red bg -> white text
    fontSize: 18,
    fontWeight: 'bold',
  },
});
