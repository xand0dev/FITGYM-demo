import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../constants/theme';
import useAppStore from '../store/useAppStore';

const schema = yup.object({
  username: yup.string().required('Введіть логін'),
  name: yup.string().required('Введіть ім\'я (ПІБ)'),
  email: yup.string().email('Невірний формат email').required('Введіть email'),
  password: yup.string().required('Введіть пароль').min(8, 'Пароль занадто короткий (мінімум 8 символів)'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Паролі не збігаються').required('Підтвердіть пароль'),
}).required();

export default function RegisterScreen({ navigation }) {
  const registerAction = useAppStore((state) => state.register);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await registerAction(data.username, data.name, data.email, data.password);
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.logoText}>FIT<Text style={{color: COLORS.primary}}>GYM</Text></Text>
        <Text style={styles.pageTitle}>Реєстрація</Text>
        
        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.username && styles.inputError]} 
                  placeholder="Логін" 
                  placeholderTextColor={COLORS.muted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                />
                {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.name && styles.inputError]} 
                  placeholder="Ім'я (П.І.Б)" 
                  placeholderTextColor={COLORS.muted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.email && styles.inputError]} 
                  placeholder="Email" 
                  placeholderTextColor={COLORS.muted}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.password && styles.inputError]} 
                  placeholder="Пароль" 
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.confirmPassword && styles.inputError]} 
                  placeholder="Підтвердіть пароль" 
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
              </>
            )}
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.text === '#000000' ? '#ffffff' : COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>СТВОРИТИ АКАУНТ</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.authLinkBtn}
            onPress={() => navigation.navigate('Auth')} 
          >
             <Text style={styles.authLinkText}>Вже є акаунт? <Text style={{color: COLORS.primary}}>Увійти</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  inputContainer: { width: '100%' },
  logoText: { color: COLORS.text, fontSize: 40, fontWeight: '900', textAlign: 'center', marginBottom: 10, letterSpacing: -2 },
  pageTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, textTransform: 'uppercase' },
  input: { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#141414', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', padding: 15, color: COLORS.text, borderRadius: 8, marginBottom: 15 },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginBottom: 10, marginTop: -10, marginLeft: 5 },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontWeight: '900', fontSize: 16 }, // White text on primary bg
  authLinkBtn: { marginTop: 20, alignItems: 'center' },
  authLinkText: { color: COLORS.muted, fontSize: 14 }
});
