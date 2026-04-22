import React, { useState, useEffect } from 'react';
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
import { Plus, Music, X, Calendar, MapPin, DollarSign, User, Check, Trash2, ListMusic } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import SerenataCard from '../components/SerenataCard';

const LISTADO_CANCIONES = [
  "Mil puñados de oro", "Jalisco no te rajes", "Un millón de primaveras",
  "La venia bendita", "No me se rajar", "El rey", "Celos", "Mujeres divinas",
  "Me bebí tu recuerdo", "Matalas", "Caballo prieto azabache", "El aventurero",
  "El Adiós a la vida", "Volver Volver", "Borracho te recuerdo", "Cielito lindo",
  "Las mañanitas", "Si te vas no hay lío", "Que chulada de mujer", "Acá entre nos",
  "Que de raro tiene", "Por tu maldito amor", "A quien vas a amar más que a mi",
  "La ley del monte", "El ayudante", "Si nos dejan", "Le canto a la mujer",
  "Yo te extrañará", "Nadie es eterno en el mundo", "Si no te hubieras ido",
  "Madrecita querida", "Mi amigo el tordillo", "Es la mujer"
];

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!nombreCliente || !festejada || !fecha || !precio) {
      Alert.alert("Faltan datos", "Por favor completa los campos obligatorios.");
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
      Alert.alert("¡Éxito!", editingId ? "Serenata actualizada." : "Serenata agendada.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
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
      setCanciones(canciones.filter(c => c !== song));
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

      {/* Modal Principal Formulario */}
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
              <TextInput style={styles.input} placeholder="Escribe el nombre del cliente" placeholderTextColor="#666" value={nombreCliente} onChangeText={setNombreCliente} />
              <TextInput style={styles.input} placeholder="Teléfono del cliente" placeholderTextColor="#666" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />

              <Text style={styles.label}>Detalles del Evento</Text>
              <TextInput style={styles.input} placeholder="¿A quién le cantamos?" placeholderTextColor="#666" value={festejada} onChangeText={setFestejada} />
              <TextInput style={styles.input} placeholder="Motivo (Ej. Cumpleaños)" placeholderTextColor="#666" value={motivo} onChangeText={setMotivo} />
              
              <View style={styles.row}>
                <TextInput style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="Fecha (YYYY-MM-DD)" placeholderTextColor="#666" value={fecha} onChangeText={setFecha} />
                <TextInput style={[styles.input, {flex: 1}]} placeholder="Hora (HH:MM)" placeholderTextColor="#666" value={hora} onChangeText={setHora} />
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

              <Text style={styles.label}>Canciones ({canciones.length})</Text>
              <TouchableOpacity style={styles.addSongsBtn} onPress={() => setShowSongPicker(true)}>
                 <ListMusic size={20} color="#D4AF37" />
                 <Text style={styles.addSongsText}>Elegir/Modificar Canciones</Text>
              </TouchableOpacity>
              
              <View style={styles.songsList}>
                 {canciones.map((song, idx) => (
                   <View key={idx} style={styles.songTag}>
                      <Text style={styles.songTagText}>{song}</Text>
                      <TouchableOpacity onPress={() => setCanciones(canciones.filter(c => c !== song))}>
                        <X size={12} color="#D4AF37" />
                      </TouchableOpacity>
                   </View>
                 ))}
                 {canciones.length === 0 && <Text style={styles.noSongs}>No has elegido canciones aún.</Text>}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}>
                <Text style={styles.submitText}>{editingId ? 'GUARDAR CAMBIOS' : 'CONFIRMAR AGENDA'}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Selector de Canciones */}
      <Modal visible={showSongPicker} animationType="fade" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '80%', paddingBottom: 0 }]}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Repertorio</Text>
                  <TouchableOpacity onPress={() => setShowSongPicker(false)} style={styles.closeBtn}>
                     <Text style={styles.closeBtnText}>Hecho</Text>
                  </TouchableOpacity>
               </View>
               <ScrollView style={{ flex: 1 }}>
                  {LISTADO_CANCIONES.map((song, idx) => {
                    const isSelected = canciones.includes(song);
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.songItem, isSelected && styles.songItemSelected]}
                        onPress={() => toggleSong(song)}
                      >
                         <Text style={[styles.songItemText, isSelected && styles.songItemTextSelected]}>{song}</Text>
                         {isSelected && <Check size={18} color="#000" />}
                      </TouchableOpacity>
                    );
                  })}
               </ScrollView>
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#D4AF37', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 },
  badge: { backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#D4AF37', fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#D4AF37', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  modalForm: { flex: 1 },
  label: { color: '#D4AF37', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
  input: { backgroundColor: '#222', borderRadius: 12, padding: 15, color: '#FFF', marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeSwitcher: { flex: 1, flexDirection: 'row', backgroundColor: '#222', borderRadius: 12, height: 55, padding: 5, marginRight: 10 },
  typeBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  typeBtnActive: { backgroundColor: '#D4AF37' },
  typeText: { color: '#AAA', fontSize: 12, fontWeight: 'bold' },
  typeTextActive: { color: '#000' },
  priceContainer: { flex: 0.6, backgroundColor: '#222', borderRadius: 12, height: 55, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: '#D4AF37' },
  priceInput: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
  
  addSongsBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(212,175,55,0.1)', padding: 15, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D4AF37' },
  addSongsText: { color: '#D4AF37', fontWeight: 'bold' },
  songsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15, marginBottom: 25 },
  songTag: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#444' },
  songTagText: { color: '#FFF', fontSize: 11 },
  noSongs: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontStyle: 'italic' },
  
  submitBtn: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#D4AF37', shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
  submitText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  
  closeBtn: { backgroundColor: '#D4AF37', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  closeBtnText: { color: '#000', fontWeight: 'bold' },
  songItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  songItemSelected: { backgroundColor: '#D4AF37' },
  songItemText: { color: '#FFF', fontSize: 15 },
  songItemTextSelected: { color: '#000', fontWeight: 'bold' }
});
