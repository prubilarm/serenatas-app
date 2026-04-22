import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Dimensions
} from 'react-native';
import { TrendingUp, DollarSign, Calendar, Music } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function ReportesScreen() {
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalSerenatas: 0,
    serenatasMes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('serenatas').select('*');
      if (data) {
        const ingresos = data.reduce((acc: number, curr: any) => acc + (curr.precio_total || 0), 0);
        setStats({
          totalIngresos: ingresos,
          totalSerenatas: data.length,
          serenatasMes: data.filter((s: any) => s.estado === 'completada').length
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos Totales</Text>
          <Text style={styles.summaryValue}>${stats.totalIngresos.toLocaleString()}</Text>
          <View style={styles.trend}>
             <TrendingUp size={16} color="#25D366" />
             <Text style={styles.trendText}>Tendencia Positiva</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.smallCard}>
            <Calendar color="#D4AF37" size={24} />
            <Text style={styles.cardVal}>{stats.totalSerenatas}</Text>
            <Text style={styles.cardLab}>Eventos</Text>
          </View>
          <View style={styles.smallCard}>
            <Music color="#D4AF37" size={24} />
            <Text style={styles.cardVal}>{stats.serenatasMes}</Text>
            <Text style={styles.cardLab}>Completadas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Distribución de Ingresos</Text>
        <View style={styles.chartPlaceholder}>
           <Text style={styles.chartText}>Gráfico de rendimiento próximamente</Text>
           <View style={styles.chartBar} />
           <View style={[styles.chartBar, {width: '80%', opacity: 0.6}]} />
           <View style={[styles.chartBar, {width: '40%', opacity: 0.3}]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, backgroundColor: '#111' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  summaryCard: { backgroundColor: '#1A1A1A', padding: 25, borderRadius: 20, marginBottom: 20, borderBottomWidth: 4, borderBottomColor: '#D4AF37' },
  summaryLabel: { color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  summaryValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trendText: { color: '#25D366', fontSize: 12, fontWeight: 'bold' },
  grid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  smallCard: { flex: 1, backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20, alignItems: 'center' },
  cardVal: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  cardLab: { color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase' },
  sectionTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  chartPlaceholder: { backgroundColor: '#1A1A1A', padding: 30, borderRadius: 20, alignItems: 'center' },
  chartText: { color: 'rgba(255,255,255,0.2)', fontSize: 12, marginBottom: 20 },
  chartBar: { height: 10, backgroundColor: '#D4AF37', width: '100%', borderRadius: 5, marginBottom: 10 }
});
