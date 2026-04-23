import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert,
  Platform
} from 'react-native';
import { 
  Plus, Music, X, Calendar as CalendarIcon, MapPin, 
  DollarSign, User, Check, Trash2, ListMusic, 
  Search, ChevronDown, ChevronRight, Clock 
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import SerenataCard from '../components/SerenataCard';

const LISTADO_CANCIONES = [
  "A quien vas a amar más que a mi", "Acá entre nos", "Borracho te recuerdo",
  "Caballo prieto azabache", "Cielito lindo", "Celos",
  "El Adiós a la vida", "El aventurero", "El ayudante", "El rey",
  "Es la mujer",
  "Jalisco no te rajes",
  "La ley del monte", "La venia bendita", "Las mañanitas", "Le canto a la mujer",
  "Madrecita querida", "Matalas", "Me bebí tu recuerdo", "Mi amigo el tordillo",
  "Mil puñados de oro", "Mujeres divinas",
  "Nadie es eterno en el mundo", "No me se rajar",
  "Por tu maldito amor",
  "Que chulada de mujer", "Que de raro tiene",
  "Si nos dejan", "Si te vas no hay lío", "Si no te hubieras ido",
  "Un millón de primaveras",
  "Volver Volver",
  "Yo te extrañará",
].sort((a, b) => a.localeCompare(b));

const groupByLetter = (songs: string[]) => {
  const groups: { [key: string]: string[] } = {};
  songs.forEach(song => {
    const letter = song[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(song);
  });
  return groups;
};

// ── FORMATTER PARA FECHA dd-mm-aaaa ──
const formatToDMY = (dateStr: string) => {
  if (!dateStr) return '';
  // Si viene como yyyy-mm-dd
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  }
  return dateStr;
};

// ── COMPONENTE PICKER DE CANCIONES ──
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
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHandle} />
          <View style={styles.pickerHeader}>
            <View>
              <Text style={styles.pickerTitle}>Repertorio</Text>
              <Text style={styles.pickerSubtitle}>{canciones.length} seleccionadas</Text>
            </View>
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={onClose}>
              <Text style={styles.pickerDoneText}>Listo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search size={16} color="#D4AF37" />
            <TextInput style={styles.searchInput} placeholder="Buscar canción..." placeholderTextColor="#666" value={search} onChangeText={setSearch} autoCorrect={false} />
          </View>
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {filteredSongs !== null ? (
              filteredSongs.map((song, idx) => (
                <TouchableOpacity key={idx} style={[styles.songItem, canciones.includes(song) && styles.songItemSelected]} onPress={() => onToggle(song)}>
                  <Text style={[styles.songItemText, canciones.includes(song) && styles.songItemTextSelected]}>{song}</Text>
                </TouchableOpacity>
              ))
            ) : (
              Object.keys(grouped).sort().map(letter => (
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
              ))
            )}
            <View style={{ height: 40 }} />
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

  // Pickers Native
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form State
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [festejada, setFestejada] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fecha, setFecha] = useState(''); // Se guarda como yyyy-mm-dd para Supabase
  const [hora, setHora] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [precio, setPrecio] = useState('25000');
  const [tipo, setTipo] = useState('express');
  const [canciones, setCanciones] = useState([]);

  // 📝 CORRECCIÓN: El precio cambia SIEMPRE que cambie el tipo, incluso editando
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
      Alert.alert('Faltan datos', 'Por favor completa los campos obligatorios.');
      return;
    }
    try {
      const payloadBase = {
        nombre_cliente: nombreCliente, telefono, nombre_festejada: festejada,
        motivo, fecha, hora, direccion, comuna,
        precio_total: Number(precio), tipo, canciones,
      };
      const payload = editingId ? payloadBase : { ...payloadBase, estado: 'pendiente' };

      if (editingId) {
        const { error } = await supabase.from('serenatas').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('serenatas').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false); setEditingId(null); resetForm(); fetchData();
      Alert.alert('¡Éxito!', editingId ? 'Actualizada.' : 'Agendada.');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setNombreCliente(s.nombre_cliente || '');
    setTelefono(s.telefono || '');
    setFestejada(s.nombre_festejada);
    setMotivo(s.motivo);
    setFecha(s.fecha);
    setHora(s.hora);
    setDireccion(s.direccion);
    setComuna(s.comuna);
    setPrecio(s.precio_total.toString());
    setTipo(s.tipo);
    setCanciones(s.canciones || []);
    setShowModal(true);
  };

  const resetForm = () => {
    setNombreCliente(''); setTelefono(''); setFestejada(''); setMotivo(''); setFecha('');
    setHora(''); setDireccion(''); setComuna(''); setPrecio('25000');
    setTipo('express'); setCanciones([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Agenda</Text>
          <Text style={styles.headerSubtitle}>El Mariachi Aventurero</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => { setRefreshing(true); fetchData(); }}>
           <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}>
        {loading && !refreshing ? <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} /> :
          serenatas.length > 0 ? serenatas.map((s: any) => <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} onEdit={() => handleEdit(s)} />) :
          <View style={styles.empty}><Music size={60} color="rgba(255,255,255,0.1)" /><Text style={styles.emptyText}>No hay eventos.</Text></View>
        }
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus color="#000" size={30} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Editar Serenata' : 'Nueva Serenata'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setEditingId(null); resetForm(); }}><X color="#FFF" size={24} /></TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Cliente</Text>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Nombre</Text><TextInput style={styles.input} value={nombreCliente} onChangeText={setNombreCliente} /></View>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Teléfono</Text><TextInput style={styles.input} keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} /></View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Lugar y Tiempo</Text>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Festejada(o)</Text><TextInput style={styles.input} value={festejada} onChangeText={setFestejada} /></View>
                
                {/* ── DATE & TIME PICKERS ── */}
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.fieldLabel}>Fecha (DD-MM-AAAA)</Text>
                    <View style={styles.pickerTrigger}>
                       <CalendarIcon size={16} color="#D4AF37" />
                       <Text style={styles.pickerTriggerText}>{fecha ? formatToDMY(fecha) : '-- Seleccionar --'}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.fieldGroup, { flex: 1 }]} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.fieldLabel}>Hora</Text>
                    <View style={styles.pickerTrigger}>
                       <Clock size={16} color="#D4AF37" />
                       <Text style={styles.pickerTriggerText}>{hora || '--:--'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker value={fecha ? new Date(fecha + 'T12:00:00') : new Date()} mode="date" display="default" onChange={onDateChange} />
                )}
                {showTimePicker && (
                  <DateTimePicker value={new Date()} mode="time" is24Hour={true} display="default" onChange={onTimeChange} />
                )}

                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Dirección</Text><TextInput style={styles.input} value={direccion} onChangeText={setDireccion} /></View>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Comuna</Text><TextInput style={styles.input} value={comuna} onChangeText={setComuna} /></View>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.row}>
                  <View style={styles.typeSwitcher}>
                    <TouchableOpacity onPress={() => setTipo('express')} style={[styles.typeBtn, tipo === 'express' && styles.typeBtnActive]}><Text style={[styles.typeText, tipo === 'express' && styles.typeTextActive]}>Express (2s)</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setTipo('full')} style={[styles.typeBtn, tipo === 'full' && styles.typeBtnActive]}><Text style={[styles.typeText, tipo === 'full' && styles.typeTextActive]}>Full (4s)</Text></TouchableOpacity>
                  </View>
                  <View style={styles.priceContainer}><DollarSign size={14} color="#D4AF37" /><TextInput style={styles.priceInput} keyboardType="numeric" value={precio} onChangeText={setPrecio} /></View>
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}>
                <Text style={styles.submitText}>{editingId ? 'ACTUALIZAR' : 'AGENDAR'}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SongPickerModal visible={showSongPicker} canciones={canciones} onClose={() => setShowSongPicker(false)} onToggle={(song: string) => canciones.includes(song) ? setCanciones(canciones.filter(c => c !== song)) : setCanciones([...canciones, song])} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#D4AF37', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 },
  refreshBtn: { backgroundColor: '#111', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  refreshText: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold' },
  scrollContent: { padding: 18, paddingBottom: 110 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#444', marginTop: 12 },
  fab: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#D4AF37', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0A0A0A', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  modalForm: { flex: 1 },
  sectionBlock: { backgroundColor: '#111', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  sectionLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  fieldGroup: { marginBottom: 15 },
  fieldLabel: { color: '#D4AF37', fontSize: 11, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#000', borderRadius: 10, padding: 12, color: '#FFF', borderWidth: 1, borderColor: '#333', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTrigger: { backgroundColor: '#000', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickerTriggerText: { color: '#FFF', fontSize: 14 },
  typeSwitcher: { flex: 1, flexDirection: 'row', backgroundColor: '#000', borderRadius: 10, padding: 4, marginRight: 10, borderWeight: 1, borderColor: '#222' },
  typeBtn: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  typeBtnActive: { backgroundColor: '#D4AF37' },
  typeText: { color: '#444', fontSize: 11, fontWeight: 'bold' },
  typeTextActive: { color: '#000' },
  priceContainer: { flex: 0.8, backgroundColor: '#000', borderRadius: 10, height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: '#D4AF37' },
  priceInput: { flex: 1, color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  submitBtn: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '80%' },
  pickerHandle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', margin: 10 },
  pickerHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#222' },
  pickerTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  pickerSubtitle: { color: '#666', fontSize: 12 },
  pickerDoneBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  pickerDoneText: { color: '#000', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', margin: 15, padding: 10, borderRadius: 10, gap: 10 },
  searchInput: { color: '#FFF', flex: 1 },
  pickerScroll: { flex: 1 },
  letterGroup: { marginBottom: 5 },
  letterHeader: { padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  letterBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  letterBadgeText: { fontWeight: 'bold' },
  letterLabel: { color: '#888', flex: 1 },
  songItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  songItemSelected: { backgroundColor: '#D4AF3722' },
  songItemText: { color: '#FFF' },
  songItemTextSelected: { color: '#D4AF37', fontWeight: 'bold' }
});
