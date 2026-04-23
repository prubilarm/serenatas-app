import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Phone, MessageSquare, MapPin, Music, CheckCircle, Trash2, Edit3, FileText, Share2 } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const API_BASE = 'https://api-alpha-five-25.vercel.app';

const SerenataCard = ({ serenata, onUpdate, onEdit }: any) => {
  
  // 🧭 ARREGLO MAPA: Asegurar que el query sea ultra preciso
  const handleMaps = () => {
    const query = encodeURIComponent(`${serenata.direccion}, ${serenata.comuna}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`
    });
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      }
    });
  };

  const handleCall = () => {
    if (!serenata.telefono) return Alert.alert('Error', 'Sin teléfono.');
    Linking.openURL(`tel:${serenata.telefono}`);
  };

  // 📝 UNIFICADO: Generar Comprobante PDF y enviar por WhatsApp Automáticamente
  const handleWhatsAppPDF = () => {
    if (!serenata.telefono) return Alert.alert('Error', 'No hay teléfono registrado para enviar comprobante.');
    
    const clean = serenata.telefono.replace(/[^0-9]/g, '');
    const num = clean.startsWith('56') ? clean : `56${clean}`;
    const pdfUrl = `${API_BASE}/api/reportes/serenata/${serenata.id}`;
    
    const [y, m, d] = serenata.fecha.split('-');
    const fechaFormateada = `${d}-${m}-${y}`;

    const msg = encodeURIComponent(
      `🎺 *EL MARIACHI AVENTURERO*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *COMPROBANTE DE RESERVA*\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `Hola *${serenata.nombre_cliente || 'Cliente'}*, te enviamos el comprobante oficial de tu reserva para la serenata de *${serenata.nombre_festejada}*.\n\n` +
      `📄 *VER COMPROBANTE:* ${pdfUrl}\n\n` +
      `📅 *Fecha:* ${fechaFormateada}\n` +
      `⏰ *Hora:* ${serenata.hora || 'A convenir'}\n` +
      `📍 *Dirección:* ${serenata.direccion}\n\n` +
      `¡Muchas gracias por confiar en nuestra música! 🌹`
    );

    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  const handleComplete = async () => {
    const { error } = await supabase.from('serenatas').update({ estado: 'completada' }).eq('id', serenata.id);
    if (!error && onUpdate) onUpdate();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Borrar esta serenata?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await supabase.from('serenatas').delete().eq('id', serenata.id);
          if (onUpdate) onUpdate();
      }}
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.festejada}>{serenata.nombre_festejada}</Text>
          <Text style={styles.motivo}>{serenata.motivo}</Text>
          <Text style={styles.contrata}>Cliente: {serenata.nombre_cliente}</Text>
        </View>
        <View style={styles.timeBadge}>
           <Text style={styles.timeText}>{serenata.hora}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.mapBtn} onPress={handleMaps}>
        <MapPin size={14} color="#D4AF37" />
        <Text style={styles.mapText}>{serenata.direccion}, {serenata.comuna}</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem} onPress={handleCall}>
          <View style={[styles.iconCircle, { backgroundColor: '#4285F4' }]}><Phone size={18} color="#FFF" /></View>
          <Text style={styles.actionLabel}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleWhatsAppPDF}>
          <View style={[styles.iconCircle, { backgroundColor: '#25D366' }]}><MessageSquare size={18} color="#FFF" /></View>
          <Text style={styles.actionLabel}>Comprobante</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={onEdit}>
          <View style={[styles.iconCircle, { backgroundColor: '#666' }]}><Edit3 size={18} color="#FFF" /></View>
          <Text style={styles.actionLabel}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={serenata.estado === 'completada' ? handleDelete : handleComplete}>
          <View style={[styles.iconCircle, { backgroundColor: serenata.estado === 'completada' ? '#FF4444' : '#25D366' }]}>
            {serenata.estado === 'completada' ? <Trash2 size={18} color="#FFF" /> : <CheckCircle size={18} color="#FFF" />}
          </View>
          <Text style={styles.actionLabel}>{serenata.estado === 'completada' ? 'Borrar' : 'Listo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  festejada: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  motivo: { color: '#666', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 },
  contrata: { color: '#888', fontSize: 13 },
  timeBadge: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, height: 32 },
  timeText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, backgroundColor: '#1a1a1a', padding: 10, borderRadius: 12 },
  mapText: { color: '#D4AF37', fontSize: 12, flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 15 },
  actionItem: { alignItems: 'center', gap: 6 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' }
});

export default SerenataCard;
