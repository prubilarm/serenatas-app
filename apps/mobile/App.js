import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Plus, Music } from 'lucide-react-native';
import SerenataCard from './src/components/SerenataCard';

export default function App() {
  const [serenatas] = useState([
    {
      id: '1',
      nombre_festejada: 'Doña Elena',
      motivo: 'Cumpleaños 80',
      cliente: 'Roberto Mora',
      telefono: '+56912345678',
      direccion: 'Av. Libertador 123',
      comuna: 'Santiago Centro',
      hora: '19:30',
    },
    {
      id: '2',
      nombre_festejada: 'Valentina',
      motivo: 'Aniversario',
      cliente: 'Marco Polo',
      telefono: '+56987654321',
      direccion: 'Calle Las Flores 456',
      comuna: 'Ñuñoa',
      hora: '21:00',
    }
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hoy</Text>
          <Text style={styles.subtitle}>Mariachi Aventurero</Text>
        </div>
        <View style={styles.stats}>
          <Text style={styles.statValue}>{serenatas.length}</Text>
          <Text style={styles.statLabel}>Eventos</Text>
        </View>
      </View>

      {/* Lista de Serenatas */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {serenatas.map(s => (
          <SerenataCard key={s.id} serenata={s} />
        ))}
      </ScrollView>

      {/* Botón Flotante */}
      <TouchableOpacity style={styles.fab}>
        <Plus color="#000" size={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#D4AF37',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  stats: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 10,
    borderRadius: 12,
    minWidth: 70,
  },
  statValue: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#D4AF37',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espacio para el FAB
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#D4AF37',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  }
});
