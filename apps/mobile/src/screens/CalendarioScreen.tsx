import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator, ImageBackground, ScrollView, RefreshControl } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import SerenataCard from '../components/SerenataCard';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarioScreen() {
  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredSerenatas, setFilteredSerenatas] = useState<any[]>([]);

  const fetchData = async () => {
    const { data } = await supabase.from('serenatas').select('*').order('hora', { ascending: true });
    if (data) {
      setSerenatas(data);
      const marked: any = {};
      data.forEach((s: any) => {
        const isCompleted = s.estado === 'completada';
        marked[s.fecha] = { 
          marked: true, 
          dotColor: isCompleted ? '#2ecc71' : '#e74c3c',
          selected: selectedDate === s.fecha,
          selectedColor: '#D4AF37'
        };
      });
      setMarkedDates(marked);
      
      // Si ya hay una fecha seleccionada, actualizar la lista filtrada
      if (selectedDate) {
        setFilteredSerenatas(data.filter((s: any) => s.fecha === selectedDate));
      }
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Refrescar automáticamente al entrar a la pestaña
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedDate])
  );

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const filtered = serenatas.filter(s => s.fecha === day.dateString);
    setFilteredSerenatas(filtered);
    
    // Actualizar marcadores visuales
    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach(key => {
      if (newMarked[key].marked) {
          newMarked[key] = { ...newMarked[key], selected: key === day.dateString };
      }
    });
    if (!newMarked[day.dateString]) {
        newMarked[day.dateString] = { selected: true, selectedColor: '#D4AF37' };
    }
    setMarkedDates(newMarked);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>CALENDARIO</Text>
            <Text style={styles.subtitle}>GESTIÓN VISUAL MARIACHI</Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
          ) : (
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}
            >
              <View style={styles.calendarContainer}>
                <Calendar
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: '#D4AF37',
                    selectedDayBackgroundColor: '#D4AF37',
                    selectedDayTextColor: '#000',
                    todayTextColor: '#D4AF37',
                    dayTextColor: '#FFF',
                    textDisabledColor: '#333',
                    dotColor: '#D4AF37',
                    monthTextColor: '#D4AF37',
                    indicatorColor: '#D4AF37',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12
                  }}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                />
              </View>

              <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.dateLabel}>
                    {selectedDate ? `Eventos para el ${selectedDate.split('-').reverse().join('-')}` : 'Toca un día para ver detalles'}
                    </Text>
                    {filteredSerenatas.length > 0 && (
                        <View style={styles.badgeCount}><Text style={styles.badgeText}>{filteredSerenatas.length}</Text></View>
                    )}
                </View>

                {filteredSerenatas.length > 0 ? (
                  filteredSerenatas.map(s => (
                    <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} />
                  ))
                ) : (
                  <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>Sin actividades programadas</Text>
                  </View>
                )}
              </View>
              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  header: { 
    paddingHorizontal: 30, 
    paddingTop: Platform.OS === 'ios' ? 60 : 50, 
    paddingBottom: 20,
    alignItems: 'center' 
  },
  title: { color: '#D4AF37', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 },
  subtitle: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 6, marginTop: 4, opacity: 0.6 },
  calendarContainer: { 
    margin: 15, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 25, 
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.1)'
  },
  listContainer: { padding: 10 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 15 },
  dateLabel: { color: '#D4AF37', fontWeight: 'bold', fontSize: 15 },
  badgeCount: { backgroundColor: '#D4AF37', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', fontStyle: 'italic', textAlign: 'center' }
});
