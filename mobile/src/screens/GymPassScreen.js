import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import useAppStore from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function GymPassScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const navigation = useNavigation();
  const { userToken } = useAppStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial vibration for premium feel
    Vibration.vibrate(50);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  // Generate a mock unique ID string based on userToken or timestamp
  const passId = `FITGYM-PASS-${userToken ? userToken.substring(0, 8) : Date.now()}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Перепустка в Клуб</Text>
        <View style={{width: 44}} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Відскануйте на турнікеті</Text>
        
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: pulseAnim }] }]}>
           <View style={styles.qrWrapper}>
              <QRCode
                value={passId}
                size={width * 0.6}
                color={ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#000'}
                backgroundColor="#ffffff"
                logoSize={30}
                logoBackgroundColor='transparent'
              />
           </View>
           
           <View style={styles.passDetails}>
             <Text style={styles.passLabel}>Digital ID</Text>
             <Text style={styles.passValue}>{passId}</Text>
           </View>
        </Animated.View>

        <TouchableOpacity
           style={styles.simulationBtn}
           onPress={() => {
             Vibration.vibrate([0, 50, 50, 50]);
             navigation.navigate('Scanner');
           }}
        >
          <Ionicons name="scan-circle" size={24} color={COLORS.text} style={{marginRight: 10}} />
          <Text style={styles.simulationBtnText}>Сканувати QR-код</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' }, // Always dark/immersive for Pass screen
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: '#000', zIndex: 10
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  subtitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700', marginBottom: 40, letterSpacing: 1, textTransform: 'uppercase' },
  
  cardContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    padding: 30,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    width: width * 0.85
  },
  
  qrWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30
  },

  passDetails: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 20,
    width: '100%'
  },
  passLabel: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 5
  },
  passValue: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2
  },

  simulationBtn: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333'
  },
  simulationBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
