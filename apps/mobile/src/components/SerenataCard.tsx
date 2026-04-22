import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Phone, MessageSquare, MapPin, Music, CheckCircle, Trash2, Edit3, FileText } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const API_BASE = 'https://api-alpha-five-25.vercel.app';

const SerenataCard = ({ serenata, onUpdate, onEdit }: any) => {
  const handleCall = () => {
    if (!serenata.telefono) return Alert.alert('Error', 'No hay teléfono registrado.');
    Linking.openURL(`tel:${serenata.telefono}`);
  };

  const handleWhatsAppSimple = () => {
    if (!serenata.telefono) return Alert.alert('Error', 'No hay teléfono registrado.');
    const clean = serenata.telefono.replace(/[^0-9]/g, '');
    const num = clean.startsWith('56') ? clean : `56${clean}`;
    const msg = encodeURIComponent(
      `Hola, soy del Mariachi Aventurero. Estoy confirmando la serenata para ${serenata.nombre_festejada}.`
    );
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  const handleWhatsAppComprobante = async () => {
    if (!serenata.telefono) return Alert.alert('Error', 'No hay teléfono registrado.');
    const clean = serenata.telefono.replace(/[^0-9]/g, '');
    const num = clean.startsWith('56') ? clean : `56${clean}`;

    const fechaFormateada = (() => {
      if (!serenata.fecha) return serenata.fecha;
      const [year, month, day] = serenata.fecha.split('-');
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      return `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
    })();

    const tipoLabel = serenata.tipo === 'full'
      ? 'Serenata Completa (4 canciones)'
      : 'Serenata Express (2 canciones)';

    const cancionesText = serenata.canciones && serenata.canciones.length > 0
      ? serenata.canciones.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')
      : 'A elección en el momento';

    const msg = encodeURIComponent(
      `🎺 *EL MARIACHI AVENTURERO*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *COMPROBANTE DE RESERVA*\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *Cliente:* ${serenata.nombre_cliente || 'N/A'}\n` +
      `🎉 *Serenata para:* ${serenata.nombre_festejada}\n` +
      `🎊 *Motivo:* ${serenata.motivo || 'Celebración especial'}\n\n` +
      `📅 *Fecha:* ${fechaFormateada}\n` +
      `⏰ *Hora:* ${serenata.hora || 'Por confirmar'}\n` +
      `📍 *Dirección:* ${serenata.direccion}${serenata.comuna ? ', ' + serenata.comuna : ''}\n\n` +
      `🎵 *Tipo:* ${tipoLabel}\n` +
      `💰 *Valor:* $${(serenata.precio_total || 0).toLocaleString('es-CL')}\n\n` +
      `🎼 *Repertorio:*\n${cancionesText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `¡Gracias por elegirnos! Haremos de este momento algo inolvidable. 🌹`
    );

    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  const handleMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        serenata.direccion + ', ' + serenata.comuna
      )}`
    );
  };

  const handlePDF = () => {
    const pdfUrl = `${API_BASE}/api/reportes/serenata/${serenata.id}`;
    Linking.openURL(pdfUrl);
  };

  const handleComplete = async () => {
    const { error } = await supabase
      .from('serenatas')
      .update({ estado: 'completada' })
      .eq('id', serenata.id);
    if (!error && onUpdate) onUpdate();
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Serenata',
      '¿Estás seguro de que quieres borrar esta serenata?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('serenatas').delete().eq('id', serenata.id);
            if (onUpdate) onUpdate();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.festejada}>{serenata.nombre_festejada}</Text>
          <Text style={styles.motivo}>{serenata.motivo}</Text>
          {serenata.nombre_cliente && (
            <Text style={styles.contrata}>Contrata: {serenata.nombre_cliente}</Text>
          )}
        </View>
        <View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{serenata.hora}</Text>
          </View>
          {serenata.precio_total && (
            <Text style={styles.precio}>${serenata.precio_total.toLocaleString('es-CL')}</Text>
          )}
        </View>
      </View>

      {/* Dirección */}
      <TouchableOpacity style={styles.direccionRow} onPress={handleMaps}>
        <MapPin size={13} color="#D4AF37" />
        <Text style={styles.direccion}>{serenata.direccion}, {serenata.comuna}</Text>
      </TouchableOpacity>

      {/* Canciones preview */}
      {serenata.canciones && serenata.canciones.length > 0 && (
        <View style={styles.songsPreview}>
          <Music size={13} color="#D4AF37" />
          <Text style={styles.songsText} numberOfLines={1}>
            {serenata.canciones.join('  ·  ')}
          </Text>
        </View>
      )}

      {/* Fila de acciones */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
          <Phone size={18} color="#D4AF37" />
          <Text style={styles.actionText}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsAppSimple}>
          <MessageSquare size={18} color="#25D366" />
          <Text style={styles.actionText}>WApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handlePDF}>
          <FileText size={18} color="#FF6B6B" />
          <Text style={styles.actionText}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Edit3 size={18} color="#4285F4" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>

        {serenata.estado !== 'completada' ? (
          <TouchableOpacity style={styles.actionBtn} onPress={handleComplete}>
            <CheckCircle size={18} color="#25D366" />
            <Text style={styles.actionText}>Listo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
            <Trash2 size={18} color="#FF4444" />
            <Text style={styles.actionText}>Borrar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botón WhatsApp Comprobante — destacado */}
      <TouchableOpacity style={styles.whatsappComprobanteBtn} onPress={handleWhatsAppComprobante}>
        <MessageSquare size={16} color="#FFF" />
        <Text style={styles.whatsappComprobanteText}>Enviar Comprobante por WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  festejada: {
    color: '#D4AF37',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  motivo: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 1,
  },
  contrata: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  precio: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  direccionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  direccion: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    flex: 1,
  },
  songsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212,175,55,0.06)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  songsText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 14,
    marginBottom: 12,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  actionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: 'bold',
  },
  whatsappComprobanteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  whatsappComprobanteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

export default SerenataCard;
