import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, Linking, 
  Alert, Platform, Modal, TextInput, ScrollView
} from 'react-native';
import { 
  MessageCircle, MapPin, Trash2, Edit3, 
  Clock, DollarSign, Calendar, Check, RotateCcw,
  FileText, Music, X, Share2
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import imagenFondo from '../../assets/imagen_comprobante.jpeg';

export default function SerenataCard({ serenata, onUpdate, onEdit }: any) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [montoPago, setMontoPago] = useState('');
  const [medioPago, setMedioPago] = useState('Transferencia');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const s = serenata;
  
  const handleStatusToggle = async () => {
    // Ahora abrimos el modal de pago siempre que queramos registrar algo, 
    // o para finalizar si el saldo es 0.
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedUserId || !montoPago) {
      Alert.alert('Error', 'Selecciona un cliente y el monto.');
      return;
    }
    try {
      const monto = Number(montoPago);
      // 1. Insertar Pago
      const { error: pagoErr } = await supabase.from('pagos').insert([{
        serenata_id: s.id,
        usuario_id: selectedUserId,
        monto: monto,
        metodo: medioPago.toLowerCase(),
        fecha_pago: new Date().toISOString()
      }]);
      if (pagoErr) throw pagoErr;

      // 2. Actualizar estado_pago en usuario_serenata
      // Necesitamos saber cuánto ha pagado este usuario en total
      const { data: pagosUsuario } = await supabase
        .from('pagos')
        .select('monto')
        .eq('serenata_id', s.id)
        .eq('usuario_id', selectedUserId);
      
      const totalPagadoUsuario = (pagosUsuario || []).reduce((acc, curr) => acc + Number(curr.monto), 0);
      const participante = s.participantes?.find((p: any) => p.usuario_id === selectedUserId);
      
      let nuevoEstado = 'pendiente';
      if (totalPagadoUsuario >= participante.monto_comprometido) nuevoEstado = 'pagado';
      else if (totalPagadoUsuario > 0) nuevoEstado = 'abonado';

      await supabase
        .from('usuario_serenata')
        .update({ estado_pago: nuevoEstado })
        .eq('serenata_id', s.id)
        .eq('usuario_id', selectedUserId);

      // 3. Verificar si la serenata completa está pagada
      const { data: todosLosPagos } = await supabase.from('pagos').select('monto').eq('serenata_id', s.id);
      const totalSerenata = (todosLosPagos || []).reduce((acc, curr) => acc + Number(curr.monto), 0);
      
      if (totalSerenata >= s.precio_total) {
        await supabase.from('serenatas').update({ estado: 'completada' }).eq('id', s.id);
      }

      setShowPaymentModal(false);
      setMontoPago('');
      if (onUpdate) onUpdate();
      Alert.alert('Éxito', 'Pago registrado correctamente.');
    } catch (e: any) { 
      Alert.alert('Error', 'No se pudo registrar el pago: ' + e.message); 
    }
  };

  const openMap = () => {
    if (!s.direccion) return;
    const query = encodeURIComponent(`${s.direccion}, ${s.comuna || ''}`);
    const url = Platform.select({ ios: `maps:0,0?q=${query}`, android: `geo:0,0?q=${query}` });
    if (url) Linking.openURL(url);
  };

  const generatePDF = async (type: 'reserva' | 'pago') => {
    try {
      let imgUri = '';
      try {
        const asset = Asset.fromModule(imagenFondo);
        await asset.downloadAsync();
        const base64Img = await FileSystem.readAsStringAsync(asset.localUri || asset.uri, { encoding: 'base64' });
        imgUri = `data:image/jpeg;base64,${base64Img}`;
      } catch (imgError) {
        console.warn('PDF: Imagen de fondo no disponible, se usará diseño plano.');
      }

      const isReserva = type === 'reserva';
      const fechaTxt = s.fecha ? s.fecha.split('-').reverse().join('/') : 'Por definir';
      const valorTxt = s.precio_total ? s.precio_total.toLocaleString('es-CL') : '0';
      const montoPagadoTxt = Number(montoPago || s.precio_total || 0).toLocaleString('es-CL');
      
      let cancionesTxt = 'A elección del cliente';
      if (s.canciones && Array.isArray(s.canciones) && s.canciones.length > 0) {
        cancionesTxt = s.canciones.map((c: string, i: number) => `${i + 1}.- ${c}`).join('<br/>');
      }

      const title = isReserva ? 'CONFIRMACIÓN DE RESERVA' : 'COMPROBANTE DE PAGO';
      const msgPrincipal = isReserva ? '¡Tu serenata ha sido agendada!' : '¡Pago recibido correctamente!';

      const html = `
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; font-family: Helvetica, sans-serif; background: #000; color: #fff; }
              .container {
                position: relative; width: 100%; height: 100vh;
                background-color: #0c0c0c;
                ${imgUri ? `background-image: url('${imgUri}');` : ''}
                background-size: cover; background-position: center;
              }
              .overlay {
                position: absolute; inset: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;
              }
              .header { border-bottom: 2px solid #D4AF37; margin-bottom: 30px; width: 85%; padding-bottom: 20px; }
              .brand { color: #D4AF37; font-size: 16px; font-weight: bold; letter-spacing: 4px; }
              .title { font-size: 32px; font-weight: bold; color: #fff; margin-top: 10px; }
              .content { 
                width: 90%; background: rgba(20, 20, 20, 0.8); border-radius: 20px; 
                padding: 30px; border: 1px solid rgba(212, 175, 55, 0.3); text-align: left;
              }
              .item { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; }
              .label { font-size: 10px; color: #D4AF37; font-weight: bold; text-transform: uppercase; }
              .value { font-size: 18px; font-weight: bold; color: #fff; }
              .price-box { 
                margin-top: 20px; border: 2px solid ${isReserva ? '#D4AF37' : '#2ecc71'}; 
                padding: 15px; border-radius: 12px; text-align: center;
              }
              .price-value { font-size: 28px; font-weight: bold; color: ${isReserva ? '#fff' : '#2ecc71'}; }
              .footer { margin-top: 40px; font-size: 12px; color: #D4AF37; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="container"><div class="overlay">
              <div class="header">
                <div class="brand">EL MARIACHI AVENTURERO</div>
                <div class="title">${title}</div>
              </div>
              <div class="content">
                <div class="item"><div class="label">CLIENTE</div><div class="value">${s.nombre_cliente || 'N/A'}</div></div>
                <div class="item"><div class="label">FESTEJADA</div><div class="value">${s.nombre_festejada || 'N/A'}</div></div>
                <div class="item"><div class="label">FECHA Y HORA</div><div class="value">${fechaTxt} - ${s.hora || '--:--'} hrs</div></div>
                <div class="item"><div class="label">DIRECCIÓN</div><div class="value">${s.direccion || 'N/A'}, ${s.comuna || ''}</div></div>
                <div class="item"><div class="label">${isReserva ? 'REPERTORIO' : 'MEDIO DE PAGO'}</div><div class="value" style="font-size: 14px;">${isReserva ? cancionesTxt : medioPago}</div></div>
                <div class="price-box">
                  <div class="label">${isReserva ? 'VALOR TOTAL' : 'MONTO PAGADO'}</div>
                  <div class="price-value">$ ${isReserva ? valorTxt : montoPagadoTxt}</div>
                </div>
              </div>
              <div class="footer">"Hacemos de cada momento algo inolvidable"</div>
            </div></div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const safeName = (s.nombre_festejada || 'Cliente').replace(/ /g, '_').substring(0, 15);
      const filename = `${isReserva ? 'Reserva' : 'Comprobante'}_${safeName}.pdf`;
      const newUri = FileSystem.cacheDirectory + filename;
      
      await FileSystem.moveAsync({ from: uri, to: newUri });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert('Error', 'No se puede compartir el archivo.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo generar el documento: ' + error.message);
    }
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

      <View style={styles.participantsList}>
        <Text style={styles.participantsTitle}>PARTICIPANTES:</Text>
        {(s.participantes || []).map((p: any) => (
          <View key={p.id} style={styles.participantRow}>
            <Text style={styles.participantName}>{p.cliente?.nombre}</Text>
            <View style={[styles.miniBadge, p.estado_pago === 'pagado' ? styles.bgSuccess : p.estado_pago === 'abonado' ? styles.bgInfo : styles.bgWarning]}>
               <Text style={styles.miniBadgeText}>{p.estado_pago.toUpperCase()}</Text>
            </View>
            <Text style={styles.participantAmount}>$ {p.monto_comprometido?.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addressBox} onPress={openMap}>
        <MapPin size={20} color="#D4AF37" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.addressText} numberOfLines={1}>{s.direccion}</Text>
          <Text style={styles.comunaText}>{s.comuna}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <DollarSign size={16} color="#2ecc71" />
          <Text style={styles.priceValue}>{s.precio_total?.toLocaleString('es-CL')}</Text>
        </View>
        <View style={styles.buttonGroup}>
          {s.estado !== 'completada' ? (
            <>
              <TouchableOpacity style={[styles.btnAction, styles.btnOutline]} onPress={() => generatePDF('reserva')}>
                <FileText size={18} color="#D4AF37" /><Text style={[styles.btnLabel, {color: '#D4AF37'}]}>RESERVA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, styles.btnGold]} onPress={handleStatusToggle}>
                <Check size={20} color="#000" /><Text style={styles.btnLabel}>FINALIZAR</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[styles.btnAction, styles.btnGreen]} onPress={() => generatePDF('pago')}>
                <FileText size={18} color="#000" /><Text style={styles.btnLabel}>PAGADO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, styles.btnOutline]} onPress={handleStatusToggle}>
                <RotateCcw size={18} color="#666" /><Text style={[styles.btnLabel, {color: '#666'}]}>VOLVER</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={showPaymentModal} animationType="fade" transparent={true}>
        <View style={styles.paymentOverlay}><View style={styles.paymentModal}>
           <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>REGISTRAR PAGO</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}><X color="#666" /></TouchableOpacity>
           </View>
           <Text style={styles.paymentLabel}>¿QUIÉN PAGA?</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {(s.participantes || []).map((p: any) => (
                <TouchableOpacity 
                  key={p.usuario_id} 
                  style={[styles.clientChip, selectedUserId === p.usuario_id && styles.clientChipActive]} 
                  onPress={() => setSelectedUserId(p.usuario_id)}
                >
                   <Text style={[styles.clientChipText, selectedUserId === p.usuario_id && styles.whiteText]}>{p.cliente?.nombre}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>

           <Text style={styles.paymentLabel}>MONTO RECIBIDO</Text>
           <TextInput style={styles.paymentInput} keyboardType="numeric" value={montoPago} onChangeText={setMontoPago} />
           <Text style={styles.paymentLabel}>MEDIO DE PAGO</Text>
           <View style={styles.paymentMethods}>
              {['Transferencia', 'Efectivo'].map(m => (
                <TouchableOpacity key={m} style={[styles.methodBtn, medioPago === m && styles.methodBtnActive]} onPress={() => setMedioPago(m)}>
                  <Text style={[styles.methodText, medioPago === m && styles.methodTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
           </View>
           <TouchableOpacity style={styles.confirmPayBtn} onPress={confirmPayment}>
              <Text style={styles.confirmPayText}>REGISTRAR PAGO</Text>
           </TouchableOpacity>
        </View></View>
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
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 15 },
  addressText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  comunaText: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold' },
  cardFooter: { marginTop: 10 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderTopWidth: 1, borderTopColor: '#1A1A1A', paddingTop: 15 },
  priceValue: { color: '#2ecc71', fontSize: 22, fontWeight: 'bold', marginLeft: 2 },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  btnAction: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnOutline: { backgroundColor: '#111', borderColor: '#333', borderWidth: 1 },
  btnGold: { backgroundColor: '#D4AF37' },
  btnGreen: { backgroundColor: '#2ecc71' },
  btnLabel: { color: '#000', fontWeight: 'bold', fontSize: 11 },
  paymentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 30 },
  paymentModal: { backgroundColor: '#111', borderRadius: 25, padding: 25, borderWidth: 1, borderColor: '#222' },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  paymentTitle: { color: '#D4AF37', fontWeight: 'bold', fontSize: 16 },
  paymentLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  paymentInput: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 12, color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  paymentMethods: { flexDirection: 'row', gap: 10, marginTop: 5 },
  methodBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  methodBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  methodText: { color: '#666', fontWeight: 'bold', fontSize: 11 },
  methodTextActive: { color: '#000' },
  confirmPayBtn: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  confirmPayText: { color: '#000', fontWeight: 'bold' },
  participantsList: { marginBottom: 15, padding: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 },
  participantsTitle: { color: '#444', fontSize: 9, fontWeight: 'bold', marginBottom: 8 },
  participantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 10 },
  participantName: { color: '#FFF', fontSize: 13, flex: 1 },
  participantAmount: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  miniBadgeText: { fontSize: 8, fontWeight: 'bold', color: '#000' },
  bgSuccess: { backgroundColor: '#2ecc71' },
  bgWarning: { backgroundColor: '#f1c40f' },
  bgInfo: { backgroundColor: '#3498db' },
  clientChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  clientChipActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  clientChipText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  whiteText: { color: '#000' }
});
