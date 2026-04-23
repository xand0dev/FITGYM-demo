import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Vibration, Animated } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAppStore from '../store/useAppStore';

// REAL AI INTEGRATION (Google Gemini API)
// Для роботи реального штучного інтелекту потрібно вказати API ключ.
// Зберігайте цей ключ у файлі .env як EXPO_PUBLIC_GEMINI_API_KEY
const rawKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_KEY = rawKey.replace(/['"]/g, '').trim() || "СЮДИ_ВСТАВТЕ_ВАШ_КЛЮЧ_GEMINI"; 
const AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `Ти — елітний фітнес-тренер та дієтолог додатку FITGYM. Ти розмовляєш тільки українською мовою. Твої відповіді повинні бути професійними, мотиваційними, лаконічними (не більше 3-4 абзаців) та адаптованими під фітнес-ціль користувача. Додавай емодзі для настрою. Ніколи не зізнавайся, що ти просто мовна модель. ВАЖЛИВО: Ніколи не використовуй форматування Markdown (*, **, #). Форматуй тільки за допомогою абзаців (нових рядків).`;

const TypeWriterText = ({ text, onComplete, style }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 20); // Typing speed
    
    return () => clearInterval(timer);
  }, [text]);

  return <Text style={style}>{displayedText}</Text>;
};

function TypingDots({ color }) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    dots.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((dots.length - 1 - i) * 200),
        ])
      ).start();
    });
    return () => dots.forEach(a => a.stopAnimation());
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 }}>
      {dots.map((anim, i) => (
        <Animated.View
          key={i}
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginHorizontal: 3, transform: [{ translateY: anim }] }}
        />
      ))}
    </View>
  );
}

