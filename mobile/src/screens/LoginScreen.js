import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { AuthContext } from '../store/AuthContext'; // Підключаємо контекст

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Дістаємо функцію login з контексту
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    if (!username || !password) {
      alert("Введіть логін та пароль!");
      return;
    }
    // Викликаємо функцію з бекенду
    login(username, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>FIT<Text style={{color: COLORS.primary}}>GYM</Text></Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Логін" 
          placeholderTextColor="#555"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none" // Щоб телефон не робив першу букву великою
        />
        <TextInput 
          style={styles.input} 
          placeholder="Пароль" 
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin} 
        >
          <Text style={styles.buttonText}>УВІЙТИ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 30 },
  inputContainer: { width: '100%' },
  logoText: { color: COLORS.text, fontSize: 48, fontWeight: '900', textAlign: 'center', marginBottom: 50, letterSpacing: -2 },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', padding: 15, color: COLORS.text, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: COLORS.text, fontWeight: '900', fontSize: 16 }
});