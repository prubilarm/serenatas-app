import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Music, Lock, Mail } from 'lucide-react-native';

export default function LoginScreen({ onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (onLogin) onLogin(data.session);
    } catch (e: any) {
      Alert.alert('Error de Acceso', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/fondo_login.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.inner}>
            <View style={styles.logoContainer}>
              <View style={styles.iconCircle}>
                <Music color="#D4AF37" size={50} />
              </View>
              <Text style={styles.title}>EL MARIACHI</Text>
              <Text style={styles.subtitle}>AVENTURERO</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Mail color="#D4AF37" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo Electrónico"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Lock color="#D4AF37" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>INGRESAR AL SISTEMA</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)', // Oscurecemos la imagen para legibilidad
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowRadius: 20,
    shadowOpacity: 0.2,
  },
  title: {
    color: '#D4AF37',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 12,
    letterSpacing: 10,
    marginTop: -5,
    opacity: 0.9,
    fontWeight: 'bold',
  },
  form: {
    gap: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 18,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 60,
    color: '#FFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#D4AF37',
    height: 60,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  }
});
