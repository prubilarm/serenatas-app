import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, Linking, 
  Alert, Platform, Modal, TextInput, ScrollView
} from 'react-native';
import { 
  MessageCircle, MapPin, Trash2, Edit3, 
  Clock, DollarSign, Calendar, Check, RotateCcw,
  FileText, Music, X
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function SerenataCard({ serenata, onUpdate, onEdit }: any) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [montoPago, setMontoPago] = useState('');
  const [medioPago, setMedioPago] = useState('Transferencia'); // 'Transferencia' o 'Efectivo'
  
  const s = serenata;
  
  const handleStatusToggle = async () => {
    if (s.estado !== 'completada') {
      // Al finalizar, primero registramos el pago
      setMontoPago(s.precio_total?.toString() || '');
      setShowPaymentModal(true);
    } else {
      try {
        await supabase.from('serenatas').update({ estado: 'pendiente' }).eq('id', s.id);
        if (onUpdate) onUpdate();
      } catch (e: any) { Alert.alert('Error', e.message); }
    }
  };

  const confirmFinalization = async () => {
    try {
      await supabase.from('serenatas').update({ 
        estado: 'completada',
        monto_pagado: Number(montoPago),
        medio_pago: medioPago
      }).eq('id', s.id);
      
      setShowPaymentModal(false);
      
      Alert.alert(
        'Servicio Finalizado',
        '¿Deseas enviar el comprobante de pago por WhatsApp?',
        [
          { text: 'No', onPress: () => onUpdate && onUpdate() },
          { text: 'SÍ, ENVIAR', onPress: () => {
            handleWhatsAppPago();
            if (onUpdate) onUpdate();
          }}
        ]
      );
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const openMap = () => {
    if (!s.direccion) return;
    const query = encodeURIComponent(`${s.direccion}, ${s.comuna || ''}`);
    const url = Platform.select({ ios: `maps:0,0?q=${query}`, android: `geo:0,0?q=${query}` });
    if (url) Linking.openURL(url);
  };

  const handleWhatsAppPago = () => {
    // SIN CANCIONES en el comprobante de pago
    const msg = `🎺 *EL MARIACHI AVENTURERO*
━━━━━━━━━━━━━━━━━━━
✅ *COMPROBANTE DE PAGO*

Hola *${s.nombre_cliente}*, confirmamos la recepción del pago por la serenata realizada hoy.

*DETALLES DEL SERVICIO:*
• *Festejada:* ${s.nombre_festejada}
• *Motivo:* ${s.motivo || 'Serenata'}
• *Fecha:* ${s.fecha.split('-').reverse().join('-')}
• *Ubicación:* ${s.direccion}, ${s.comuna}

*MONTO PAGADO:* $${Number(montoPago || s.precio_total).toLocaleString()}
*MEDIO DE PAGO:* ${medioPago}

Muchas gracias por preferir nuestros servicios. ¡Hicimos de este momento algo inolvidable! 🌹`;
    
    sendWhatsApp(msg);
  };

  const handleWhatsAppReserva = () => {
    // CON CANCIONES y LISTA NUMERADA
    let cancionesTxt = 'A elección del cliente';
    if (s.canciones?.length > 0) {
      cancionesTxt = '\n' + s.canciones.map((c: string, i: number) => `${i + 1}.- ${c}`).join('\n');
    }

    const msg = `🎺 *EL MARIACHI AVENTURERO*
━━━━━━━━━━━━━━━━━━━
✅ *CONFIRMACIÓN DE RESERVA*

Hola *${s.nombre_cliente}*, tu reserva ha sido agendada con éxito.

*DETALLES DE LA CITA:*
• *Para:* ${s.nombre_festejada}
• *Motivo:* ${s.motivo || 'Evento Especial'}
• *Fecha:* ${s.fecha.split('-').reverse().join('-')}
• *Hora:* ${s.hora}
• *Dirección:* ${s.direccion}, ${s.comuna}
• *Repertorio:* ${cancionesTxt}

*VALOR DEL SERVICIO:* $${s.precio_total?.toLocaleString()}

¡Muchas gracias por su confianza! Será un gusto acompañarles con nuestra música. 🎸🌹`;
    
    sendWhatsApp(msg);
  };

  const sendWhatsApp = (text: string) => {
    let phone = s.telefono || '';
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('56')) phone = '56' + phone;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`;
    Linking.openURL(url);
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
        {s.canciones?.length > 0 && (
          <View style={[styles.infoRow, { marginTop: 5 }]}>
            <Music size={12} color="#666" />
            <Text style={styles.cancionesMini} numberOfLines={1}>{s.canciones.length} canciones elegidas</Text>
          </View>
        )}
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
             <Check size={20} color="#000" />
             <Text style={styles.btnLabel}>{s.estado === 'completada' ? 'FINALIZADA' : 'FINALIZAR'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL REGISTRAR PAGO */}
      <Modal visible={showPaymentModal} animationType="fade" transparent={true}>
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentModal}>
             <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>REGISTRAR PAGO</Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}><X color="#666" /></TouchableOpacity>
             </View>
             
             <Text style={styles.paymentLabel}>MONTO RECIBIDO</Text>
             <TextInput 
                style={styles.paymentInput} 
                keyboardType="numeric" 
                value={montoPago} 
                onChangeText={setMontoPago}
                placeholder="Ej: 40000"
                placeholderTextColor="#444"
             />

             <Text style={styles.paymentLabel}>MEDIO DE PAGO</Text>
             <View style={styles.paymentMethods}>
                {['Transferencia', 'Efectivo'].map(m => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.methodBtn, medioPago === m && styles.methodBtnActive]} 
                    onPress={() => setMedioPago(m)}
                  >
                    <Text style={[styles.methodText, medioPago === m && styles.methodTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
             </View>

             <TouchableOpacity style={styles.confirmPayBtn} onPress={confirmFinalization}>
                <Text style={styles.confirmPayText}>CONFIRMAR Y FINALIZAR</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cancionesMini: { color: '#555', fontSize: 11, marginLeft: 5 },
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 15 },
  addressText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  comunaText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  priceValue: { color: '#2ecc71', fontSize: 18, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  btnAction: { height: 45, paddingHorizontal: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  paymentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 30 },
  paymentModal: { backgroundColor: '#111', borderRadius: 25, padding: 25, borderWidth: 1, borderColor: '#222' },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  paymentTitle: { color: '#D4AF37', fontWeight: 'bold', fontSize: 16 },
  paymentLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  paymentInput: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 12, color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  paymentMethods: { flexDirection: 'row', gap: 10, marginTop: 5 },
  methodBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  methodBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  methodText: { color: '#666', fontWeight: 'bold', fontSize: 11 },
  methodTextActive: { color: '#000' },
  confirmPayBtn: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  confirmPayText: { color: '#000', fontWeight: 'bold' }
});
