import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
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
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredSerenatas, setFilteredSerenatas] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('serenatas').select('*').order('hora', { ascending: true });
    if (data) {
      setSerenatas(data);
      const marked: any = {};
      data.forEach((s: any) => {
        const color = s.estado === 'completada' ? '#2ecc71' : '#e74c3c';
        marked[s.fecha] = { 
          marked: true, 
          dotColor: color,
          selected: selectedDate === s.fecha,
          selectedColor: '#D4AF37'
        };
      });
      setMarkedDates(marked);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const filtered = serenatas.filter(s => s.fecha === day.dateString);
    setFilteredSerenatas(filtered);
    
    // Actualizar marcadores para resaltar el día seleccionado
    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach(key => {
      newMarked[key] = { ...newMarked[key], selected: key === day.dateString };
    });
    // Si el día no tenía eventos, añadirlo como seleccionado
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
            <Text style={styles.title}>Calendario de Serenatas</Text>
            <Text style={styles.subtitle}>Gestión Visual de Eventos</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
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
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12
                  }}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                />
              </View>

              <View style={styles.listContainer}>
                <Text style={styles.dateLabel}>
                   {selectedDate ? `Eventos para el ${selectedDate.split('-').reverse().join('-')}` : 'Seleccione un día'}
                </Text>
                {filteredSerenatas.length > 0 ? (
                  filteredSerenatas.map(s => (
                    <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No hay serenatas programadas para este día.</Text>
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
  header: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 },
  calendarContainer: { 
    margin: 15, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 20, 
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)'
  },
  listContainer: { padding: 20 },
  dateLabel: { color: '#D4AF37', fontWeight: 'bold', marginBottom: 15, fontSize: 14 },
  emptyText: { color: '#444', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});
