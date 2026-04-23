import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, PanResponder } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Calendar as CalendarIcon, List, BarChart3, CheckCircle2 } from 'lucide-react-native';

// Screens
import AgendaScreen from './src/screens/AgendaScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import FinalizadasScreen from './src/screens/FinalizadasScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutos

function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          if (route.name === 'Agenda') return <List color={color} size={20} />;
          if (route.name === 'Finalizadas') return <CheckCircle2 color={color} size={20} />;
          if (route.name === 'Calendario') return <CalendarIcon color={color} size={20} />;
          if (route.name === 'Reportes') return <BarChart3 color={color} size={20} />;
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: 'gray',
        tabBarShowIcon: true,
        tabBarLabelStyle: { fontSize: 8, fontWeight: 'bold' },
        tabBarActiveLabelStyle: { color: '#D4AF37' },
        tabBarIndicatorStyle: { backgroundColor: '#D4AF37', top: 0 },
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#222',
          paddingBottom: Platform.OS === 'android' ? 25 : 45,
          height: Platform.OS === 'android' ? 75 : 105,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0
        },
      })}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Finalizadas" component={FinalizadasScreen} options={{ title: 'Finalizadas' }} />
      <Tab.Screen name="Calendario" component={CalendarioScreen} options={{ title: 'Calendario' }} />
      <Tab.Screen name="Reportes" component={ReportesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (e) {
      console.error("Auto-logout error:", e);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (session) {
      timerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_LIMIT);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      resetTimer();
    });

    // Modo Inmersivo para Android
    if (Platform.OS === 'android') {
      const setImmersive = async () => {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('inset-touch');
          await NavigationBar.setBackgroundColorAsync('#000000');
        } catch (e) {}
      };
      setImmersive();
    }

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    resetTimer();
  }, [session]);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={setSession} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
