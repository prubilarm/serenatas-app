import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView, Modal, 
  TextInput, Alert, Platform, StatusBar, ImageBackground,
  KeyboardAvoidingView
} from 'react-native';
import { 
  Plus, Music, X, Calendar as CalendarIcon, MapPin, 
  DollarSign, User, Check, Trash2, ListMusic, 
  Search, ChevronDown, ChevronRight, Clock, Filter, Star
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

const formatToDMY = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    const [y, m, d] = dateStr.split('-'); return `${d}-${m}-${y}`;
  }
  return dateStr;
};

const SongPickerModal = ({ visible, canciones, onClose, onToggle }: any) => {
  const [search, setSearch] = useState('');
  const filteredSongs = useMemo(() => {
    return LISTADO_CANCIONES.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <View><Text style={styles.pickerTitle}>Repertorio</Text><Text style={styles.pickerSubtitle}>{canciones.length} elegidas</Text></View>
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={onClose}><Text style={styles.pickerDoneText}>Listo</Text></TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search size={18} color="#D4AF37" /><TextInput style={styles.searchInput} placeholder="Buscar canción..." placeholderTextColor="#666" value={search} onChangeText={setSearch} />
          </View>
          <ScrollView style={styles.pickerScroll}>
            {filteredSongs.map((song, idx) => {
              const isSelected = canciones.includes(song);
              return (
                <TouchableOpacity key={idx} style={[styles.songItem, isSelected && styles.songItemSelected]} onPress={() => onToggle(song)}>
                  <Text style={[styles.songItemText, isSelected && styles.songItemTextSelected]}>{song}</Text>
                  {isSelected && <Check size={16} color="#000" />}
                </TouchableOpacity>
              );
            })}
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
  const [canciones, setCanciones] = useState<string[]>([]);

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

  const handleCreateOrUpdate = async () => {
    if (!nombreCliente || !festejada || !fecha) {
      Alert.alert('Faltan datos', 'Nombre, festejada y fecha son obligatorios.'); return;
    }
    try {
      const payloadBase = {
        nombre_cliente: nombreCliente, telefono, nombre_festejada: festejada,
        motivo, fecha, hora, direccion, comuna, precio_total: Number(precio), tipo, canciones,
      };
      if (editingId) await supabase.from('serenatas').update(payloadBase).eq('id', editingId);
      else await supabase.from('serenatas').insert([{ ...payloadBase, estado: 'pendiente' }]);
      setShowModal(false); setEditingId(null); resetForm(); fetchData();
      Alert.alert('Éxito', 'Agenda actualizada correctamente.');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const resetForm = () => {
    setNombreCliente(''); setTelefono(''); setFestejada(''); setMotivo(''); setFecha('');
    setHora(''); setDireccion(''); setComuna(''); setPrecio('25000'); setTipo('express'); setCanciones([]);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id); setNombreCliente(s.nombre_cliente || ''); setTelefono(s.telefono || '');
    setFestejada(s.nombre_festejada); setMotivo(s.motivo || ''); setFecha(s.fecha); setHora(s.hora || '');
    setDireccion(s.direccion || ''); setComuna(s.comuna || ''); setPrecio((s.precio_total || 0).toString());
    setTipo(s.tipo || 'express'); setCanciones(s.canciones || []); setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <View style={styles.bgOverlay}>
          <View style={styles.header}>
            <View><Text style={styles.headerTitle}>Agenda</Text><Text style={styles.headerSubtitle}>Sistema Aventurero v4.5</Text></View>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => { setRefreshing(true); fetchData(); }}><Search size={22} color="#D4AF37" /></TouchableOpacity>
          </View>

          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBar}>
              <Search size={18} color="#666" /><TextInput style={styles.searchBarInput} placeholder="Buscar..." placeholderTextColor="#555" value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <View style={styles.filterRow}>
              {['todas', 'hoy', 'pendientes'].map(m => (
                <TouchableOpacity key={m} onPress={() => setFilterMode(m)} style={[styles.filterBtn, filterMode === m && styles.filterBtnActive]}>
                  <Text style={[styles.filterText, filterMode === m && styles.filterTextActive]}>{m.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}>
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
            ) : filteredSerenatas.length > 0 ? (
              filteredSerenatas.map((s: any) => <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} onEdit={() => handleEdit(s)} />)
            ) : (
              <View style={styles.empty}><Music size={60} color="#222" /><Text style={{ color: '#444', marginTop: 10 }}>Sin serenatas</Text></View>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setShowModal(true); }}><Plus color="#000" size={30} /></TouchableOpacity>
        </View>
      </ImageBackground>

      {/* MODAL DE AGENDA CON PREVENCIÓN DE TECLADO */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1, justifyContent: 'flex-end' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? 'EDITAR' : 'NUEVA'} SERENATA</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><X color="#666" size={28} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Identidad</Text>
                  <TextInput style={styles.input} placeholder="Nombre Cliente" placeholderTextColor="#555" value={nombreCliente} onChangeText={setNombreCliente} />
                  <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor="#555" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
                  <TextInput style={styles.input} placeholder="Nombre Festejada" placeholderTextColor="#555" value={festejada} onChangeText={setFestejada} />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Cita</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 10, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowDatePicker(true)}>
                      <CalendarIcon size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFF' }}>{fecha ? formatToDMY(fecha) : 'Fecha'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.input, { flex: 1, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowTimePicker(true)}>
                      <Clock size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFF' }}>{hora || 'Hora'}</Text>
                    </TouchableOpacity>
                  </View>
                  {showDatePicker && <DateTimePicker value={fecha ? new Date(fecha + 'T12:00:00') : new Date()} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setFecha(d.toISOString().split('T')[0]); }} />}
                  {showTimePicker && <DateTimePicker value={new Date()} mode="time" is24Hour={true} display="default" onChange={(e, t) => { setShowTimePicker(false); if(t) setHora(`${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`); }} />}
                  <TextInput style={styles.input} placeholder="Dirección" placeholderTextColor="#555" value={direccion} onChangeText={setDireccion} />
                  <TextInput style={styles.input} placeholder="Comuna" placeholderTextColor="#555" value={comuna} onChangeText={setComuna} />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tipo de Servicio</Text>
                  <View style={styles.typeRow}>
                    {['express', 'full', 'personalizado'].map(t => (
                      <TouchableOpacity key={t} style={[styles.typeBtn, tipo === t && styles.typeBtnActive]} onPress={() => setTipo(t)}>
                        <Text style={[styles.typeBtnText, tipo === t && styles.typeBtnTextActive]}>{t.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.priceField}>
                    <DollarSign size={18} color="#D4AF37" />
                    <TextInput 
                      style={styles.priceInput} 
                      value={precio} 
                      onChangeText={setPrecio} 
                      keyboardType="numeric" 
                      editable={tipo === 'personalizado'}
                    />
                    <Text style={{ color: '#666', fontSize: 10 }}>{tipo === 'personalizado' ? 'MONTO LIBRE' : 'MONTO FIJO'}</Text>
                  </View>
                </View>

                <View style={styles.section}>
                   <Text style={styles.sectionTitle}>Repertorio Musical</Text>
                   <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowSongPicker(true)}>
                      <Music size={20} color="#D4AF37" />
                      <Text style={styles.pickerBtnText}>{canciones.length ? `${canciones.length} canciones elegidas` : 'Seleccionar canciones'}</Text>
                      <ChevronRight size={20} color="#333" />
                   </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}>
                  <Text style={styles.submitBtnText}>CONFIRMAR AGENDAMIENTO</Text>
                </TouchableOpacity>
                <View style={{ height: Platform.OS === 'ios' ? 120 : 60 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <SongPickerModal visible={showSongPicker} canciones={canciones} onClose={() => setShowSongPicker(false)} onToggle={(s: string) => canciones.includes(s) ? setCanciones(canciones.filter(c => c !== s)) : setCanciones([...canciones, s])} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  header: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold' },
  refreshBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  searchBarWrapper: { paddingHorizontal: 25, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchBarInput: { flex: 1, color: '#FFF', marginLeft: 10 },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#111' },
  filterBtnActive: { backgroundColor: '#D4AF37' },
  filterText: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  filterTextActive: { color: '#000' },
  scrollContent: { padding: 20 },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 32, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  modalContent: { backgroundColor: '#0D0D0D', borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '90%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  section: { marginBottom: 25 },
  sectionTitle: { color: '#444', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 2 },
  input: { backgroundColor: '#161616', borderRadius: 15, padding: 16, color: '#FFF', marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  row: { flexDirection: 'row' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#161616', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  typeBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  typeBtnText: { color: '#666', fontSize: 9, fontWeight: 'bold' },
  typeBtnTextActive: { color: '#000' },
  priceField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#D4AF3750' },
  priceInput: { flex: 1, color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#222' },
  pickerBtnText: { flex: 1, color: '#FFF', marginLeft: 15, fontSize: 14 },
  submitBtn: { backgroundColor: '#D4AF37', padding: 20, borderRadius: 18, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#0D0D0D', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%' },
  pickerHeader: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#222' },
  pickerTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  pickerSubtitle: { color: '#666', fontSize: 11 },
  pickerDoneBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  pickerDoneText: { fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 20, backgroundColor: '#161616', borderRadius: 15, marginTop: 15 },
  searchInput: { flex: 1, color: '#FFF', marginLeft: 10 },
  pickerScroll: { flex: 1, padding: 20 },
  songItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#111', borderRadius: 12, marginBottom: 8 },
  songItemSelected: { backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: '#D4AF37' },
  songItemText: { color: '#666', fontSize: 13 },
  songItemTextSelected: { color: '#D4AF37', fontWeight: 'bold' }
});
