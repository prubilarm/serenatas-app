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
  Platform,
  StatusBar
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

const formatToDMY = (dateStr: string) => {
  if (!dateStr) return '';
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
    <Modal visible={visible} animationType="fade" transparent={true}>
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

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('todas'); // hoy, todas, pendientes

  // Pickers Native
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form State
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
    
    // Búsqueda por texto
    if (searchQuery.trim()) {
      result = result.filter((s: any) => 
        s.nombre_festejada?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nombre_cliente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.comuna?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtros de tiempo/estado
    const todayStr = new Date().toISOString().split('T')[0];
    if (filterMode === 'hoy') {
      result = result.filter((s: any) => s.fecha === todayStr);
    } else if (filterMode === 'pendientes') {
      result = result.filter((s: any) => s.estado !== 'completada');
    }

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
      <StatusBar barStyle="light-content" />
      
      {/* ── HEADER PREMIUM ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Agenda</Text>
          <View style={styles.headerDotRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerSubtitle}>Sistema Mariachi v4.0</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => { setRefreshing(true); fetchData(); }}>
           <Search size={20} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* ── BUSCADOR Y FILTROS ── */}
      <View style={styles.searchBarWrapper}>
         <View style={styles.searchBar}>
            <Search size={18} color="#666" />
            <TextInput 
              style={styles.searchBarInput} 
              placeholder="Buscar por nombre, cliente o ciudad..." 
              placeholderTextColor="#444"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#666" />
              </TouchableOpacity>
            )}
         </View>
         <View style={styles.filterRow}>
            <TouchableOpacity onPress={() => setFilterMode('todas')} style={[styles.filterBtn, filterMode === 'todas' && styles.filterBtnActive]}>
               <Text style={[styles.filterText, filterMode === 'todas' && styles.filterTextActive]}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterMode('hoy')} style={[styles.filterBtn, filterMode === 'hoy' && styles.filterBtnActive]}>
               <Text style={[styles.filterText, filterMode === 'hoy' && styles.filterTextActive]}>Hoy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterMode('pendientes')} style={[styles.filterBtn, filterMode === 'pendientes' && styles.filterBtnActive]}>
               <Text style={[styles.filterText, filterMode === 'pendientes' && styles.filterTextActive]}>Pendientes</Text>
            </TouchableOpacity>
         </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}
      >
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loaderText}>Cargando serenatas...</Text>
          </View>
        ) : filteredSerenatas.length > 0 ? (
          filteredSerenatas.map((s: any) => (
            <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} onEdit={() => handleEdit(s)} />
          ))
        ) : (
          <View style={styles.empty}>
            <Music size={80} color="rgba(212,175,55,0.05)" />
            <Text style={styles.emptyText}>No se encontraron resultados</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus color="#000" size={32} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{editingId ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}</Text>
                <Text style={styles.modalSubtitle}>Completa los campos para continuar</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowModal(false); setEditingId(null); resetForm(); }}>
                 <X color="#999" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Identificación</Text>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>CLIENTE QUE CONTRATA</Text><TextInput style={styles.input} value={nombreCliente} onChangeText={setNombreCliente} placeholder="Nombre completo" placeholderTextColor="#333" /></View>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>TELÉFONO DE CONTACTO</Text><TextInput style={styles.input} keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} placeholder="+56 9..." placeholderTextColor="#333" /></View>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>¿A QUIÉN LE CANTAMOS?</Text><TextInput style={styles.input} value={festejada} onChangeText={setFestejada} placeholder="Nombre de la festejada" placeholderTextColor="#333" /></View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Logística y Precio</Text>
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.fieldGroup, { flex: 1, marginRight: 12 }]} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.fieldLabel}>FECHA</Text>
                    <View style={styles.pickerTrigger}>
                       <CalendarIcon size={16} color="#D4AF37" />
                       <Text style={styles.pickerTriggerText}>{fecha ? formatToDMY(fecha) : 'Seleccionar'}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.fieldGroup, { flex: 1 }]} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.fieldLabel}>HORA</Text>
                    <View style={styles.pickerTrigger}>
                       <Clock size={16} color="#D4AF37" />
                       <Text style={styles.pickerTriggerText}>{hora || '--:--'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker value={fecha ? new Date(fecha + 'T12:00:00') : new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
                )}
                {showTimePicker && (
                  <DateTimePicker value={new Date()} mode="time" is24Hour={true} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} />
                )}

                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>DIRECCIÓN</Text><TextInput style={styles.input} value={direccion} onChangeText={setDireccion} placeholder="Calle, número..." placeholderTextColor="#333" /></View>
                <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>COMUNA</Text><TextInput style={styles.input} value={comuna} onChangeText={setComuna} placeholder="Ciudad o Comuna" placeholderTextColor="#333" /></View>
                
                <View style={styles.row}>
                  <View style={styles.typeSwitcher}>
                    <TouchableOpacity onPress={() => setTipo('express')} style={[styles.typeBtn, tipo === 'express' && styles.typeBtnActive]}><Text style={[styles.typeText, tipo === 'express' && styles.typeTextActive]}>Express</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setTipo('full')} style={[styles.typeBtn, tipo === 'full' && styles.typeBtnActive]}><Text style={[styles.typeText, tipo === 'full' && styles.typeTextActive]}>Full</Text></TouchableOpacity>
                  </View>
                  <View style={styles.priceContainer}><DollarSign size={14} color="#D4AF37" /><TextInput style={styles.priceInput} keyboardType="numeric" value={precio} onChangeText={setPrecio} /></View>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>REPERTORIO</Text>
                <TouchableOpacity style={styles.songsTrigger} onPress={() => setShowSongPicker(true)}>
                   <ListMusic size={20} color="#D4AF37" />
                   <Text style={styles.songsTriggerText}>{canciones.length > 0 ? `${canciones.length} canciones elegidas` : 'Elegir Canciones'}</Text>
                   <ChevronRight size={18} color="#444" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}>
                <Text style={styles.submitText}>{editingId ? 'GUARDAR CAMBIOS' : 'AGENDAR SERENATA'}</Text>
              </TouchableOpacity>
              <View style={{ height: 50 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SongPickerModal 
        visible={showSongPicker} 
        canciones={canciones} 
        onClose={() => setShowSongPicker(false)} 
        onToggle={(song: string) => canciones.includes(song) ? setCanciones(canciones.filter(c => c !== song)) : setCanciones([...canciones, song])} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { padding: 24, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', letterSpacing: -0.5 },
  headerDotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37' },
  headerSubtitle: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 },
  refreshBtn: { width: 44, height: 44, backgroundColor: '#111', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  
  // Buscador y Filtros
  searchBarWrapper: { paddingHorizontal: 24, paddingBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#1a1a1a', gap: 12 },
  searchBarInput: { flex: 1, color: '#FFF', fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a' },
  filterBtnActive: { backgroundColor: '#D4AF3715', borderColor: '#D4AF37' },
  filterText: { color: '#555', fontSize: 12, fontWeight: 'bold' },
  filterTextActive: { color: '#D4AF37' },

  scrollContent: { padding: 20, paddingBottom: 120 },
  loaderContainer: { alignItems: 'center', marginTop: 100, gap: 15 },
  loaderText: { color: '#555', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 120, opacity: 0.5, gap: 15 },
  emptyText: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  fab: { position: 'absolute', bottom: 35, right: 25, backgroundColor: '#D4AF37', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#D4AF37', shadowRadius: 15, shadowOpacity: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0c0c0c', borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '94%', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  modalTitle: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  modalSubtitle: { color: '#555', fontSize: 12, marginTop: 2 },
  closeBtn: { width: 36, height: 36, backgroundColor: '#1a1a1a', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalForm: { flex: 1 },
  sectionBlock: { backgroundColor: '#121212', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#1a1a1a' },
  sectionLabel: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { color: '#444', fontSize: 9, marginBottom: 8, fontWeight: 'bold', letterSpacing: 1 },
  input: { backgroundColor: '#000', borderRadius: 12, padding: 16, color: '#FFF', borderWidth: 1.5, borderColor: '#1a1a1a', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTrigger: { backgroundColor: '#000', borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: '#1a1a1a', flexDirection: 'row', alignItems: 'center', gap: 12 },
  pickerTriggerText: { color: '#FFF', fontSize: 15 },
  typeSwitcher: { flex: 1, flexDirection: 'row', backgroundColor: '#000', borderRadius: 12, padding: 5, marginRight: 15, borderWidth: 1, borderColor: '#1a1a1a' },
  typeBtn: { flex: 1, height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  typeBtnActive: { backgroundColor: '#D4AF37' },
  typeText: { color: '#444', fontSize: 12, fontWeight: 'bold' },
  typeTextActive: { color: '#000' },
  priceContainer: { flex: 0.8, backgroundColor: '#000', borderRadius: 12, height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 2, borderColor: '#D4AF37' },
  priceInput: { flex: 1, color: '#D4AF37', fontSize: 17, fontWeight: 'bold', marginLeft: 8 },
  songsTrigger: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#000', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#1a1a1a' },
  songsTriggerText: { color: '#FFF', flex: 1, fontSize: 14, fontWeight: '500' },
  submitBtn: { backgroundColor: '#D4AF37', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, shadowColor: '#D4AF37', shadowRadius: 10, shadowOpacity: 0.3 },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  // Picker de canciones
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#0a0a0a', borderTopLeftRadius: 35, borderTopRightRadius: 35, height: '85%' },
  pickerHandle: { width: 45, height: 5, backgroundColor: '#222', borderRadius: 3, alignSelf: 'center', margin: 15 },
  pickerHeader: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  pickerTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  pickerSubtitle: { color: '#444', fontSize: 12, marginTop: 4 },
  pickerDoneBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  pickerDoneText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', margin: 20, padding: 14, borderRadius: 15, gap: 12, borderWidth: 1, borderColor: '#1a1a1a' },
  searchInput: { color: '#FFF', flex: 1, fontSize: 15 },
  pickerScroll: { flex: 1 },
  letterGroup: { marginBottom: 10 },
  letterHeader: { paddingHorizontal: 25, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 15 },
  letterBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  letterBadgeText: { fontWeight: 'bold', fontSize: 16 },
  letterLabel: { color: '#666', flex: 1, fontSize: 14, fontWeight: '500' },
  songItem: { padding: 20, marginHorizontal: 25, borderBottomWidth: 1, borderBottomColor: '#121212' },
  songItemSelected: { backgroundColor: '#D4AF3710' },
  songItemText: { color: '#999', fontSize: 15 },
  songItemTextSelected: { color: '#D4AF37', fontWeight: 'bold' }
});
