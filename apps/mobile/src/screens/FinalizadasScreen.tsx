import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, RefreshControl, 
  SafeAreaView, ImageBackground, StatusBar, TextInput 
} from 'react-native';
import { CheckCircle2, Music, Search, Calendar } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import SerenataCard from '../components/SerenataCard';

export default function FinalizadasScreen() {
  const [serenatas, setSerenatas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from('serenatas')
        .select('*')
        .eq('estado', 'completada')
        .order('fecha', { ascending: false });
      setSerenatas(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredSerenatas = useMemo(() => {
    if (!searchQuery.trim()) return serenatas;
    return serenatas.filter((s: any) => 
      s.nombre_festejada?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nombre_cliente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.comuna?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [serenatas, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.bgOverlay}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>FINALIZADAS</Text>
            <Text style={styles.headerSubtitle}>HISTORIAL DE ÉXITO</Text>
        </View>

        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Search size={18} color="#666" />
            <TextInput 
              style={styles.searchBarInput} 
              placeholder="Buscar en historial..." 
              placeholderTextColor="#444" 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
            />
          </View>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#2ecc71" />}
        >
          {filteredSerenatas.length === 0 ? (
            <View style={styles.emptyBox}>
              <CheckCircle2 color="#222" size={80} />
              <Text style={styles.emptyText}>No se encontraron serenatas.</Text>
            </View>
          ) : (
            filteredSerenatas.map((s: any) => <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} />)
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View></ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  header: { 
    paddingHorizontal: 30, 
    paddingTop: Platform.OS === 'ios' ? 60 : 50, 
    paddingBottom: 20,
    alignItems: 'center' 
  },
  headerTitle: { color: '#2ecc71', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 },
  headerSubtitle: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 6, marginTop: 4, opacity: 0.6 },
  searchBarWrapper: { paddingHorizontal: 25, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchBarInput: { flex: 1, color: '#FFF', marginLeft: 10 },
  scrollContent: { padding: 20 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#444', marginTop: 20, fontWeight: 'bold' }
});
