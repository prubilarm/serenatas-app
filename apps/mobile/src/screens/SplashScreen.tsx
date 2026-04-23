import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground, Dimensions } from 'react-native';
import { Music } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      )
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <ImageBackground 
      source={require('../../assets/fondo_app.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
             <View style={styles.logoCircle}>
                <Music color="#D4AF37" size={60} />
             </View>
          </Animated.View>
          <Text style={styles.title}>EL MARIACHI</Text>
          <Text style={styles.subtitle}>AVENTURERO</Text>
          <View style={styles.loaderLine}>
             <Animated.View style={[styles.loaderProgress, {
               width: fadeAnim.interpolate({
                 inputRange: [0, 1],
                 outputRange: ['0%', '100%']
               })
             }]} />
          </View>
          <Text style={styles.loadingText}>CARGANDO REPERTORIO...</Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowRadius: 15,
    shadowOpacity: 0.5,
  },
  title: {
    color: '#D4AF37',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 5,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 12,
    marginTop: -5,
  },
  loaderLine: {
    width: width * 0.6,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    marginTop: 40,
    overflow: 'hidden',
  },
  loaderProgress: {
    height: '100%',
    backgroundColor: '#D4AF37',
  },
  loadingText: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 15,
    letterSpacing: 2,
  }
});
