import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ImageBackground,
  Animated,
  Easing
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Music, Lock, Mail, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const FloatingNote = ({ delay }: { delay: number }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      moveAnim.setValue(0);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.5);
      rotateAnim.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: -700,
            duration: 4000 + Math.random() * 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ])
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const path = useMemo(() => ({
    mid: (Math.random() - 0.5) * 150,
    end: (Math.random() - 0.5) * 300
  }), []);

  const translateX = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, path.mid, path.end]
  });

  return (
    <Animated.View style={[
      styles.floatingNote,
      {
        opacity: opacityAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 0]
        }),
        transform: [
          { translateY: moveAnim },
          { translateX: translateX },
          { scale: scaleAnim },
          { rotate: rotate }
        ]
      }
    ]}>
      <Music color="#D4AF37" size={16} />
    </Animated.View>
  );
};

export default function LoginScreen({ onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(compatible && enrolled);

    const storedEmail = await SecureStore.getItemAsync('user_email');
    if (storedEmail) setHasStoredCredentials(true);
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Inicia sesión con tu huella',
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        setLoading(true);
        const storedEmail = await SecureStore.getItemAsync('user_email');
        const storedPassword = await SecureStore.getItemAsync('user_password');

        if (storedEmail && storedPassword) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword,
          });
          if (error) throw error;
          if (onLogin) onLogin(data.session);
        } else {
          Alert.alert('Error', 'No se encontraron credenciales guardadas.');
        }
      }
    } catch (e: any) {
      Alert.alert('Error Biométrico', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('tipo_usuario')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData || userData.tipo_usuario !== 'admin') {
        await supabase.auth.signOut();
        Alert.alert('Acceso Denegado', 'Solo los administradores pueden ingresar al sistema.');
        setLoading(false);
        return;
      }

      // Si el login es exitoso, preguntamos si quiere activar huella si no lo ha hecho
      const biometricsEnabled = await SecureStore.getItemAsync('biometrics_enabled');
      if (biometricsAvailable && biometricsEnabled !== 'true') {
        Alert.alert(
          'Activar Huella Digital',
          '¿Deseas activar el inicio de sesión con huella para la próxima vez?',
          [
            { text: 'Ahora no', onPress: () => { if (onLogin) onLogin(data.session); } },
            { 
              text: 'Sí, Activar', 
              onPress: async () => {
                await SecureStore.setItemAsync('user_email', email);
                await SecureStore.setItemAsync('user_password', password);
                await SecureStore.setItemAsync('biometrics_enabled', 'true');
                if (onLogin) onLogin(data.session);
              } 
            }
          ]
        );
      } else {
        if (onLogin) onLogin(data.session);
      }
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
                {[...Array(10)].map((_, i) => (
                  <FloatingNote key={i} delay={i * 600} />
                ))}
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
                  autoComplete="off"
                  importantForAutofill="no"
                  selectionColor="#D4AF37"
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
                  autoComplete="off"
                  importantForAutofill="no"
                  selectionColor="#D4AF37"
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

              {biometricsAvailable && hasStoredCredentials && (
                <TouchableOpacity 
                  style={styles.biometricButton} 
                  onPress={handleBiometricLogin}
                  disabled={loading}
                >
                  <View style={styles.fingerprintIconCircle}>
                    <Fingerprint color="#D4AF37" size={50} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.biometricText}>INICIAR SESIÓN CON HUELLA DIGITAL</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: 'rgba(0,0,0,0.65)',
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
  floatingNote: {
    position: 'absolute',
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
  },
  biometricButton: {
    alignItems: 'center',
    gap: 15,
    marginTop: 35,
    padding: 20,
    width: '100%',
  },
  fingerprintIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  biometricText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.8,
    textAlign: 'center',
  }
});
