import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Calendar as CalendarIcon, List, BarChart3 } from 'lucide-react-native';

// Screens
import AgendaScreen from './src/screens/AgendaScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import LoginScreen from './src/screens/LoginScreen';
import { supabase } from './src/lib/supabase';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          if (route.name === 'Agenda') return <List color={color} size={20} />;
          if (route.name === 'Calendario') return <CalendarIcon color={color} size={20} />;
          if (route.name === 'Reportes') return <BarChart3 color={color} size={20} />;
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: 'gray',
        tabBarShowIcon: true,
        tabBarLabelStyle: { fontSize: 9, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#D4AF37', top: 0 },
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#222',
          paddingBottom: Platform.OS === 'android' ? 25 : 35, // MAS PADDING ABAJO
          height: Platform.OS === 'android' ? 75 : 90,
        },
      })}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Calendario" component={CalendarioScreen} options={{ title: 'Calendario' }} />
      <Tab.Screen name="Reportes" component={ReportesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
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
  );
}
