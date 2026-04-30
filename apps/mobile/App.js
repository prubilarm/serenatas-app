import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, PanResponder } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Calendar as CalendarIcon, List, CheckCircle2 } from 'lucide-react-native';

// SOLUCIÓN CRÍTICA: Desactiva el motor de pantallas nativo que causa el cierre inmediato en Android
import { enableScreens } from 'react-native-screens';
enableScreens(false);

// Screens
import AgendaScreen from './src/screens/AgendaScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import FinalizadasScreen from './src/screens/FinalizadasScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import { supabase } from './src/lib/supabase';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const INACTIVITY_LIMIT = 5 * 60 * 1000;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#1A1A1A',
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="Agenda" 
        component={AgendaScreen} 
        options={{ tabBarIcon: ({ color }) => <List color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Finalizadas" 
        component={FinalizadasScreen} 
        options={{ tabBarIcon: ({ color }) => <CheckCircle2 color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Calendario" 
        component={CalendarioScreen} 
        options={{ tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} /> }}
      />
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
    } catch (e) { console.error(e); }
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (session) {
      timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => { resetTimer(); return false; },
      onMoveShouldSetPanResponderCapture: () => { resetTimer(); return false; },
    })
  ).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      resetTimer();
    });

    if (Platform.OS === 'android') {
      const setImmersive = async () => {
        try {
          await NavigationBar.setVisibilityAsync('hidden').catch(() => {});
          await NavigationBar.setBackgroundColorAsync('#000000').catch(() => {});
        } catch (e) {}
      };
      setImmersive();
    }
  }, []);

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
