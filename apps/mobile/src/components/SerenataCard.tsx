import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { 
  Phone, MessageCircle, FileText, MapPin, 
  Trash2, Edit3, Clock, DollarSign, Calendar
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function SerenataCard({ serenata, onUpdate, onEdit }: any) {
  const s = serenata;

  const handleStatusToggle = async () => {
    const nextStatus = s.estado === 'completada' ? 'pendiente' : 'completada';
    try {
      await supabase.from('serenatas').update({ estado: nextStatus }).eq('id', s.id);
      if (onUpdate) onUpdate();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Seguro?', [
      { text: 'No' },
      { text: 'Sí', onPress: async () => {
        await supabase.from('serenatas').delete().eq('id', s.id);
        if (onUpdate) onUpdate();
      }}
    ]);
  };

  const openMap = () => {
    if (!s.direccion) return;
    const query = encodeURIComponent(`${s.direccion}, ${s.comuna || ''}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`
    });
    if (url) Linking.openURL(url);
  };

  const handleWhatsAppPDF = () => {
    const folio = s.id.substring(0, 8).toUpperCase();
    const pdfUrl = `https://api-alpha-five-25.vercel.app/api/reportes/serenata/${s.id}`;
    const msg = `🎺 *EL MARIACHI AVENTURERO*%0A━━━━━━━━━━━━━━━━━━━%0A✅ *COMPROBANTE DE RESERVA*%0A%0AHola *${s.nombre_cliente}*, adjunto link oficial de tu reserva para la serenata de *${s.nombre_festejada}*.%0A%0A🔗 *VER COMPROBANTE:* ${pdfUrl}%0A%0A📅 *Fecha:* ${s.fecha.split('-').reverse().join('-')}%0A⏰ *Hora:* ${s.hora}%0A📍 *Ubicación:* ${s.direccion}%0A%0A¡Será un gusto acompañarles con nuestra música! 🌹`;
    
    let phone = s.telefono || '';
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('56')) phone = '56' + phone;
    
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`);
  };

  return (
    <View style={[styles.card, s.estado === 'completada' && styles.cardCompleted]}>
      {/* HEADER: ESTADO Y ACCIONES RÁPIDAS */}
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, s.estado === 'completada' ? styles.badgeSuccess : styles.badgeWarning]}>
          <Text style={styles.statusText}>{s.estado?.toUpperCase()}</Text>
        </View>
        <View style={styles.actionsBox}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}><Edit3 size={18} color="#666" /></TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}><Trash2 size={18} color="#e74c3c" /></TouchableOpacity>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.mainInfo}>
        <View style={styles.dateTime}>
          <View style={styles.infoRow}><Calendar size={14} color="#D4AF37" /><Text style={styles.dateText}>{s.fecha.split('-').reverse().join('-')}</Text></View>
          <View style={styles.infoRow}><Clock size={14} color="#D4AF37" /><Text style={styles.dateText}>{s.hora || '--:--'}</Text></View>
        </View>
        <Text style={styles.festejadaName}>{s.nombre_festejada}</Text>
        <Text style={styles.motivoText}>{s.motivo || 'Serenata Especial'}</Text>
      </View>

      {/* UBICACIÓN CON BOTÓN DE MAPA GIGANTE */}
      <TouchableOpacity style={styles.addressBox} onPress={openMap}>
        <View style={styles.addressIcon}><MapPin size={24} color="#D4AF37" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.addressText} numberOfLines={1}>{s.direccion}</Text>
          <Text style={styles.comunaText}>{s.comuna || 'Sin comuna'} - TOCAR PARA ABRIR MAPA</Text>
        </View>
        <ChevronRight size={20} color="#D4AF37" />
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* FOOTER: PRECIO Y BOTONES DE ACCIÓN */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <DollarSign size={16} color="#2ecc71" />
          <Text style={styles.priceValue}>{s.precio_total?.toLocaleString()}</Text>
        </View>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#2ecc71'}]} onPress={handleStatusToggle}>
             <Check size={18} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#25D366'}]} onPress={handleWhatsAppPDF}>
             <MessageCircle size={18} color="#000" />
             <Text style={styles.btnLabel}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Para evitar error de importación si no está Lucide-react-native completo
const ChevronRight = ({ size, color }: any) => (
    <View style={{ width: size, height: size, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{rotate: '45deg'}], marginLeft: 10, marginTop: 4 }} />
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#111', borderRadius: 20, marginBottom: 15, padding: 18, borderWidth: 1, borderColor: '#222', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  cardCompleted: { opacity: 0.6, borderColor: '#1A331A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeWarning: { backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: '#D4AF37' },
  badgeSuccess: { backgroundColor: 'rgba(46,204,113,0.1)', borderWidth: 1, borderColor: '#2ecc71' },
  statusText: { fontSize: 9, fontWeight: 'bold', color: '#D4AF37' },
  actionsBox: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 4 },
  mainInfo: { marginBottom: 15 },
  dateTime: { flexDirection: 'row', gap: 15, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  festejadaName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  motivoText: { color: '#666', fontSize: 13 },
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#222', marginBottom: 15 },
  addressIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  addressText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  comunaText: { color: '#D4AF37', fontSize: 10, marginTop: 2, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#222', marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceValue: { color: '#2ecc71', fontSize: 18, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  btnAction: { height: 40, paddingHorizontal: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { color: '#000', fontWeight: 'bold', fontSize: 11 }
});
