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
import { Plus, Users, Phone, X, Save } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const fetchClientes = async () => {
    try {
      const { data } = await supabase.from('clientes').select('*').order('nombre', { ascending: true });
      setClientes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCreate = async () => {
    if (!nombre || !telefono) {
      Alert.alert("Error", "Nombre y teléfono son obligatorios.");
      return;
    }

    try {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      const { error } = await supabase.from('clientes').insert([{
        id: uuid,
        nombre,
        telefono,
        observaciones
      }]);

      if (error) throw error;
      
      setShowModal(false);
      setNombre(''); setTelefono(''); setObservaciones('');
      fetchClientes();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <TouchableOpacity style={styles.addIcon} onPress={() => setShowModal(true)}>
          <Plus color="#D4AF37" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClientes(); }} tintColor="#D4AF37" />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
        ) : clientes.length > 0 ? (
          clientes.map((c: any) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.avatar}>
                   <Text style={styles.avatarText}>{c.nombre.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.clientName}>{c.nombre}</Text>
                  <Text style={styles.clientPhone}>{c.telefono}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Users size={60} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>No hay clientes registrados.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Creación */}
      <Modal visible={showModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nuevo Cliente</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                   <X color="#999" size={24} />
                </TouchableOpacity>
              </View>

              <TextInput style={styles.input} placeholder="Nombre Completo" placeholderTextColor="#666" value={nombre} onChangeText={setNombre} />
              <TextInput style={styles.input} placeholder="Teléfono" keyboardType="phone-pad" placeholderTextColor="#666" value={telefono} onChangeText={setTelefono} />
              <TextInput style={[styles.input, {height: 100}]} placeholder="Observaciones" multiline placeholderTextColor="#666" value={observaciones} onChangeText={setObservaciones} />

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                 <Save color="#000" size={20} />
                 <Text style={styles.saveText}>GUARDAR CLIENTE</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  addIcon: { padding: 5 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#D4AF37' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 18 },
  clientName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  clientPhone: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  input: { backgroundColor: '#000', borderRadius: 10, padding: 15, color: '#FFF', marginBottom: 15 },
  saveBtn: { backgroundColor: '#D4AF37', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveText: { color: '#000', fontWeight: 'bold' }
});
