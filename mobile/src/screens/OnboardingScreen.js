import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated, Platform, Vibration } from 'react-native';
import { useTheme } from '../constants/theme';
import useAppStore from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  { 
    id: '1', 
    title: 'Ласкаво Просимо', 
    desc: 'Ваш ідеальний простір для тренувань, планування та досягнення нових висот.', 
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&fit=crop'
  },
  { 
    id: '2', 
    title: 'Бронювання Занять', 
    desc: 'Обирайте напрямки та записуйтесь на групові тренування в 1 клік. Без зайвих дзвінків.', 
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&fit=crop'
  },
  { 
    id: '3', 
    title: 'Екосистема Клубу', 
    desc: 'Слідкуйте за водою, спілкуйтеся в стрічці та підбирайте здоровий раціон у довіднику.', 
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&fit=crop'
  },
  {
    id: '4',
    title: 'Ваша Головна Ціль',
    desc: 'Оберіть напрямок, щоб ми могли персоналізувати ваш головний екран.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&fit=crop',
    isGoalSelection: true
  }
];

const GOALS = [
  { id: 'weight_loss', label: 'Схуднення та Тонус', emoji: '🔥' },
  { id: 'muscle_gain', label: 'Набір М\'язової Маси', emoji: '💪' },
  { id: 'keep_fit', label: 'Підтримка Форми', emoji: '🥗' }
];

export default function OnboardingScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const { completeOnboarding, setFitnessGoal } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Complete Onboarding if on last slide
      if (!selectedGoal) {
         // Default if they didn't pick
         setFitnessGoal('keep_fit');
      } else {
         setFitnessGoal(selectedGoal);
      }
      completeOnboarding();
    }
  };

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
    Vibration.vibrate(20);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.gradientOverlay} />
      
      <View style={styles.contentBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>

        {item.isGoalSelection && (
          <View style={styles.goalsContainer}>
            {GOALS.map(goal => (
               <TouchableOpacity 
                 key={goal.id} 
                 style={[styles.goalBtn, selectedGoal === goal.id && styles.goalBtnActive]}
                 onPress={() => handleGoalSelect(goal.id)}
                 activeOpacity={0.8}
               >
                 <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                 <Text style={[styles.goalText, selectedGoal === goal.id && styles.goalTextActive]}>{goal.label}</Text>
               </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
           {SLIDES.map((_, i) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [10, 24, 10],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return <Animated.View key={i.toString()} style={[styles.dot, { width: dotWidth, opacity }]} />;
           })}
        </View>

        <TouchableOpacity 
           style={[styles.button, currentIndex === SLIDES.length - 1 && !selectedGoal && {opacity: 0.5}]} 
           onPress={scrollToNext} 
           activeOpacity={0.8}
        >
           <Text style={styles.buttonText}>{currentIndex === SLIDES.length - 1 ? 'ПОЧАТИ' : 'ДалІ'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  slide: { width, height },
  image: { flex: 1, width: '100%', height: '100%' },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  contentBox: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 30, 
    paddingBottom: Platform.OS === 'ios' ? 140 : 120, // space for footer
    backgroundColor: ObjectHasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#111',
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 20
  },
  title: { color: COLORS.text, fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 15 },
  desc: { color: COLORS.muted, fontSize: 16, lineHeight: 24, paddingRight: 20 },
  
  goalsContainer: { marginTop: 20, gap: 10 },
  goalBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A', borderWidth: 2, borderColor: 'transparent' },
  goalBtnActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}20` },
  goalEmoji: { fontSize: 24, marginRight: 15 },
  goalText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  goalTextActive: { color: COLORS.primary, fontWeight: '900' },

  footer: { 
    position: 'absolute', 
    bottom: Platform.OS === 'ios' ? 40 : 20, 
    left: 30, right: 30,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  pagination: { flexDirection: 'row', alignItems: 'center', height: 40 },
  dot: { height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginHorizontal: 4 },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '800', textTransform: 'uppercase' }
});
