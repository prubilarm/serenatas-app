import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Phone, MessageSquare, MapPin, Music, CheckCircle, Trash2, Edit3, FileText, Share2 } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const SerenataCard = ({ serenata, onUpdate, onEdit }: any) => {
  const handleCall = () => {
    if (!serenata.telefono) return Alert.alert("Error", "No hay teléfono registrado.");
    Linking.openURL(`tel:${serenata.telefono}`);
  };

  const handleWhatsApp = () => {
    if (!serenata.telefono) return Alert.alert("Error", "No hay teléfono registrado.");
    const cleanNumber = serenata.telefono.replace(/[^0-9]/g, '');
    const finalNumber = cleanNumber.startsWith('56') ? cleanNumber : `56${cleanNumber}`;
    const message = encodeURIComponent(`Hola, soy del Mariachi Aventurero. Estoy en camino a la serenata para ${serenata.nombre_festejada}.`);
    Linking.openURL(`https://wa.me/${finalNumber}?text=${message}`);
  };

  const handleMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(serenata.direccion + ', ' + serenata.comuna)}`);
  };

  const handlePDF = () => {
    // URL del API oficial en Vercel
    const pdfUrl = `https://api-alpha-five-25.vercel.app/api/reportes/serenata/${serenata.id}`;
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
      "Eliminar Serenata",
      "¿Estás seguro de que quieres borrar esta serenata?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            await supabase.from('serenatas').delete().eq('id', serenata.id);
            if (onUpdate) onUpdate();
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.festejada}>{serenata.nombre_festejada}</Text>
          <Text style={styles.motivo}>{serenata.motivo}</Text>
          {serenata.nombre_cliente && (
            <Text style={styles.contrata}>Contrata: {serenata.nombre_cliente}</Text>
          )}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{serenata.hora}</Text>
        </View>
      </View>

      <Text style={styles.direccion}>
        <MapPin size={14} color="#D4AF37" /> {serenata.direccion}, {serenata.comuna}
      </Text>

      {serenata.canciones && serenata.canciones.length > 0 && (
        <View style={styles.songsPreview}>
          <Music size={14} color="#D4AF37" />
          <Text style={styles.songsText} numberOfLines={1}>
            {serenata.canciones.join(', ')}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
          <Phone size={18} color="#D4AF37" />
          <Text style={styles.actionText}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp}>
          <MessageSquare size={18} color="#25D366" />
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handlePDF}>
          <FileText size={18} color="#FF4444" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  festejada: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  contrata: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  direccion: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 10,
  },
  songsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  songsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  actionText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default SerenataCard;
