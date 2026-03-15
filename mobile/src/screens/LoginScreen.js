import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { COLORS } from '../constants/theme';
import useAppStore from '../store/useAppStore';

const schema = yup.object({
  username: yup.string().required('Введіть логін'),
  password: yup.string().required('Введіть пароль').min(4, 'Пароль занадто короткий'),
}).required();

export default function LoginScreen() {
  const login = useAppStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await login(data.username, data.password);
    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>FIT<Text style={{color: COLORS.primary}}>GYM</Text></Text>
      
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput 
                style={[styles.input, errors.username && styles.inputError]} 
                placeholder="Логін" 
                placeholderTextColor="#555"
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
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput 
                style={[styles.input, errors.password && styles.inputError]} 
                placeholder="Пароль" 
                placeholderTextColor="#555"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </>
          )}
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSubmit(onSubmit)} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.buttonText}>УВІЙТИ</Text>
          )}
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
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginBottom: 10, marginTop: -10, marginLeft: 5 },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: COLORS.text, fontWeight: '900', fontSize: 16 }
});