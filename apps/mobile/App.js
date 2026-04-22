import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Calendar, Users, BarChart3, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

// Screens
import AgendaScreen from './src/screens/AgendaScreen';
import ClientesScreen from './src/screens/ClientesScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import LoginScreen from './src/screens/LoginScreen';
import { supabase } from './src/lib/supabase';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Agenda') return <Calendar color={color} size={size} />;
          if (route.name === 'Clientes') return <Users color={color} size={size} />;
          if (route.name === 'Reportes') return <BarChart3 color={color} size={size} />;
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#333',
          paddingBottom: 5,
        },
        headerStyle: {
          backgroundColor: '#111',
          borderBottomColor: '#333',
        },
        headerTintColor: '#D4AF37',
      })}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Clientes" component={ClientesScreen} />
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
