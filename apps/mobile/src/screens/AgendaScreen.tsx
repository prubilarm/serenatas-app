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
  Alert
} from 'react-native';
import { Plus, Music, X, Calendar, MapPin, DollarSign, User, Check, Trash2, ListMusic, Search, ChevronDown, ChevronRight } from 'lucide-react-native';
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

// Agrupa canciones por letra inicial
const groupByLetter = (songs: string[]) => {
  const groups: { [key: string]: string[] } = {};
  songs.forEach(song => {
    const letter = song[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(song);
  });
  return groups;
};

interface SongPickerModalProps {
  visible: boolean;
  canciones: string[];
  onClose: () => void;
  onToggle: (song: string) => void;
}

const SongPickerModal = ({ visible, canciones, onClose, onToggle }: SongPickerModalProps) => {
  const [search, setSearch] = useState('');
  const [openLetters, setOpenLetters] = useState<Set<string>>(new Set());

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return null; // null = usar modo acordeón
    return LISTADO_CANCIONES.filter(s =>
      s.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const grouped = useMemo(() => groupByLetter(LISTADO_CANCIONES), []);

  const toggleLetter = (letter: string) => {
    setOpenLetters(prev => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  };

  const handleClose = () => {
    setSearch('');
    setOpenLetters(new Set());
    onClose();
  };

  const renderSongRow = (song: string, idx: number) => {
    const selected = canciones.includes(song);
    return (
      <TouchableOpacity
        key={`${song}-${idx}`}
        style={[styles.songItem, selected && styles.songItemSelected]}
        onPress={() => onToggle(song)}
        activeOpacity={0.7}
      >
        <Text style={[styles.songItemText, selected && styles.songItemTextSelected]}>
          {song}
        </Text>
        {selected && (
          <View style={styles.songCheck}>
            <Check size={13} color="#000" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerSheet}>
          {/* Header del picker */}
          <View style={styles.pickerHandle} />
          <View style={styles.pickerHeader}>
            <View>
              <Text style={styles.pickerTitle}>Repertorio</Text>
              <Text style={styles.pickerSubtitle}>
                {canciones.length} canción{canciones.length !== 1 ? 'es' : ''} seleccionada{canciones.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={handleClose}>
              <Text style={styles.pickerDoneText}>Listo</Text>
            </TouchableOpacity>
          </View>

          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Search size={16} color="#D4AF37" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar canción..."
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {filteredSongs !== null ? (
              // ── Modo búsqueda: lista plana filtrada ──
              filteredSongs.length > 0 ? (
                filteredSongs.map((song, idx) => renderSongRow(song, idx))
              ) : (
                <View style={styles.noResults}>
                  <Music size={32} color="rgba(255,255,255,0.1)" />
                  <Text style={styles.noResultsText}>Sin resultados para "{search}"</Text>
                </View>
              )
            ) : (
              // ── Modo acordeón por letra ──
              Object.keys(grouped).sort().map(letter => {
                const isOpen = openLetters.has(letter);
                const songs = grouped[letter];
                const selectedCount = songs.filter(s => canciones.includes(s)).length;
                return (
                  <View key={letter} style={styles.letterGroup}>
                    <TouchableOpacity
                      style={styles.letterHeader}
                      onPress={() => toggleLetter(letter)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.letterBadge}>
                        <Text style={styles.letterBadgeText}>{letter}</Text>
                      </View>
                      <Text style={styles.letterLabel}>
                        {songs.length} canción{songs.length !== 1 ? 'es' : ''}
                      </Text>
                      {selectedCount > 0 && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>{selectedCount} ✓</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }} />
                      {isOpen
                        ? <ChevronDown size={18} color="#D4AF37" />
                        : <ChevronRight size={18} color="#666" />}
                    </TouchableOpacity>
                    {isOpen && songs.map((song, idx) => renderSongRow(song, idx))}
                  </View>
                );
              })
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
    if (!editingId) {
      if (tipo === 'express') setPrecio('25000');
      else if (tipo === 'full') setPrecio('40000');
    }
  }, [tipo, editingId]);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('serenatas').select('*').order('fecha', { ascending: true });
      setSerenatas(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!nombreCliente || !festejada || !fecha || !precio) {
      Alert.alert('Faltan datos', 'Por favor completa los campos obligatorios.');
      return;
    }
    try {
      const payload = {
        nombre_cliente: nombreCliente,
        telefono,
        nombre_festejada: festejada,
        motivo,
        fecha,
        hora,
        direccion,
        comuna,
        precio_total: Number(precio),
        tipo,
        canciones,
        estado: 'pendiente'
      };

      if (editingId) {
        const { error } = await supabase.from('serenatas').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        const { error } = await supabase.from('serenatas').insert([{ id: uuid, ...payload }]);
        if (error) throw error;
      }

      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchData();
      Alert.alert('¡Éxito!', editingId ? 'Serenata actualizada.' : 'Serenata agendada.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
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

  const toggleSong = (song: string) => {
    if (canciones.includes(song)) {
      setCanciones(canciones.filter((c: string) => c !== song));
    } else {
      setCanciones([...canciones, song]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Agenda</Text>
          <Text style={styles.headerSubtitle}>El Mariachi Aventurero</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{serenatas.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
        ) : serenatas.length > 0 ? (
          serenatas.map((s: any) => (
            <SerenataCard key={s.id} serenata={s} onUpdate={fetchData} onEdit={() => handleEdit(s)} />
          ))
        ) : (
          <View style={styles.empty}>
            <Music size={60} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>No hay eventos agendados.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus color="#000" size={30} />
      </TouchableOpacity>

      {/* ── Modal Principal Formulario ── */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Editar Serenata' : 'Nueva Serenata'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setEditingId(null); resetForm(); }}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Cliente que contrata</Text>
              <TextInput style={styles.input} placeholder="Nombre del cliente" placeholderTextColor="#666" value={nombreCliente} onChangeText={setNombreCliente} />
              <TextInput style={styles.input} placeholder="Teléfono del cliente" placeholderTextColor="#666" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />

              <Text style={styles.label}>Detalles del Evento</Text>
              <TextInput style={styles.input} placeholder="¿A quién le cantamos?" placeholderTextColor="#666" value={festejada} onChangeText={setFestejada} />
              <TextInput style={styles.input} placeholder="Motivo (Ej. Cumpleaños)" placeholderTextColor="#666" value={motivo} onChangeText={setMotivo} />

              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Fecha (YYYY-MM-DD)" placeholderTextColor="#666" value={fecha} onChangeText={setFecha} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Hora (HH:MM)" placeholderTextColor="#666" value={hora} onChangeText={setHora} />
              </View>

              <TextInput style={styles.input} placeholder="Dirección completa" placeholderTextColor="#666" value={direccion} onChangeText={setDireccion} />
              <TextInput style={styles.input} placeholder="Comuna / Ciudad" placeholderTextColor="#666" value={comuna} onChangeText={setComuna} />

              <Text style={styles.label}>Tipo y Precio</Text>
              <View style={[styles.row, { marginBottom: 15 }]}>
                <View style={styles.typeSwitcher}>
                  <TouchableOpacity onPress={() => setTipo('express')} style={[styles.typeBtn, tipo === 'express' && styles.typeBtnActive]}>
                    <Text style={[styles.typeText, tipo === 'express' && styles.typeTextActive]}>Express (2s)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTipo('full')} style={[styles.typeBtn, tipo === 'full' && styles.typeBtnActive]}>
                    <Text style={[styles.typeText, tipo === 'full' && styles.typeTextActive]}>Full (4s)</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.priceContainer}>
                  <DollarSign size={14} color="#D4AF37" />
                  <TextInput style={styles.priceInput} keyboardType="numeric" value={precio} onChangeText={setPrecio} />
                </View>
              </View>

              {/* Selector de canciones */}
              <Text style={styles.label}>Canciones ({canciones.length})</Text>
              <TouchableOpacity style={styles.addSongsBtn} onPress={() => setShowSongPicker(true)}>
                <ListMusic size={20} color="#D4AF37" />
                <Text style={styles.addSongsText}>
                  {canciones.length === 0 ? 'Elegir canciones del repertorio' : `${canciones.length} canción${canciones.length !== 1 ? 'es' : ''} seleccionada${canciones.length !== 1 ? 's' : ''} — cambiar`}
                </Text>
              </TouchableOpacity>

              {/* Preview de canciones seleccionadas */}
              {canciones.length > 0 && (
                <View style={styles.selectedSongsPreview}>
                  {[...canciones].sort().map((song: string, idx: number) => (
                    <View key={idx} style={styles.songTag}>
                      <Text style={styles.songTagText}>{song}</Text>
                      <TouchableOpacity onPress={() => setCanciones(canciones.filter((c: string) => c !== song))}>
                        <X size={11} color="#D4AF37" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}>
                <Text style={styles.submitText}>{editingId ? 'GUARDAR CAMBIOS' : 'CONFIRMAR AGENDA'}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal Selector de Canciones ── */}
      <SongPickerModal
        visible={showSongPicker}
        canciones={canciones}
        onClose={() => setShowSongPicker(false)}
        onToggle={toggleSong}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  headerSubtitle: { color: '#D4AF37', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2.5 },
  badge: { backgroundColor: 'rgba(212,175,55,0.12)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' },
  badgeText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 15 },
  scrollContent: { padding: 18, paddingBottom: 110 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.25)', marginTop: 12, fontSize: 14 },
  fab: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#D4AF37', width: 62, height: 62, borderRadius: 31, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#D4AF37', shadowRadius: 12, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 } },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '92%', padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  modalTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
  modalForm: { flex: 1 },
  label: { color: '#D4AF37', fontSize: 10, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 'bold' },
  input: { backgroundColor: '#1C1C1C', borderRadius: 12, padding: 15, color: '#FFF', marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2A', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeSwitcher: { flex: 1, flexDirection: 'row', backgroundColor: '#1C1C1C', borderRadius: 12, height: 55, padding: 5, marginRight: 10 },
  typeBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  typeBtnActive: { backgroundColor: '#D4AF37' },
  typeText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  typeTextActive: { color: '#000' },
  priceContainer: { flex: 0.6, backgroundColor: '#1C1C1C', borderRadius: 12, height: 55, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#D4AF37' },
  priceInput: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 5 },

  addSongsBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(212,175,55,0.08)', padding: 16, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.4)', marginBottom: 14 },
  addSongsText: { color: '#D4AF37', fontWeight: '600', fontSize: 13, flex: 1 },
  selectedSongsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  songTag: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#333' },
  songTagText: { color: '#DDD', fontSize: 11, fontWeight: '500' },

  submitBtn: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: '#D4AF37', shadowRadius: 12, shadowOpacity: 0.35, elevation: 6 },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 15, letterSpacing: 1.5 },

  // SongPickerModal
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', paddingTop: 12 },
  pickerHandle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  pickerTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  pickerSubtitle: { color: '#888', fontSize: 12, marginTop: 3 },
  pickerDoneBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
  pickerDoneText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1A1A1A', margin: 14, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 15 },

  pickerScroll: { flex: 1 },

  // Acordeón
  letterGroup: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  letterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 10 },
  letterBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  letterBadgeText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  letterLabel: { color: '#888', fontSize: 13 },
  selectedBadge: { backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  selectedBadgeText: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold' },

  // Filas de canción
  songItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  songItemSelected: { backgroundColor: '#D4AF37' },
  songItemText: { color: '#DDD', fontSize: 14 },
  songItemTextSelected: { color: '#000', fontWeight: 'bold' },
  songCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },

  // No resultados
  noResults: { alignItems: 'center', marginTop: 50, gap: 12 },
  noResultsText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },
});
