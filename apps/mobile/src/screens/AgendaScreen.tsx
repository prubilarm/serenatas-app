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
  Search, ChevronDown, ChevronRight, Clock, Filter, Star,
  RotateCcw
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { COMUNAS, predecirComuna } from '../lib/comunas';
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

// MODAL DE CANCIONES
const SongPickerModal = ({ visible, canciones, onClose, onToggle }: any) => {
  const [search, setSearch] = useState('');
  const filteredSongs = useMemo(() => {
    return LISTADO_CANCIONES.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  }, [search]);
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
       <View style={styles.pickerOverlay}>
        <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
        <View style={[styles.bgOverlay, { borderTopLeftRadius: 30, borderTopRightRadius: 30 }]}>
            <View style={styles.pickerHeader}>
                <View><Text style={styles.pickerTitle}>Repertorio</Text><Text style={styles.pickerSubtitle}>{canciones.length} elegidas</Text></View>
                <TouchableOpacity style={styles.pickerDoneBtn} onPress={onClose}><Text style={styles.pickerDoneText}>Listo</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.pickerSearch} placeholder="Buscar canción..." placeholderTextColor="#666" value={search} onChangeText={setSearch} />
            <ScrollView style={{ flex: 1, padding: 20 }}>
                {filteredSongs.map(s => (
                    <TouchableOpacity key={s} style={[styles.songItem, canciones.includes(s) && styles.songActive]} onPress={() => onToggle(s)}>
                        <Text style={[styles.songText, canciones.includes(s) && styles.whiteText]}>{s}</Text>
                        {canciones.includes(s) && <Check size={16} color="#000" />}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

// MODAL DE COMUNAS
const ComunaPickerModal = ({ visible, onSelect, onClose }: any) => {
    const [query, setQuery] = useState('');
    const filtered = COMUNAS.filter(c => c.toLowerCase().includes(query.toLowerCase()));
    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.pickerOverlay}>
                <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
                <View style={[styles.bgOverlay, { borderTopLeftRadius: 30, borderTopRightRadius: 30 }]}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Seleccionar Comuna</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#666" /></TouchableOpacity>
                    </View>
                    <TextInput style={styles.pickerSearch} placeholder="Filtrar comuna..." placeholderTextColor="#666" value={query} onChangeText={setQuery} />
                    <ScrollView style={{ flex: 1, padding: 15 }}>
                        {filtered.map(c => (
                            <TouchableOpacity key={c} style={styles.comunaItem} onPress={() => { onSelect(c); onClose(); }}>
                                <Text style={{ color: '#FFF' }}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                </ImageBackground>
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
  const [showComunaPicker, setShowComunaPicker] = useState(false);
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

  useEffect(() => {
    if (direccion.length > 5) {
        const predict = predecirComuna(direccion);
        if (predict) setComuna(predict);
    }
  }, [direccion]);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('serenatas').select('*').order('fecha', { ascending: true });
      setSerenatas(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!nombreCliente || !festejada || !fecha) { Alert.alert('Faltan datos', 'Completa los campos.'); return; }
    try {
      const p = { nombre_cliente: nombreCliente, telefono, nombre_festejada: festejada, motivo, fecha, hora, direccion, comuna, precio_total: Number(precio), tipo, canciones };
      if (editingId) await supabase.from('serenatas').update(p).eq('id', editingId);
      else await supabase.from('serenatas').insert([{ ...p, estado: 'pendiente' }]);
      setShowModal(false); setEditingId(null); resetForm(); fetchData();
      // El calendario se actualizará automáticamente si está en modo observación de Supabase o al refrescar
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const resetForm = () => { setNombreCliente(''); setTelefono(''); setFestejada(''); setMotivo(''); setFecha(''); setHora(''); setDireccion(''); setComuna(''); setPrecio('25000'); setTipo('express'); setCanciones([]); };

  const handleEdit = (s: any) => {
    setEditingId(s.id); setNombreCliente(s.nombre_cliente || ''); setTelefono(s.telefono || ''); setFestejada(s.nombre_festejada); setMotivo(s.motivo || ''); setFecha(s.fecha); setHora(s.hora || ''); setDireccion(s.direccion || ''); setComuna(s.comuna || ''); setPrecio((s.precio_total || 0).toString()); setTipo(s.tipo || 'express'); setCanciones(s.canciones || []); setShowModal(true);
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.bgOverlay}>
        <View style={styles.header}><Text style={styles.headerTitle}>Agenda</Text><Text style={styles.headerSubtitle}>v5.0 ELITE</Text></View>
        <View style={styles.searchBarWrapper}><View style={styles.searchBar}><Search size={18} color="#666" /><TextInput style={styles.searchBarInput} placeholder="Buscar..." placeholderTextColor="#444" value={searchQuery} onChangeText={setSearchQuery} /></View></View>
        <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}>
          {filteredSerenatas.map((s: any) => <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} onEdit={() => handleEdit(s)} />)}
          <View style={{ height: 100 }} />
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setShowModal(true); }}><Plus color="#000" size={32} /></TouchableOpacity>
      </View></ImageBackground>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <ImageBackground source={require('../../assets/fondo_app.jpg')} style={{ flex: 1 }} resizeMode="cover">
            <View style={[styles.bgOverlay, { flex: 1 }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={[styles.modalContent, { backgroundColor: 'transparent' }]}>
                    <View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingId ? 'EDITAR' : 'NUEVA'} SERENATA</Text><TouchableOpacity onPress={() => setShowModal(false)}><X color="#D4AF37" size={28} /></TouchableOpacity></View>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text style={styles.sectionTitle}>Identidad & Contacto</Text>
                        <TextInput style={styles.input} placeholder="Nombre del Cliente" placeholderTextColor="#555" value={nombreCliente} onChangeText={setNombreCliente} selectionColor="#D4AF37" />
                        <TextInput style={styles.input} placeholder="Número de Celular (+56...)" placeholderTextColor="#555" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" selectionColor="#D4AF37" />
                        <TextInput style={styles.input} placeholder="Nombre de la Festejada" placeholderTextColor="#555" value={festejada} onChangeText={setFestejada} selectionColor="#D4AF37" />
                        
                        <Text style={styles.sectionTitle}>Cita & Comuna</Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 10, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowDatePicker(true)}>
                                <CalendarIcon size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#FFF' }}>{fecha ? formatToDMY(fecha) : 'Seleccionar Fecha'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.input, { flex: 1, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowTimePicker(true)}>
                                <Clock size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#FFF' }}>{hora || 'Seleccionar Hora'}</Text>
                            </TouchableOpacity>
                        </View>
                        {showDatePicker && <DateTimePicker value={new Date()} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setFecha(d.toISOString().split('T')[0]); }} />}
                        {showTimePicker && <DateTimePicker value={new Date()} mode="time" display="default" onChange={(e, t) => { setShowTimePicker(false); if(t) setHora(`${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`); }} />}
                        
                        <TextInput style={styles.input} placeholder="Dirección del Evento" placeholderTextColor="#555" value={direccion} onChangeText={setDireccion} selectionColor="#D4AF37" />
                        <TouchableOpacity style={styles.input} onPress={() => setShowComunaPicker(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MapPin size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                                <Text style={{ color: comuna ? '#FFF' : '#555' }}>{comuna || 'Seleccionar Comuna'}</Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Repertorio & Servicio</Text>
                        <TouchableOpacity style={[styles.input, { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: '#D4AF37' }]} onPress={() => setShowSongPicker(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Music size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#FFF' }}>{canciones.length > 0 ? `${canciones.length} canciones elegidas` : 'ELEGIR CANCIONES'}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.typeRow}>
                            {['express', 'full', 'personalizado'].map(t => (
                            <TouchableOpacity key={t} style={[styles.typeBtn, tipo === t && styles.typeBtnActive]} onPress={() => setTipo(t)}><Text style={[styles.typeBtnText, tipo === t && styles.typeBtnTextActive]}>{t.toUpperCase()}</Text></TouchableOpacity>
                            ))}
                        </View>
                        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" editable={tipo === 'personalizado'} selectionColor="#D4AF37" />

                        <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}><Text style={styles.submitBtnText}>CONFIRMAR SERENATA</Text></TouchableOpacity>
                        
                        {editingId && (
                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e74c3c', marginTop: 15 }]} onPress={() => {
                                Alert.alert('Eliminar', '¿Seguro?', [{text:'No'},{text:'Sí', onPress: async()=> {await supabase.from('serenatas').delete().eq('id', editingId); setShowModal(false); fetchData();}}]);
                            }}><Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>ELIMINAR SERENATA</Text></TouchableOpacity>
                        )}
                        <View style={{ height: 120 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            </View>
            </ImageBackground>
        </View>
      </Modal>

      <SongPickerModal visible={showSongPicker} canciones={canciones} onClose={() => setShowSongPicker(false)} onToggle={(s: string) => canciones.includes(s) ? setCanciones(canciones.filter(c => c !== s)) : setCanciones([...canciones, s])} />
      <ComunaPickerModal visible={showComunaPicker} onSelect={setComuna} onClose={() => setShowComunaPicker(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  header: { padding: 25, paddingTop: 10 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold' },
  searchBarWrapper: { paddingHorizontal: 25, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchBarInput: { flex: 1, color: '#FFF', marginLeft: 10 },
  scrollContent: { padding: 20 },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 32, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#000' },
  modalContent: { flex: 1, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { color: '#444', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, marginTop: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 16, color: '#FFF', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  typeBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  typeBtnText: { color: '#666', fontSize: 9, fontWeight: 'bold' },
  typeBtnTextActive: { color: '#000' },
  submitBtn: { backgroundColor: '#D4AF37', padding: 20, borderRadius: 18, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#000', fontWeight: 'bold' },
  pickerOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
  pickerSheet: { flex: 1 },
  pickerHeader: { padding: 25, flexDirection: 'row', justifyContent: 'space-between' },
  pickerTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  pickerSubtitle: { color: '#666', fontSize: 11 },
  pickerSearch: { backgroundColor: 'rgba(255,255,255,0.05)', margin: 20, padding: 15, borderRadius: 15, color: '#FFF' },
  songItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 8 },
  songActive: { backgroundColor: '#D4AF37' },
  songText: { color: '#666' },
  whiteText: { color: '#000', fontWeight: 'bold' },
  pickerDoneBtn: { backgroundColor: '#D4AF37', padding: 10, borderRadius: 10 },
  pickerDoneText: { fontWeight: 'bold' },
  comunaItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' }
});
