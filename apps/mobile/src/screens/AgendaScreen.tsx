import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView, Modal, 
  TextInput, Alert, Platform, StatusBar, ImageBackground 
} from 'react-native';
import { 
  Plus, Music, X, Calendar as CalendarIcon, MapPin, 
  DollarSign, User, Check, Trash2, ListMusic, 
  Search, ChevronDown, ChevronRight, Clock, Filter 
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import SerenataCard from '../components/SerenataCard';

const LISTADO_CANCIONES = [
  "A quien vas a amar más que a mi", "Acá entre nos", "Borracho te recuerdo",
  "Caballo prieto azabache", "Cielito lindo", "Celos", "El Adiós a la vida", 
  "El aventurero", "El ayudante", "El rey", "Es la mujer", "Jalisco no te rajes",
  "La ley del monte", "La venia bendita", "Las mañanitas", "Le canto a la mujer",
  "Madrecita querida", "Matalas", "Me bebí tu recuerdo", "Mi amigo el tordillo",
  "Mil puñados de oro", "Mujeres divinas", "Nadie es eterno en el mundo", 
  "No me se rajar", "Por tu maldito amor", "Que chulada de mujer", 
  "Que de raro tiene", "Si nos dejan", "Si te vas no hay lío", 
  "Si no te hubieras ido", "Un millón de primaveras", "Volver Volver", "Yo te extrañará"
].sort();

const groupByLetter = (songs: string[]) => {
  const groups: { [key: string]: string[] } = {};
  songs.forEach(song => {
    const letter = song[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(song);
  });
  return groups;
};

const formatToDMY = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    const [y, m, d] = dateStr.split('-'); return `${d}-${m}-${y}`;
  }
  return dateStr;
};

