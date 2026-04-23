import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { Phone, MessageSquare, MapPin, Music, CheckCircle, Trash2, Edit3, ChevronRight, Clock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const API_BASE = 'https://api-alpha-five-25.vercel.app';

const SerenataCard = ({ serenata, onUpdate, onEdit }: any) => {
  
  const handleMaps = () => {
    const query = encodeURIComponent(`${serenata.direccion}, ${serenata.comuna}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`
    });
    
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  const handleCall = () => {
    if (!serenata.telefono) return Alert.alert('Error', 'Sin teléfono registrado.');
    Linking.openURL(`tel:${serenata.telefono}`);
  };

  const handleWhatsAppPDF = () => {
    if (!serenata.telefono) return Alert.alert('Error', 'No hay teléfono registrado.');
    
    const clean = serenata.telefono.replace(/[^0-9]/g, '');
    const num = clean.startsWith('56') ? clean : `56${clean}`;
    const pdfUrl = `${API_BASE}/api/reportes/serenata/${serenata.id}`;
    
    const d = serenata.fecha.split('-');
    const fechaF = `${d[2]}-${d[1]}-${d[0]}`;

    const msg = encodeURIComponent(
      `🎺 *EL MARIACHI AVENTURERO*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *COMPROBANTE DE RESERVA*\n\n` +
      `Hola *${serenata.nombre_cliente || 'Estimado(a)'}*, adjunto link oficial de tu reserva para la serenata de *${serenata.nombre_festejada}*.\n\n` +
      `🔗 *VER COMPROBANTE:* ${pdfUrl}\n\n` +
      `📅 *Fecha:* ${fechaF}\n` +
      `⏰ *Hora:* ${serenata.hora || 'Por confirmar'}\n` +
      `📍 *Ubicación:* ${serenata.direccion}\n\n` +
      `¡Será un gusto acompañarles con nuestra música! 🌹`
    );

    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  const handleComplete = async () => {
    const { error } = await supabase.from('serenatas').update({ estado: 'completada' }).eq('id', serenata.id);
    if (!error && onUpdate) onUpdate();
  };

  const handleDelete = () => {
    Alert.alert('¿Eliminar evento?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await supabase.from('serenatas').delete().eq('id', serenata.id);
          if (onUpdate) onUpdate();
      }}
    ]);
  };

  const isCompleted = serenata.estado === 'completada';

  return (
    <View style={[styles.container, isCompleted && styles.containerCompleted]}>
      {/* ── HEADER DE LA TARJETA ── */}
      <View style={styles.cardHeader}>
        <View style={styles.titleInfo}>
          <Text style={[styles.festejada, isCompleted && styles.textMuted]}>{serenata.nombre_festejada}</Text>
          <View style={styles.motivoRow}>
            <Text style={styles.motivoLabel}>{serenata.motivo || 'Evento'}</Text>
            <View style={styles.dot} />
            <Text style={styles.clienteName}>{serenata.nombre_cliente}</Text>
          </View>
        </View>
        <View style={[styles.timeTag, isCompleted && styles.timeTagCompleted]}>
          <Clock size={12} color={isCompleted ? '#666' : '#000'} />
          <Text style={[styles.timeText, isCompleted && styles.timeTextCompleted]}>{serenata.hora}</Text>
        </View>
      </View>

      {/* ── UBICACIÓN ── */}
      <TouchableOpacity style={styles.locationBlock} onPress={handleMaps} activeOpacity={0.7}>
        <View style={styles.iconCircleMap}>
          <MapPin size={14} color="#D4AF37" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.direccionText} numberOfLines={1}>{serenata.direccion}</Text>
          <Text style={styles.comunaText}>{serenata.comuna}</Text>
        </View>
        <ChevronRight size={16} color="#333" />
      </TouchableOpacity>

      {/* ── CANCIONES / PRECIO ── */}
      <View style={styles.detailsRow}>
        <View style={styles.songsInfo}>
           <Music size={14} color="#555" />
           <Text style={styles.songsCount}>{serenata.canciones?.length || 0} canciones elegidas</Text>
        </View>
        <Text style={styles.priceTag}>${serenata.precio_total?.toLocaleString('es-CL')}</Text>
      </View>

      {/* ── ACCIONES PREMIUM ── */}
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.actionCircle} onPress={handleCall}>
          <Phone size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCircle} onPress={handleWhatsAppPDF}>
          <MessageSquare size={20} color="#25D366" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCircle} onPress={onEdit}>
          <Edit3 size={20} color="#4285F4" />
        </TouchableOpacity>

        {isCompleted ? (
          <TouchableOpacity style={styles.actionCircle} onPress={handleDelete}>
            <Trash2 size={20} color="#FF6B6B" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
            <CheckCircle size={18} color="#000" />
            <Text style={styles.completeText}>FINALIZAR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5
  },
  containerCompleted: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: '#0a0a0a'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleInfo: { flex: 1 },
  festejada: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', letterSpacing: -0.5 },
  textMuted: { color: '#666' },
  motivoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  motivoLabel: { color: '#555', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#333', marginHorizontal: 8 },
  clienteName: { color: '#888', fontSize: 12 },
  timeTag: { 
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, 
    borderRadius: 12, backgroundColor: '#D4AF37', alignItems: 'center', gap: 6 
  },
  timeTagCompleted: { backgroundColor: '#1a1a1a' },
  timeText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  timeTextCompleted: { color: '#666' },

  locationBlock: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', 
    padding: 15, borderRadius: 16, marginBottom: 18, borderWidth: 1, borderColor: '#161616' 
  },
  iconCircleMap: { 
    width: 32, height: 32, borderRadius: 16, 
    backgroundColor: '#D4AF3715', justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  direccionText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  comunaText: { color: '#444', fontSize: 11, marginTop: 1 },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  songsInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  songsCount: { color: '#555', fontSize: 12 },
  priceTag: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  footerActions: { 
    flexDirection: 'row', alignItems: 'center', gap: 15, 
    borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 20 
  },
  actionCircle: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' 
  },
  completeBtn: { 
    flex: 1, height: 48, backgroundColor: '#D4AF37', borderRadius: 24, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 
  },
  completeText: { color: '#000', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});

export default SerenataCard;
