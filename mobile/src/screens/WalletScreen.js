import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Vibration,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Alert from '../utils/dialog';
import { useTheme } from '../constants/theme';
import apiClient from '../api/client';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/formatters';

const QUICK_AMOUNTS = [100, 200, 500, 1000];
const MAX_AMOUNT = 100000;

export default function WalletScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const navigation = useNavigation();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Topup modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(0); // 0=amount, 1=processing/webview, 2=success
  const [amountInput, setAmountInput] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [creditedAmount, setCreditedAmount] = useState(null);

  const fetchWallet = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/me/wallet/');
      setBalance(Number(data?.balance) || 0);
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
    } catch (error) {
      console.log('Wallet fetch error:', error?.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchWallet();
    }, [fetchWallet])
  );

  const openTopup = () => {
    setAmountInput('');
    setStep(0);
    setCheckoutUrl(null);
    setCreditedAmount(null);
    setModalVisible(true);
  };

  const closeTopup = () => {
    setModalVisible(false);
    setCheckoutUrl(null);
    setStep(0);
  };

  const selectQuickAmount = (val) => {
    Vibration.vibrate(15);
    setAmountInput(String(val));
  };

  const startTopup = async () => {
    const amount = parseFloat(String(amountInput).replace(',', '.'));
    if (!amount || amount <= 0) {
      Alert.alert('Помилка', 'Введіть суму більше нуля');
      return;
    }
    if (amount > MAX_AMOUNT) {
      Alert.alert('Помилка', `Максимальна сума поповнення — ${formatCurrency(MAX_AMOUNT)} ₴`);
      return;
    }

    setStep(1);
    Vibration.vibrate(30);
    try {
      const { data } = await apiClient.post('/me/wallet/topup/init/', {
        amount: amount.toFixed(2),
      });
      if (!data?.checkout_url) {
        throw new Error('Бекенд не повернув checkout_url');
      }
      setCheckoutUrl(data.checkout_url);
    } catch (error) {
      const errDesc =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message;
      setModalVisible(false);
      setStep(0);
      Alert.alert('Помилка', `Не вдалося ініціювати поповнення: ${errDesc}`);
    }
  };

  const confirmTopup = async (orderId) => {
    try {
      const { data } = await apiClient.post('/me/wallet/topup/confirm/', {
        order_id: orderId,
      });
      const newBalance = Number(data?.balance);
      if (!Number.isNaN(newBalance)) setBalance(newBalance);
      setCreditedAmount(Number(data?.amount) || null);
      setStep(2);
      Vibration.vibrate([0, 50, 50, 50]);
      // Оновити транзакції з бекенду
      fetchWallet();
      setTimeout(() => {
        setModalVisible(false);
        setStep(0);
        setCreditedAmount(null);
      }, 2500);
    } catch (error) {
      setModalVisible(false);
      setStep(0);
      const errDesc =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message;
      Alert.alert('Помилка підтвердження', errDesc);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'liqpay_result' && msg.order_id) {
        setCheckoutUrl(null);
        confirmTopup(msg.order_id);
      }
    } catch (_) {}
  };

  const renderTransaction = (tx) => {
    const amount = Number(tx?.amount) || 0;
    const isCredit = amount >= 0;
    const created = tx?.created_at || tx?.created || tx?.timestamp;
    let dateLabel = '';
    if (created) {
      try {
        const d = new Date(created);
        if (!Number.isNaN(d.getTime())) {
          dateLabel = `${d.toLocaleDateString('uk-UA')} ${d
            .getHours()
            .toString()
            .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }
      } catch (_) {}
    }
    const description =
      tx?.description ||
      tx?.note ||
      (isCredit ? 'Поповнення' : 'Списання');

    return (
      <View key={tx.id ?? `${created}-${amount}`} style={styles.txRow}>
        <View
          style={[
            styles.txIconBox,
            { backgroundColor: isCredit ? '#10b98122' : '#ef444422' },
          ]}
        >
          <Ionicons
            name={isCredit ? 'arrow-down' : 'arrow-up'}
            size={18}
            color={isCredit ? '#10b981' : '#ef4444'}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.txDescription} numberOfLines={1}>
            {description}
          </Text>
          {dateLabel ? <Text style={styles.txDate}>{dateLabel}</Text> : null}
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: isCredit ? '#10b981' : '#ef4444' },
          ]}
        >
          {isCredit ? '+' : ''}
          {formatCurrency(Math.round(amount))} ₴
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мій гаманець</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        {isLoading ? (
          <SkeletonLoader width="100%" height={160} borderRadius={28} style={{ marginBottom: 20 }} />
        ) : (
          <View style={styles.balanceCard}>
            <View style={styles.balanceGlow} />
            <Text style={styles.balanceLabel}>ПОТОЧНИЙ БАЛАНС</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceValue}>{formatCurrency(Math.round(balance))}</Text>
              <Text style={styles.balanceCurrency}> ₴</Text>
            </View>
            <Text style={styles.balanceHint}>
              {balance > 0
                ? 'Використовуйте баланс для оплати тарифів і послуг'
                : 'Поповніть рахунок щоб користуватись послугами без готівки'}
            </Text>
          </View>
        )}

        {/* Topup Button */}
        <TouchableOpacity
          style={styles.topupBtn}
          activeOpacity={0.85}
          onPress={openTopup}
          disabled={isLoading}
        >
          <Ionicons name="add-circle" size={22} color="#000" />
          <Text style={styles.topupBtnText}>Поповнити рахунок</Text>
        </TouchableOpacity>

        {/* History */}
        <Text style={styles.sectionTitle}>Історія операцій</Text>

        {isLoading ? (
          <>
            <SkeletonLoader width="100%" height={62} borderRadius={16} style={{ marginBottom: 10 }} />
            <SkeletonLoader width="100%" height={62} borderRadius={16} style={{ marginBottom: 10 }} />
            <SkeletonLoader width="100%" height={62} borderRadius={16} style={{ marginBottom: 10 }} />
          </>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="file-tray-outline" size={40} color={COLORS.muted} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>Поки що пусто</Text>
            <Text style={styles.emptySubtext}>
              Тут зʼявляться поповнення та списання
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {transactions.map(renderTransaction)}
          </View>
        )}
      </ScrollView>

      {/* Topup Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeTopup}>
        <View style={styles.modalBackdrop}>
          <View style={styles.bottomSheet}>
            {step === 0 && (
              <View>
                <View style={styles.sheetHeader}>
                  <Ionicons name="wallet" size={28} color={COLORS.text} />
                  <Text style={styles.sheetTitle}>Поповнення гаманця</Text>
                </View>

                <Text style={styles.sheetLabel}>Швидкий вибір</Text>
                <View style={styles.quickRow}>
                  {QUICK_AMOUNTS.map((val) => {
                    const active = String(val) === String(amountInput);
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.quickChip, active && styles.quickChipActive]}
                        onPress={() => selectQuickAmount(val)}
                      >
                        <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>
                          {formatCurrency(val)} ₴
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.sheetLabel}>Власна сума</Text>
                <View style={styles.amountInputBox}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.muted}
                    keyboardType="numeric"
                    value={amountInput}
                    onChangeText={setAmountInput}
                    maxLength={7}
                  />
                  <Text style={styles.amountCurrency}>₴</Text>
                </View>

                <View style={styles.paymentMethodRow}>
                  <Ionicons name="card-outline" size={22} color={COLORS.muted} style={{ marginRight: 10 }} />
                  <Text style={styles.paymentMethodText}>Mastercard / Visa · LiqPay sandbox</Text>
                </View>

                <TouchableOpacity style={styles.payBtn} onPress={startTopup}>
                  <Text style={styles.payBtnText}>
                    Оплатити {amountInput ? `${formatCurrency(parseFloat(amountInput) || 0)} ₴` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelLinkBtn} onPress={closeTopup}>
                  <Text style={styles.cancelLinkText}>Скасувати</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 1 && !checkoutUrl && (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ transform: [{ scale: 1.5 }], marginBottom: 30 }} />
                <Text style={styles.sheetTitle}>З'єднання з LiqPay...</Text>
                <Text style={styles.sheetSubtitle}>Готуємо безпечне з'єднання</Text>
              </View>
            )}

            {step === 1 && checkoutUrl && (
              <View style={{ height: Dimensions.get('window').height * 0.85 }}>
                <View style={styles.webViewHeader}>
                  <Ionicons name="lock-closed" size={16} color="#10b981" />
                  <Text style={styles.webViewHeaderText}>Захищене з'єднання · LiqPay sandbox</Text>
                  <TouchableOpacity onPress={closeTopup} style={{ marginLeft: 'auto' }}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <WebView
                  source={{ uri: checkoutUrl }}
                  onMessage={handleWebViewMessage}
                  startInLoadingState
                  renderLoading={() => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  )}
                  onNavigationStateChange={(navState) => {
                    if (navState.url.includes('/checkout/result/')) {
                      try {
                        const url = new URL(navState.url);
                        const orderId = url.searchParams.get('order_id');
                        if (orderId) {
                          setCheckoutUrl(null);
                          confirmTopup(orderId);
                        }
                      } catch (_) {}
                    }
                  }}
                />
              </View>
            )}

            {step === 2 && (
              <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark" size={60} color="#fff" />
                </View>
                <Text style={[styles.sheetTitle, { marginTop: 20 }]}>Зараховано!</Text>
                <Text style={styles.sheetSubtitle}>
                  {creditedAmount
                    ? `+${formatCurrency(Math.round(creditedAmount))} ₴ на ваш баланс`
                    : 'Кошти зараховано на ваш баланс'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#222',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },

  balanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  balanceGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  balanceLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  balanceValue: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: -1 },
  balanceCurrency: { color: '#aaa', fontSize: 26, fontWeight: '700', marginLeft: 4 },
  balanceHint: { color: '#888', fontSize: 13, lineHeight: 18 },

  topupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  topupBtnText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 14 },

  txList: {
    backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.border,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDescription: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  txDate: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '900' },

  emptyBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333',
  },
  emptyText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.muted, fontSize: 13, marginTop: 4, textAlign: 'center' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  sheetSubtitle: { color: COLORS.muted, fontSize: 15, textAlign: 'center', marginTop: 10 },
  sheetLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#222',
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333',
  },
  quickChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickChipText: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  quickChipTextActive: { color: '#000' },

  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#111',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333',
  },
  amountInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    paddingVertical: 12,
  },
  amountCurrency: { color: COLORS.muted, fontSize: 22, fontWeight: '800', marginLeft: 8 },

  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#222',
    padding: 14,
    borderRadius: 12,
    marginBottom: 22,
  },
  paymentMethodText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  payBtnText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  cancelLinkBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelLinkText: { color: COLORS.muted, fontSize: 15, fontWeight: '700' },

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C851',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  webViewHeaderText: { color: '#aaa', fontSize: 13, fontWeight: '700' },
});