const SongPickerModal = ({ visible, canciones, onClose, onToggle }: any) => {
  const [search, setSearch] = useState('');
  const [openLetters, setOpenLetters] = useState<Set<string>>(new Set());
  const grouped = useMemo(() => groupByLetter(LISTADO_CANCIONES), []);
  const filteredSongs = useMemo(() => {
    if (!search.trim()) return null;
    return LISTADO_CANCIONES.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  }, [search]);
  const toggleLetter = (letter: string) => {
    setOpenLetters(prev => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter); else next.add(letter);
      return next;
    });
  };
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHandle} />
          <View style={styles.pickerHeader}>
            <View><Text style={styles.pickerTitle}>Repertorio</Text><Text style={styles.pickerSubtitle}>{canciones.length} seleccionadas</Text></View>
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={onClose}><Text style={styles.pickerDoneText}>Listo</Text></TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search size={16} color="#D4AF37" /><TextInput style={styles.searchInput} placeholder="Buscar canción..." placeholderTextColor="#666" value={search} onChangeText={setSearch} />
          </View>
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {filteredSongs ? filteredSongs.map((song, idx) => (
              <TouchableOpacity key={idx} style={[styles.songItem, canciones.includes(song) && styles.songItemSelected]} onPress={() => onToggle(song)}>
                <Text style={[styles.songItemText, canciones.includes(song) && styles.songItemTextSelected]}>{song}</Text>
              </TouchableOpacity>
            )) : Object.keys(grouped).sort().map(letter => (
              <View key={letter} style={styles.letterGroup}>
                <TouchableOpacity style={styles.letterHeader} onPress={() => toggleLetter(letter)}>
                  <View style={styles.letterBadge}><Text style={styles.letterBadgeText}>{letter}</Text></View>
                  <Text style={styles.letterLabel}>{grouped[letter].length} canciones</Text>
                  {openLetters.has(letter) ? <ChevronDown size={18} color="#D4AF37" /> : <ChevronRight size={18} color="#666" />}
                </TouchableOpacity>
                {openLetters.has(letter) && grouped[letter].map((song, idx) => (
                  <TouchableOpacity key={idx} style={[styles.songItem, canciones.includes(song) && styles.songItemSelected]} onPress={() => onToggle(song)}>
                    <Text style={[styles.songItemText, canciones.includes(song) && styles.songItemTextSelected]}>{song}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function AgendaScreen() {
  const [serenatas, setSerenatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('todas');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [festejada, setFestejada] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [precio, setPrecio] = useState('25000');
  const [tipo, setTipo] = useState('express');
  const [canciones, setCanciones] = useState([]);

  useEffect(() => {
    if (tipo === 'express') setPrecio('25000');
    else if (tipo === 'full') setPrecio('40000');
  }, [tipo]);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('serenatas').select('*').order('fecha', { ascending: true });
      setSerenatas(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredSerenatas = useMemo(() => {
    let result = [...serenatas];
    if (searchQuery.trim()) {
      result = result.filter((s: any) => 
        s.nombre_festejada?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nombre_cliente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.comuna?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (filterMode === 'hoy') result = result.filter((s: any) => s.fecha === todayStr);
    else if (filterMode === 'pendientes') result = result.filter((s: any) => s.estado !== 'completada');
    return result;
  }, [serenatas, searchQuery, filterMode]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setFecha(`${y}-${m}-${d}`);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const h = String(selectedTime.getHours()).padStart(2, '0');
      const m = String(selectedTime.getMinutes()).padStart(2, '0');
      setHora(`${h}:${m}`);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!nombreCliente || !festejada || !fecha || !precio) {
      Alert.alert('Faltan datos', 'Completa los campos.'); return;
    }
    try {
      const payloadBase = {
        nombre_cliente: nombreCliente, telefono, nombre_festejada: festejada,
        motivo, fecha, hora, direccion, comuna, precio_total: Number(precio), tipo, canciones,
      };
      const payload = editingId ? payloadBase : { ...payloadBase, estado: 'pendiente' };
      if (editingId) await supabase.from('serenatas').update(payload).eq('id', editingId);
      else await supabase.from('serenatas').insert([payload]);
      setShowModal(false); setEditingId(null); resetForm(); fetchData();
      Alert.alert('Éxito', editingId ? 'Actualizada.' : 'Agendada.');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id); setNombreCliente(s.nombre_cliente || ''); setTelefono(s.telefono || '');
    setFestejada(s.nombre_festejada); setMotivo(s.motivo); setFecha(s.fecha); setHora(s.hora);
    setDireccion(s.direccion); setComuna(s.comuna); setPrecio(s.precio_total.toString());
    setTipo(s.tipo); setCanciones(s.canciones || []); setShowModal(true);
  };

  const resetForm = () => {
    setNombreCliente(''); setTelefono(''); setFestejada(''); setMotivo(''); setFecha('');
    setHora(''); setDireccion(''); setComuna(''); setPrecio('25000'); setTipo('express'); setCanciones([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={require('../../assets/fondo_app.jpg')} 
        style={{ flex: 1 }} 
        resizeMode="cover"
      >
        <View style={styles.bgOverlay}>
          <View style={styles.header}>
            <View><Text style={styles.headerTitle}>Agenda</Text><Text style={styles.headerSubtitle}>Mariachi v4.0</Text></View>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => { setRefreshing(true); fetchData(); }}><Search size={20} color="#D4AF37" /></TouchableOpacity>
          </View>

          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBar}>
              <Search size={18} color="#666" /><TextInput style={styles.searchBarInput} placeholder="Buscar..." placeholderTextColor="#444" value={searchQuery} onChangeText={setSearchQuery} />
              {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><X size={18} color="#666" /></TouchableOpacity>}
            </View>
            <View style={styles.filterRow}>
              {['todas', 'hoy', 'pendientes'].map(m => (
                <TouchableOpacity key={m} onPress={() => setFilterMode(m)} style={[styles.filterBtn, filterMode === m && styles.filterBtnActive]}>
                  <Text style={[styles.filterText, filterMode === m && styles.filterTextActive]}>{m.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}
          >
            {loading && !refreshing ? (
              <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#D4AF37" /><Text style={styles.loaderText}>Cargando...</Text></View>
            ) : filteredSerenatas.length > 0 ? (
              filteredSerenatas.map((s: any) => <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} onEdit={() => handleEdit(s)} />)
            ) : (
              <View style={styles.empty}><Music size={80} color="rgba(212,175,55,0.1)" /><Text style={styles.emptyLabel}>Sin resultados</Text></View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}><Plus color="#000" size={32} /></TouchableOpacity>
        </View>
      </ImageBackground>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View><Text style={styles.modalTitle}>{editingId ? 'EDITAR' : 'NUEVO'}</Text><Text style={styles.modalSubtitle}>Agenda Mariachi</Text></View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowModal(false); setEditingId(null); resetForm(); }}><X color="#999" size={24} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Identidad</Text>
              <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>CLIENTE</Text><TextInput style={styles.input} value={nombreCliente} onChangeText={setNombreCliente} /></View>
              <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>TELÉFONO</Text><TextInput style={styles.input} keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} /></View>
              <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>FESTEJADA</Text><TextInput style={styles.input} value={festejada} onChangeText={setFestejada} /></View>
            </View>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Tiempo y Lugar</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.fieldGroup, { flex: 1.2, marginRight: 15 }]} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.fieldLabel}>FECHA</Text><View style={styles.pickerTrigger}><CalendarIcon size={16} color="#D4AF37" /><Text style={styles.pickerTriggerText}>{fecha ? formatToDMY(fecha) : '---'}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fieldGroup, { flex: 0.8 }]} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.fieldLabel}>HORA</Text><View style={styles.pickerTrigger}><Clock size={16} color="#D4AF37" /><Text style={styles.pickerTriggerText}>{hora || '--:--'}</Text></View>
                </TouchableOpacity>
              </View>
              {showDatePicker && <DateTimePicker value={fecha ? new Date(fecha + 'T12:00:00') : new Date()} mode="date" display="default" onChange={onDateChange} />}
              {showTimePicker && <DateTimePicker value={new Date()} mode="time" is24Hour={true} display="default" onChange={onTimeChange} />}
              <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>DIRECCIÓN</Text><TextInput style={styles.input} value={direccion} onChangeText={setDireccion} /></View>
              <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>COMUNA</Text><TextInput style={styles.input} value={comuna} onChangeText={setComuna} /></View>
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}><Text style={styles.submitText}>CONFIRMAR</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>

      <SongPickerModal visible={showSongPicker} canciones={canciones} onClose={() => setShowSongPicker(false)} onToggle={(s: string) => canciones.includes(s) ? setCanciones(canciones.filter(c => c !== s)) : setCanciones([...canciones, s])} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  header: { padding: 25, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
  refreshBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  searchBarWrapper: { paddingHorizontal: 25, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchBarInput: { flex: 1, color: '#FFF', marginLeft: 10 },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterBtnActive: { backgroundColor: '#D4AF37' },
  filterText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  filterTextActive: { color: '#000' },
  scrollContent: { padding: 20 },
  loaderContainer: { alignItems: 'center', marginTop: 100 },
  loaderText: { color: '#666', marginTop: 10 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyLabel: { color: '#444' },
  fab: { position: 'absolute', bottom: 35, right: 25, backgroundColor: '#D4AF37', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0c0c0c', borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '90%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  modalTitle: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  closeBtn: { width: 36, height: 36, backgroundColor: '#1a1a1a', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalForm: { flex: 1 },
  sectionBlock: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 20 },
  sectionLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 20 },
  fieldGroup: { marginBottom: 15 },
  fieldLabel: { color: '#D4AF37', fontSize: 10, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#000', borderRadius: 12, padding: 15, color: '#FFF', borderWidth: 1, borderColor: '#111' },
  row: { flexDirection: 'row' },
  pickerTrigger: { backgroundColor: '#000', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickerTriggerText: { color: '#FFF' },
  submitBtn: { backgroundColor: '#D4AF37', padding: 20, borderRadius: 20, alignItems: 'center' },
  submitText: { color: '#000', fontWeight: 'bold' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#0a0a0a', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '80%' },
  pickerHandle: { width: 40, height: 4, backgroundColor: '#222', borderRadius: 2, alignSelf: 'center', margin: 10 },
  pickerHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  pickerTitle: { color: '#D4AF37', fontSize: 20 },
  pickerDoneBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  pickerDoneText: { fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', margin: 15, padding: 10, borderRadius: 15 },
  searchInput: { color: '#FFF', flex: 1, marginLeft: 10 },
  pickerScroll: { flex: 1 }
});
