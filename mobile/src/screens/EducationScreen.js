import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Modal, Platform } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const TERMS = [
  { term: 'Суперсет', desc: 'Виконання двох або більше різних вправ без відпочинку між ними.' },
  { term: 'Дропсет', desc: 'Виконання вправи до відмови, після чого вага зменшується на 20-30% і підхід продовжується.' },
  { term: 'Профіцит калорій', desc: 'Споживання більшої кількості калорій, ніж витрачається, для набору маси.' },
  { term: 'База', desc: 'Базові багатосуглобові вправи (присідання, станова тяга, жим лежачи).' }
];

const STRETCHES = [
  { name: 'Розтяжка квадрицепса', desc: 'Стоячи на одній нозі, тягніть іншу за стопу до сідниці. Тримайте баланс.', image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=300&fit=crop' },
  { name: 'Розтяжка спини', desc: 'Сядьте на коліна, витягніть руки вперед і потягніться тазом назад до п\'ят (поза дитини).', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' }
];

const RECIPES = [
  { 
    id: 1,
    name: 'Протеїнові сирники (Білок)', 
    shortDesc: 'Ідеальний сніданок з високим вмістом білка.',
    desc: 'Ніжні сирники, які не містять цукру та зайвих калорій. Ідеально підходять для набору сухої м\'язової маси та схуднення.', 
    image: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=800&fit=crop', 
    cals: '350',
    protein: '45г',
    time: '20 хв',
    ingredients: [
      'Знежирений кисломолочний сир - 400 г',
      'Яйця курячі - 2 шт',
      'Протеїн - 1 скуп (30г)',
      'Рисове борошно - 2 ст. л.',
      'Підсолоджувач - за смаком'
    ],
    instructions: [
      'Ретельно розімніть сир виделкою або перебийте блендером до однорідності.',
      'Додайте яйця та підсолоджувач, перемішайте.',
      'Всипте протеїн та борошно. Замісіть тісто.',
      'Сформуйте кульки, злегка приплюсніть їх.',
      'Обсмажте на антипригарній сковороді з краплею олії по 3-4 хвилини з кожного боку до золотистої скоринки.'
    ]
  },
  { 
    id: 2,
    name: 'Стейк з лосося та кіноа', 
    shortDesc: 'Збалансована вечеря, багата на Омега-3.',
    desc: 'Чудове завершення дня, яке забезпечить вас необхідними жирними кислотами та високоякісним білком для відновлення.', 
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&fit=crop', 
    cals: '520',
    protein: '30г',
    time: '25 хв',
    ingredients: [
      'Стейк лосося - 150 г',
      'Кіноа - 50 г',
      'Свіжий салат - 100 г',
      'Оливкова олія - 1 ст. л.',
      'Лимон, сіль, перець, спеції - за смаком'
    ],
    instructions: [
      'Промийте кіноа і відваріть у пропорції 1:2 на слабкому вогні (близько 15 хв).',
      'Лосось натріть сіллю, перцем та збризніть лимонним соком.',
      'Запікайте рибу в духовці при 190°C близько 12-15 хвилин.',
      'Змішайте салат з оливковою олією.',
      'Подавайте стейк на подушці з кіноа та свіжим салатом.'
    ]
  },
  { 
    id: 3,
    name: 'Куряча грудка з булгуром', 
    shortDesc: 'Класичний збалансований обід для набору або підтримки.',
    desc: 'Ситна страва, що легко готується та містить збалансовану комбінацію білків, вуглеводів та клітковини.', 
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&fit=crop', 
    cals: '400',
    protein: '46г',
    time: '30 хв',
    ingredients: [
      'Куряче філе - 200 г',
      'Булгур - 50 г',
      'Броколі - 100 г',
      'Оливкова олія (до спрею)'
    ],
    instructions: [
      'Залийте булгур окропом (1:2), посоліть і варіть на повільному вогні 15-20 хвилин.',
      'Куряче філе відбийте, замаринуйте в улюблених спеціях.',
      'Броколі розберіть на суцвіття та варіть у киплячій воді 3-4 хвилини, потім промийте холодною водою.',
      'Обсмажте курку на сковороді-гриль по 5-6 хвилин з кожного боку.',
      'Зберіть страву в тарілці: булгур, соковите філе та хрусткі броколі.'
    ]
  },
];

const INITIAL_CHECKLIST = [
  { id: '1', text: 'Кросівки', checked: false },
  { id: '2', text: 'Спортивна форма', checked: false },
  { id: '3', text: 'Рушник', checked: false },
  { id: '4', text: 'Пляшка води', checked: false },
  { id: '5', text: 'Шампунь/Мило', checked: false }
];

export default function EducationScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const [activeTab, setActiveTab] = useState('recipes'); 
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const saved = await SecureStore.getItemAsync('gymBagChecklist');
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading checklist', e);
    }
  };

  const toggleCheck = async (id) => {
    const updated = checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setChecklist(updated);
    try {
      await SecureStore.setItemAsync('gymBagChecklist', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving checklist', e);
    }
  };

  const resetChecklist = async () => {
    const updated = checklist.map(item => ({...item, checked: false}));
    setChecklist(updated);
    await SecureStore.setItemAsync('gymBagChecklist', JSON.stringify(updated));
  };

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
      <TouchableOpacity onPress={() => setActiveTab('recipes')} style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>Страви</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('glossary')} style={[styles.tab, activeTab === 'glossary' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'glossary' && styles.activeTabText]}>Довідник</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('stretching')} style={[styles.tab, activeTab === 'stretching' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'stretching' && styles.activeTabText]}>Заминка</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab('bag')} style={[styles.tab, activeTab === 'bag' && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === 'bag' && styles.activeTabText]}>Сумка в зал</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Довідник та Харчування</Text>
      </View>
      
      <View>
        {renderTabs()}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {activeTab === 'recipes' && (
          <View>
            <Text style={styles.sectionTitle}>Корисні Рецепти</Text>
            <Text style={{color: COLORS.muted, marginBottom: 15}}>Збалансовані варіанти харчування зі смаком. (Натисніть для деталей)</Text>
            
            {RECIPES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.recipeCard} onPress={() => setSelectedRecipe(item)} activeOpacity={0.8}>
                <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
                <View style={styles.recipeOverlay}>
                  <View style={styles.glassBadgeContainer}>
                    <View style={styles.glassBadge}>
                      <Ionicons name="flame" size={14} color="#ffffff" />
                      <Text style={styles.glassBadgeText}>{item.cals}</Text>
                    </View>
                    <View style={styles.glassBadge}>
                      <Ionicons name="time" size={14} color="#ffffff" />
                      <Text style={styles.glassBadgeText}>{item.time}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.recipeInfo, { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a' }]}>
                  <Text style={styles.recipeTitle}>{item.name}</Text>
                  <Text style={styles.recipeShortDesc} numberOfLines={2}>{item.shortDesc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Other sections below */}

        {activeTab === 'glossary' && (
          <View>
            <Text style={styles.sectionTitle}>Глосарій термінів</Text>
            {TERMS.map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.termTitle}>{item.term}</Text>
                <Text style={styles.termDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'stretching' && (
          <View>
            <Text style={styles.sectionTitle}>Енциклопедія розтяжки</Text>
            {STRETCHES.map((item, index) => (
              <View key={index} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.stretchImage} resizeMode="cover" />
                <View style={styles.stretchInfo}>
                   <Text style={styles.termTitle}>{item.name}</Text>
                   <Text style={styles.termDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'bag' && (
          <View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
               <Text style={styles.sectionTitle}>Що взяти в зал?</Text>
               <TouchableOpacity onPress={resetChecklist}><Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Скинути</Text></TouchableOpacity>
            </View>
            <View style={styles.checklistContainer}>
              {checklist.map((item) => (
                <TouchableOpacity key={item.id} style={styles.checkItem} onPress={() => toggleCheck(item.id)}>
                  <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={26} color={item.checked ? COLORS.primary : COLORS.muted} />
                  <Text style={[styles.checkText, item.checked && styles.checkTextDone]}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal for detailed recipe */}
      {selectedRecipe && (
        <Modal visible={!!selectedRecipe} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedRecipe(null)}>
          <View style={[styles.modalContainer, {backgroundColor: COLORS.background}]}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              
              <View style={{position: 'relative'}}>
                 <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} resizeMode="cover" />
                 
                 <View style={styles.modalOverlayGradient}>
                   <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedRecipe(null)}>
                     <Ionicons name="close" size={24} color="#ffffff" />
                   </TouchableOpacity>
                 </View>
                 
                 <View style={[styles.modalGlassStats, { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' }]}>
                   <View style={styles.modalStatItem}>
                     <View style={styles.modalIconWrap}><Ionicons name="flame" size={24} color={COLORS.primary} /></View>
                     <Text style={styles.modalStatVal}>{selectedRecipe.cals}</Text>
                     <Text style={styles.modalStatLabel}>Ккал</Text>
                   </View>
                   <View style={styles.modalStatItem}>
                     <View style={styles.modalIconWrap}><Ionicons name="barbell" size={24} color={COLORS.primary} /></View>
                     <Text style={styles.modalStatVal}>{selectedRecipe.protein}</Text>
                     <Text style={styles.modalStatLabel}>Білок</Text>
                   </View>
                   <View style={styles.modalStatItem}>
                     <View style={styles.modalIconWrap}><Ionicons name="time" size={24} color={COLORS.primary} /></View>
                     <Text style={styles.modalStatVal}>{selectedRecipe.time}</Text>
                     <Text style={styles.modalStatLabel}>Час</Text>
                   </View>
                 </View>
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                <Text style={styles.modalDesc}>{selectedRecipe.desc}</Text>

                <Text style={styles.modalSectionTitle}>Інгредієнти</Text>
                <View style={[styles.ingredientsBox, { backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' }]}>
                  {selectedRecipe.ingredients.map((ing, i) => (
                     <View key={i} style={styles.ingredientRow}>
                       <View style={styles.ingredientDot} />
                       <Text style={styles.ingredientText}>{ing}</Text>
                     </View>
                  ))}
                </View>

                <Text style={styles.modalSectionTitle}>Покроковий рецепт</Text>
                <View style={styles.stepsBox}>
                  {selectedRecipe.instructions.map((step, i) => (
                     <View key={i} style={styles.stepRow}>
                       <View style={styles.stepNumberBox}>
                         <Text style={styles.stepNumberText}>{i+1}</Text>
                       </View>
                       <Text style={styles.stepText}>{step}</Text>
                     </View>
                  ))}
                </View>
                <View style={{height: 60}} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 40 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
  tabsContainer: { paddingHorizontal: 20, marginVertical: 15, maxHeight: 50 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', marginRight: 10, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', justifyContent: 'center' },
  activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontWeight: '600' },
  activeTabText: { color: COLORS.text === '#000000' ? '#ffffff' : COLORS.text, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  
  // Base Sections
  card: { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', overflow: 'hidden' },
  termTitle: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 5, marginTop: 15, paddingHorizontal: 15 },
  termDesc: { color: COLORS.muted, fontSize: 14, lineHeight: 20, paddingHorizontal: 15, paddingBottom: 15 },
  stretchImage: { width: '100%', height: 150 },
  stretchInfo: { paddingBottom: 5 },
  checklistContainer: { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#222' },
  checkText: { color: COLORS.text, fontSize: 16, marginLeft: 15 },
  checkTextDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
  
  // Recipes Re-design (iOS Aesthetic)
  recipeCard: { borderRadius: 24, marginBottom: 25, shadowColor: COLORS.text === '#000000' ? '#000' : '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, overflow: 'hidden' },
  recipeImage: { width: '100%', height: 220 },
  recipeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, padding: 15, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.15)' },
  glassBadgeContainer: { flexDirection: 'row', gap: 10 },
  glassBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.45)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, gap: 6 },
  glassBadgeText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  recipeInfo: { padding: 20 },
  recipeTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  recipeShortDesc: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  
  // Detailed Recipe Modal
  modalContainer: { flex: 1 },
  modalImage: { width: '100%', height: 320 },
  modalOverlayGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20 },
  closeModalBtn: { alignSelf: 'flex-end', marginTop: Platform.OS === 'ios' ? 20 : 10, backgroundColor: 'rgba(255,255,255,0.25)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  modalGlassStats: { position: 'absolute', bottom: -35, left: 20, right: 20, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15, borderWidth: 1 },
  modalStatItem: { alignItems: 'center', flex: 1 },
  modalIconWrap: { backgroundColor: 'rgba(230, 0, 0, 0.08)', padding: 12, borderRadius: 16, marginBottom: 8 },
  modalStatVal: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  modalStatLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  modalContent: { padding: 20, paddingTop: 60 },
  modalTitle: { color: COLORS.text, fontSize: 28, fontWeight: '900', marginBottom: 12, letterSpacing: -1 },
  modalDesc: { color: COLORS.muted, fontSize: 16, lineHeight: 24, marginBottom: 30 },
  
  modalSectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  ingredientsBox: { borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  ingredientDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 15 },
  ingredientText: { color: COLORS.text, fontSize: 16, flex: 1, fontWeight: '500' },
  
  stepsBox: { gap: 20 },
  stepRow: { flexDirection: 'row', gap: 15 },
  stepNumberBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(230, 0, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: COLORS.primary, fontWeight: '900', fontSize: 15 },
  stepText: { color: COLORS.text, fontSize: 16, lineHeight: 24, flex: 1, paddingTop: 4 },
});
