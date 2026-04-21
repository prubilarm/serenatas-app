import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Phone, MessageSquare, MapPin, Music } from 'lucide-react-native';

const SerenataCard = ({ serenata }: any) => {
  const handleCall = () => {
    Linking.openURL(`tel:${serenata.telefono}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${serenata.telefono}&text=Hola ${serenata.cliente}, estoy en camino a la serenata.`);
  };

  const handleMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(serenata.direccion + ', ' + serenata.comuna)}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.festejada}>{serenata.nombre_festejada}</Text>
          <Text style={styles.motivo}>{serenata.motivo}</Text>
        </div>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{serenata.hora}</Text>
        </View>
      </View>

      <Text style={styles.direccion}>
        <MapPin size={14} color="#D4AF37" /> {serenata.direccion}, {serenata.comuna}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
          <Phone size={20} color="#D4AF37" />
          <Text style={styles.actionText}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp}>
          <MessageSquare size={20} color="#25D366" />
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleMaps}>
          <MapPin size={20} color="#4285F4" />
          <Text style={styles.actionText}>Mapa</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  festejada: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textTransform: 'uppercase',
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
    fontSize: 14,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default SerenataCard;
