import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { 
  Phone, MessageCircle, FileText, MapPin, 
  Trash2, Edit3, Clock, DollarSign, Calendar, Check, RotateCcw
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function SerenataCard({ serenata, onUpdate, onEdit }: any) {
  const s = serenata;

  const handleStatusToggle = async () => {
    const isFinishing = s.estado !== 'completada';
    const nextStatus = isFinishing ? 'completada' : 'pendiente';
    
    try {
      await supabase.from('serenatas').update({ estado: nextStatus }).eq('id', s.id);
      
      if (isFinishing) {
        // FLUJO DE FINALIZACIÓN AUTOMÁTICA
        Alert.alert(
          'Servicio Finalizado',
          '¿Deseas enviar el comprobante de pago por WhatsApp ahora?',
          [
            { text: 'No', onPress: () => onUpdate && onUpdate() },
            { text: 'SÍ, ENVIAR', onPress: () => {
              handleWhatsAppPago();
              if (onUpdate) onUpdate();
            }}
          ]
        );
      } else {
        if (onUpdate) onUpdate();
      }
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const openMap = () => {
    if (!s.direccion) return;
    const query = encodeURIComponent(`${s.direccion}, ${s.comuna || ''}`);
    const url = Platform.select({ ios: `maps:0,0?q=${query}`, android: `geo:0,0?q=${query}` });
    if (url) Linking.openURL(url);
  };

  const handleWhatsAppPago = () => {
    const pdfUrl = `https://api-alpha-five-25.vercel.app/api/reportes/pago/${s.id}`;
    const msg = `🎺 *EL MARIACHI AVENTURERO*%0A━━━━━━━━━━━━━━━━━━━%0A✅ *PAGO RECIBIDO EXITOSAMENTE*%0A%0AHola *${s.nombre_cliente}*, muchas gracias por preferir nuestros servicios para la serenata de *${s.nombre_festejada}*.%0A%0A¡Fue un gusto acompañarles! Adjunto su comprobante de pago oficial:%0A%0A🔗 *VER COMPROBANTE:* ${pdfUrl}%0A%0A¡Esperamos verles pronto! 🌹`;
    sendWhatsApp(msg);
  };

  const handleWhatsAppReserva = () => {
    const pdfUrl = `https://api-alpha-five-25.vercel.app/api/reportes/serenata/${s.id}`;
    const msg = `🎺 *EL MARIACHI AVENTURERO*%0A━━━━━━━━━━━━━━━━━━━%0A✅ *RESERVA CONFIRMADA*%0A%0AHola *${s.nombre_cliente}*, adjunto link oficial de la reserva para *${s.nombre_festejada}*:%0A%0A🔗 *VER RESERVA:* ${pdfUrl}%0A%0A📅 *Fecha:* ${s.fecha.split('-').reverse().join('-')}%0A⏰ *Hora:* ${s.hora}%0A%0A¡Haremos de este momento algo inolvidable! 🎸`;
    sendWhatsApp(msg);
  };

  const sendWhatsApp = (text: string) => {
    let phone = s.telefono || '';
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('56')) phone = '56' + phone;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${text}`);
  };

  return (
    <View style={[styles.card, s.estado === 'completada' && styles.cardCompleted]}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, s.estado === 'completada' ? styles.badgeSuccess : styles.badgeWarning]}>
          <Text style={styles.statusText}>{s.estado?.toUpperCase()}</Text>
        </View>
        <View style={styles.actionsBox}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}><Edit3 size={18} color="#666" /></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Eliminar', '¿Seguro?', [{text:'No'},{text:'Sí', onPress: async()=> {await supabase.from('serenatas').delete().eq('id', s.id); onUpdate();}}])} style={styles.actionBtn}><Trash2 size={18} color="#e74c3c" /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainInfo}>
        <View style={styles.dateTime}>
          <View style={styles.infoRow}><Calendar size={14} color="#D4AF37" /><Text style={styles.infoText}>{s.fecha.split('-').reverse().join('-')}</Text></View>
          <View style={styles.infoRow}><Clock size={14} color="#D4AF37" /><Text style={styles.infoText}>{s.hora}</Text></View>
        </View>
        <Text style={styles.festejadaName}>{s.nombre_festejada}</Text>
      </View>

      <TouchableOpacity style={styles.addressBox} onPress={openMap}>
        <MapPin size={20} color="#D4AF37" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.addressText} numberOfLines={1}>{s.direccion}</Text>
          <Text style={styles.comunaText}>{s.comuna} - TOCAR PARA MAPA</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <DollarSign size={16} color="#2ecc71" />
          <Text style={styles.priceValue}>{s.precio_total?.toLocaleString()}</Text>
          {s.estado === 'completada' && (
            <TouchableOpacity onPress={handleStatusToggle} style={{ marginLeft: 15, padding: 5 }}>
              <RotateCcw size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#111', borderColor: '#222', borderWidth: 1}]} onPress={handleWhatsAppReserva}>
             <FileText size={18} color="#D4AF37" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAction, {backgroundColor: s.estado === 'completada' ? '#2ecc71' : '#D4AF37'}]} onPress={handleStatusToggle}>
             {s.estado === 'completada' ? <MessageCircle size={20} color="#000" /> : <Check size={20} color="#000" />}
             <Text style={styles.btnLabel}>{s.estado === 'completada' ? 'RECIBO' : 'FINALIZAR'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0D0D0D', borderRadius: 20, marginBottom: 15, padding: 20, borderWidth: 1, borderColor: '#1F1F1F' },
  cardCompleted: { borderColor: '#1A331A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeWarning: { backgroundColor: 'rgba(212,175,55,0.1)' },
  badgeSuccess: { backgroundColor: 'rgba(46,204,113,0.1)' },
  statusText: { fontSize: 9, fontWeight: 'bold', color: '#D4AF37' },
  actionsBox: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 4 },
  mainInfo: { marginBottom: 15 },
  dateTime: { flexDirection: 'row', gap: 15, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { color: '#888', fontSize: 12 },
  festejadaName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 15 },
  addressText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  comunaText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  priceValue: { color: '#2ecc71', fontSize: 18, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  btnAction: { height: 45, paddingHorizontal: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { color: '#000', fontWeight: 'bold', fontSize: 12 }
});
