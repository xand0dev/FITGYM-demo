import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { useTheme } from '../constants/theme';

export default function ToolsScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  const [activeTab, setActiveTab] = useState('kbzhu'); // kbzhu, 1rm, bmi, water, convert

  // KBZHU State
  const [kbzhuWeight, setKbzhuWeight] = useState('');
  const [kbzhuHeight, setKbzhuHeight] = useState('');
  const [kbzhuAge, setKbzhuAge] = useState('');
  const [isMale, setIsMale] = useState(true);
  const [activity, setActivity] = useState(1.375); // 1.2 (min), 1.375 (light), 1.55 (mid), 1.725 (heavy)
  const [goal, setGoal] = useState('maintain'); // lose, maintain, gain
  const [kbzhuResult, setKbzhuResult] = useState(null);

  // 1RM State
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRM, setOneRM] = useState(null);

  // BMI State
  const [heightBMI, setHeightBMI] = useState('');
  const [weightBMI, setWeightBMI] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  // Water State
  const [waterWeight, setWaterWeight] = useState('');
  const [activityHours, setActivityHours] = useState('');
  const [waterResult, setWaterResult] = useState(null);

  // Converter State
  const [convAmount, setConvAmount] = useState('');
  const [isKgToLbs, setIsKgToLbs] = useState(true);
  const [convResult, setConvResult] = useState(null);

  const calculateKBZHU = () => {
    const w = parseFloat(kbzhuWeight);
    const h = parseFloat(kbzhuHeight);
    const a = parseFloat(kbzhuAge);
    if (w > 0 && h > 0 && a > 0) {
      let bmr = 10 * w + 6.25 * h - 5 * a;
      bmr += isMale ? 5 : -161;
      
      let tdee = bmr * activity;
      
      if (goal === 'lose') tdee -= 500;
      if (goal === 'gain') tdee += 300;

      const calories = Math.round(tdee);
      const protein = Math.round((calories * 0.3) / 4); // 30% protein (4 kcal/g)
      const fats = Math.round((calories * 0.3) / 9); // 30% fat (9 kcal/g)
      const carbs = Math.round((calories * 0.4) / 4); // 40% carbs (4 kcal/g)

      setKbzhuResult({ calories, protein, fats, carbs });
    }
  };

  const calculate1RM = () => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    if (w > 0 && r > 0) {
      const result = w * (1 + r / 30);
      setOneRM(result.toFixed(1));
    }
  };

  const calculateBMI = () => {
    const h = parseFloat(heightBMI) / 100;
    const w = parseFloat(weightBMI);
    if (h > 0 && w > 0) {
      const result = w / (h * h);
      let category = '';
      if (result < 18.5) category = 'Недостатня вага';
      else if (result < 24.9) category = 'Нормальна вага';
      else if (result < 29.9) category = 'Надмірна вага';
      else category = 'Ожиріння';
      setBmiResult({ value: result.toFixed(1), category });
    }
  };

  const calculateWater = () => {
    const w = parseFloat(waterWeight);
    const a = parseFloat(activityHours) || 0;
    if (w > 0) {
      const result = (w * 30) + (a * 500);
      setWaterResult((result / 1000).toFixed(2));
    }
  };

  const calculateConvert = () => {
    const a = parseFloat(convAmount);
    if (a > 0) {
      if (isKgToLbs) setConvResult((a * 2.20462).toFixed(2) + ' lbs');
      else setConvResult((a / 2.20462).toFixed(2) + ' kg');
    }
  };

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
      <TouchableOpacity onPress={() => setActiveTab('kbzhu')} style={[styles.tab, activeTab === 'kbzhu' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'kbzhu' && styles.activeTabText]}>КБЖУ Режим</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('1rm')} style={[styles.tab, activeTab === '1rm' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === '1rm' && styles.activeTabText]}>1ПМ Максимум</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('bmi')} style={[styles.tab, activeTab === 'bmi' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'bmi' && styles.activeTabText]}>ІМТ (BMI)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('water')} style={[styles.tab, activeTab === 'water' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'water' && styles.activeTabText]}>Норма Води</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('convert')} style={[styles.tab, activeTab === 'convert' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'convert' && styles.activeTabText]}>Конвертер</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Інструменти</Text>
        <Text style={styles.subtitle}>Розрахунки для харчування та тренувань</Text>
      </View>
      
      <View>
        {renderTabs()}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {activeTab === 'kbzhu' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Калькулятор Калорій (КБЖУ)</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Стать: {isMale ? 'Чоловік' : 'Жінка'}</Text>
              <Switch value={isMale} onValueChange={setIsMale} trackColor={{ false: '#ff69b4', true: '#1e90ff' }} thumbColor={isMale ? '#fff' : '#fff'} />
            </View>

            <TextInput style={styles.input} placeholder="Вік (років)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={kbzhuAge} onChangeText={setKbzhuAge} />
            <TextInput style={styles.input} placeholder="Зріст (см)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={kbzhuHeight} onChangeText={setKbzhuHeight} />
            <TextInput style={styles.input} placeholder="Вага (кг)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={kbzhuWeight} onChangeText={setKbzhuWeight} />
            
            <Text style={styles.label}>Активність:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={[styles.radioBtn, activity === 1.2 && styles.radioBtnActive]} onPress={() => setActivity(1.2)}><Text style={styles.radioText}>Мін.</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.radioBtn, activity === 1.375 && styles.radioBtnActive]} onPress={() => setActivity(1.375)}><Text style={styles.radioText}>Середня</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.radioBtn, activity === 1.55 && styles.radioBtnActive]} onPress={() => setActivity(1.55)}><Text style={styles.radioText}>Висока</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>Мета:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={[styles.radioBtn, goal === 'lose' && styles.radioBtnActive]} onPress={() => setGoal('lose')}><Text style={styles.radioText}>Схуднути</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.radioBtn, goal === 'maintain' && styles.radioBtnActive]} onPress={() => setGoal('maintain')}><Text style={styles.radioText}>Підтримка</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.radioBtn, goal === 'gain' && styles.radioBtnActive]} onPress={() => setGoal('gain')}><Text style={styles.radioText}>Набір маси</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btn} onPress={calculateKBZHU}><Text style={styles.btnText}>Розрахувати КБЖУ</Text></TouchableOpacity>
            
            {kbzhuResult && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Денна норма калорій:</Text>
                <Text style={styles.resultValue}>{kbzhuResult.calories} ккал</Text>
                
                <View style={styles.macrosRow}>
                   <View style={styles.macroItem}><Text style={styles.macroValue}>{kbzhuResult.protein}г</Text><Text style={styles.macroLabel}>Білки</Text></View>
                   <View style={styles.macroItem}><Text style={styles.macroValue}>{kbzhuResult.fats}г</Text><Text style={styles.macroLabel}>Жири</Text></View>
                   <View style={styles.macroItem}><Text style={styles.macroValue}>{kbzhuResult.carbs}г</Text><Text style={styles.macroLabel}>Вуглеводи</Text></View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Other Calculators exist here */}
        {activeTab === '1rm' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Твій Одноповторний Максимум</Text>
            <TextInput style={styles.input} placeholder="Вага снаряду (кг)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={weight} onChangeText={setWeight} />
            <TextInput style={styles.input} placeholder="Кількість повторень" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={reps} onChangeText={setReps} />
            <TouchableOpacity style={styles.btn} onPress={calculate1RM}><Text style={styles.btnText}>Розрахувати</Text></TouchableOpacity>
            {oneRM && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Твій 1ПМ (One Rep Max):</Text>
                <Text style={styles.resultValue}>{oneRM} кг</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'bmi' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Індекс Маси Тіла</Text>
            <TextInput style={styles.input} placeholder="Зріст (см)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={heightBMI} onChangeText={setHeightBMI} />
            <TextInput style={styles.input} placeholder="Вага (кг)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={weightBMI} onChangeText={setWeightBMI} />
            <TouchableOpacity style={styles.btn} onPress={calculateBMI}><Text style={styles.btnText}>Розрахувати</Text></TouchableOpacity>
            {bmiResult && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Твій ІМТ:</Text>
                <Text style={styles.resultValue}>{bmiResult.value}</Text>
                <Text style={[styles.resultLabel, {marginTop: 5, color: COLORS.primary}]}>{bmiResult.category}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'water' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Денна Норма Води</Text>
            <TextInput style={styles.input} placeholder="Ваша вага (кг)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={waterWeight} onChangeText={setWaterWeight} />
            <TextInput style={styles.input} placeholder="Час тренування (годин)" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={activityHours} onChangeText={setActivityHours} />
            <TouchableOpacity style={styles.btn} onPress={calculateWater}><Text style={styles.btnText}>Розрахувати</Text></TouchableOpacity>
            {waterResult && (
               <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Вам потрібно випити:</Text>
                <Text style={styles.resultValue}>{waterResult} літрів</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'convert' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Конвертер ваги</Text>
            <View style={styles.row}>
              <Text style={{color: COLORS.text, fontSize: 16}}>Фунти (lbs) в Кілограми</Text>
              <Switch value={isKgToLbs} onValueChange={setIsKgToLbs} trackColor={{ false: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', true: COLORS.primary }} />
              <Text style={{color: COLORS.text, fontSize: 16}}>kg в lbs</Text>
            </View>
            <TextInput style={styles.input} placeholder={`Введіть значення у ${isKgToLbs ? 'KG' : 'LBS'}`} placeholderTextColor={COLORS.muted} keyboardType="numeric" value={convAmount} onChangeText={setConvAmount} />
            <TouchableOpacity style={styles.btn} onPress={calculateConvert}><Text style={styles.btnText}>Конвертувати</Text></TouchableOpacity>
            {convResult && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Результат:</Text>
                <Text style={styles.resultValue}>{convResult}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 40 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: COLORS.muted, fontSize: 16, marginTop: 5 },
  tabsContainer: { paddingHorizontal: 20, marginVertical: 15, maxHeight: 50 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', marginRight: 10, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', justifyContent: 'center' },
  activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontWeight: '600' },
  activeTabText: { color: COLORS.text === '#000000' ? '#ffffff' : COLORS.text },
  content: { padding: 20 },
  card: { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  cardTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', padding: 15, borderRadius: 10, color: COLORS.text, marginBottom: 15, fontSize: 16 },
  btn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }, // Always white text on primary background
  resultBox: { marginTop: 25, padding: 20, backgroundColor: 'rgba(230, 0, 0, 0.1)', borderRadius: 10, alignItems: 'center' },
  resultLabel: { color: COLORS.muted, fontSize: 14, marginBottom: 5 },
  resultValue: { color: COLORS.primary, fontSize: 32, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: COLORS.text, fontSize: 16, marginBottom: 10, fontWeight: '500' },
  radioGroup: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  radioBtn: { flex: 1, backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', alignItems: 'center' },
  radioBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(230, 0, 0, 0.1)' },
  radioText: { color: COLORS.text, fontSize: 14 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  macroItem: { alignItems: 'center' },
  macroValue: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  macroLabel: { color: COLORS.muted, fontSize: 12, marginTop: 4 }
});
