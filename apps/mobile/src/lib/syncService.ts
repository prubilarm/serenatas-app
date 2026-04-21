import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import { OfflineService } from './offlineService';

export const SyncService = {
  // Función principal para sincronizar
  runSync: async () => {
    const queue = await OfflineService.getSyncQueue();
    
    if (queue.length === 0) return;

    console.log(`Intentando sincronizar ${queue.length} elementos...`);

    for (const item of queue) {
      try {
        const { error } = await supabase
          .from('serenatas')
          .insert([item.data]);

        if (error) throw error;
      } catch (e) {
        console.error('Fallo sincronización de un elemento', e);
        // Podríamos implementar reintentos aquí
      }
    }

    // Si terminamos, limpiamos la cola
    await OfflineService.clearSyncQueue();
    console.log('Sincronización completada con éxito.');
  },

  // Escuchar cambios en la conexión
  initNetworkListener: () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        SyncService.runSync();
      }
    });
  }
};
