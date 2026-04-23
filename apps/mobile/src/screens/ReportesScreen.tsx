import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator, ImageBackground, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { BarChart3, FileText, Download, Share2, TrendingUp } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function ReportesScreen() {
  const [totalSerenatas, setTotalSerenatas] = useState(0);
  const [completadas, setCompletadas] = useState(0);
  const [ingresos, setIngresos] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const { data } = await supabase.from('serenatas').select('*');
    if (data) {
      setTotalSerenatas(data.length);
      const done = data.filter(s => s.estado === 'completada');
      setCompletadas(done.length);
      const total = done.reduce((acc, curr) => acc + (curr.precio_total || 0), 0);
      setIngresos(total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const downloadReport = () => {
    const url = 'https://api-alpha-five-25.vercel.app/api/reportes/pdf';
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.header}>
            <Text style={styles.title}>Reportes & Analítica</Text>
            <Text style={styles.subtitle}>Resumen Financiero Mariachi</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.statCard}>
                <TrendingUp color="#D4AF37" size={32} />
                <View style={{ marginLeft: 20 }}>
                    <Text style={styles.statLabel}>INGRESOS TOTALES</Text>
                    <Text style={styles.statValue}>${ingresos.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.statCard, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.statLabel}>SERENATAS</Text>
                    <Text style={styles.statValue}>{totalSerenatas}</Text>
                </View>
                <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statLabel}>REALIZADAS</Text>
                    <Text style={styles.statValue}>{completadas}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.downloadBtn} onPress={downloadReport}>
                <FileText color="#000" size={24} />
                <Text style={styles.downloadText}>DESCARGAR REPORTE GENERAL (PDF)</Text>
            </TouchableOpacity>

            <Text style={styles.infoFooter}>Los reportes se generan en tiempo real basados en los datos de la nube.</Text>
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
  header: { padding: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  content: { padding: 25 },
  statCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 25, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', marginBottom: 20 },
  statLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  downloadBtn: { backgroundColor: '#D4AF37', padding: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginTop: 20 },
  downloadText: { color: '#000', fontWeight: 'bold' },
  infoFooter: { color: '#444', textAlign: 'center', marginTop: 40, fontSize: 11, fontStyle: 'italic' }
});