export default function AICoachScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const navigation = useNavigation();
  const { fitnessGoal, streak, aiChatHistory, updateAiChatHistory, clearAiChatHistory } = useAppStore();
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState(aiChatHistory);
  const [inputText, setInputText] = useState('');
  
  // Синхронізуємо локальні повідомлення з глобальним (збереженим) станом
  useEffect(() => {
    if (!messages.some(m => m.isTyping)) {
      updateAiChatHistory(messages);
    }
  }, [messages]);
  const [isTyping, setIsTyping] = useState(false);

  const SUGGESTIONS = [
    "Склади програму на сьогодні",
    "Що з'їсти після тренування?",
    "Дай мені мотивацію!",
  ];

  const fetchRealAIResponse = async (userMessage, chatHistory) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "СЮДИ_ВСТАВТЕ_ВАШ_КЛЮЧ_GEMINI") {
        return "Щоб я відповідав як справжній безкоштовний ШІ, тобі потрібно отримати ключ на aistudio.google.com та вставити його у файл `.env` як EXPO_PUBLIC_GEMINI_API_KEY. Поки що я працюю в демо-режимі. 🔧";
    }

    try {
      const goalText = fitnessGoal === 'weight_loss' ? 'Схуднення' : fitnessGoal === 'muscle_gain' ? 'Набір маси' : 'Підтримка форми';
      
      // Будуємо правильну багатоходову історію (Multi-turn), де ролі суворо чергуються
      let contents = [];
      let lastRole = null;

      // Беремо всю історію (або останні 14 повідомлень для безпеки)
      const recentHistory = chatHistory.slice(-14);

      for (const m of recentHistory) {
        const apiRole = m.role === 'ai' ? 'model' : 'user';

        if (apiRole === lastRole && contents.length > 0) {
           // Якщо юзер написав два повідомлення підряд, ми склеюємо їх в одне,
           // бо Gemini вимагає обов'язкового чергування user -> model -> user
           contents[contents.length - 1].parts[0].text += '\n\n' + m.text;
        } else {
           contents.push({ role: apiRole, parts: [{ text: m.text }] });
           lastRole = apiRole;
        }
      }

      // Gemini вимагає, щоб ПЕРШЕ повідомлення завжди було від 'user'.
      // Якщо першим виявився 'model' (наприклад, стартове привітання), видаляємо його.
      while (contents.length > 0 && contents[0].role === 'model') {
         contents.shift();
      }

      const response = await fetch(`${AI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
             parts: [{ text: `${SYSTEM_PROMPT}\nПоточна ціль користувача: ${goalText}. Його стрік активності: ${streak} днів.` }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const fullText = data.candidates[0].content.parts.map(p => p.text).join('');
        // Очищаємо від будь-якого Markdown (зірочки, решітки), якщо ШІ все ж використав їх
        return fullText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').replace(/^\[Тренер\]:\s*/i, '').trim();
      } else {
        console.log("Відповідь API:", data);
        if (data.error) {
           return `Помилка Gemini: ${data.error.message}`;
        }
        return "Вибач, я трохи перевтомився на тренуванні. Повтори ще раз, будь ласка. 😅";
      }
    } catch (error) {
      console.log('Gemini API Error:', error);
      return "Упс, здається, гантеля впала на мій Wi-Fi роутер! Немає зв'язку з сервером. 📡";
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const currentMessages = [...messages, userMsg];
    
    setMessages(currentMessages);
    setInputText('');
    setIsTyping(true);
    Vibration.vibrate(20);

    // Call Real AI API
    const aiReplyText = await fetchRealAIResponse(text, currentMessages);
    
    const aiMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: aiReplyText, isTyping: true };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
    Vibration.vibrate([0, 30, 30, 30]); // Haptic feedback when AI replies
  };

  const handleTypeWriterComplete = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTyping: false } : m));
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Core AI Coach</Text>
            <View style={styles.onlineBadge}>
               <View style={styles.onlineDot} />
               <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={() => {
              clearAiChatHistory();
              setMessages([{ id: Date.now().toString(), role: 'ai', text: "Пам'ять успішно стерто! Розпочнемо з чистого аркуша. Чим можу допомогти?" }]);
          }}>
            <Ionicons name="trash-outline" size={24} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef} 
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUserWrap : styles.messageAIWrap]}>
              {msg.role === 'ai' && (
                <View style={[styles.aiAvatar, {backgroundColor: COLORS.primary + '20'}]}>
                  <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
                </View>
              )}
              
              <View style={[
                  styles.messageBubble, 
                  msg.role === 'user' ? [styles.messageBubbleUser, {backgroundColor: COLORS.primary}] : [styles.messageBubbleAI, {backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a'}]
                ]}>
                
                {msg.role === 'ai' && msg.isTyping ? (
                   <TypeWriterText 
                     text={msg.text} 
                     style={[styles.messageText, {color: COLORS.text}]} 
                     onComplete={() => handleTypeWriterComplete(msg.id)} 
                   />
                ) : (
                   <Text style={[styles.messageText, {color: msg.role === 'user' ? '#000' : COLORS.text}]}>
                     {msg.text}
                   </Text>
                )}
                
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageWrapper, styles.messageAIWrap]}>
              <View style={[styles.aiAvatar, {backgroundColor: COLORS.primary + '20'}]}>
                <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAI, {backgroundColor: COLORS.cardBackground, flexDirection: 'row', alignItems: 'center'}]}>
                <TypingDots color={COLORS.muted} />
              </View>
            </View>
          )}

          {/* Quick Suggestions at the bottom if no recent user messages and AI is not typing */}
          {(!isTyping && messages[messages.length - 1].role === 'ai') && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
              {SUGGESTIONS.map((sug, idx) => (
                <TouchableOpacity key={idx} style={[styles.suggestionBtn, {borderColor: COLORS.primary}]} onPress={() => handleSend(sug)}>
                  <Text style={[styles.suggestionText, {color: COLORS.primary}]}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, {borderTopColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333'}]}>
          <TextInput
            style={[styles.input, {backgroundColor: ObjectHasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', color: COLORS.text}]}
            placeholder="Запитай щось у тренера..."
            placeholderTextColor={COLORS.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, {backgroundColor: inputText.trim() ? COLORS.primary : COLORS.muted + '50'}]} 
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? '#000' : '#fff'} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#222'
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  clearBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00ff00', marginRight: 5, shadowColor: '#00ff00', shadowOpacity: 0.8, shadowRadius: 5 },
  onlineText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  
  chatContainer: { padding: 20, paddingBottom: 40 },
  
  messageWrapper: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  messageUserWrap: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageAIWrap: { alignSelf: 'flex-start' },
  
  aiAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10, alignSelf: 'flex-end', marginBottom: 4 },
  
  messageBubble: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24 },
  messageBubbleUser: { borderBottomRightRadius: 6 },
  messageBubbleAI: { borderBottomLeftRadius: 6, borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  
  messageText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.muted, marginHorizontal: 3 },
  
  suggestionsContainer: { marginTop: 10, marginBottom: 20, paddingBottom: 10 },
  suggestionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  suggestionText: { fontWeight: '700', fontSize: 13 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15, borderTopWidth: 1, backgroundColor: COLORS.background },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 24, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, fontSize: 16 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }
});
