import AsyncStorage from '@react-native-async-storage/async-storage';
import { Serenata } from '@shared/index';

const STORAGE_KEY = '@serenatas_local';
const SYNC_QUEUE_KEY = '@sync_queue';

export const OfflineService = {
  // Guardar serenatas para verlas offline
  saveSerenatas: async (serenatas: Serenata[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serenatas));
    } catch (e) {
      console.error('Error guardando localmente', e);
    }
  },

  // Obtener serenatas guardadas en el cel
  getLocalSerenatas: async (): Promise<Serenata[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Añadir una nueva serenata a la cola de sincronización (creada offline)
  addToSyncQueue: async (serenata: Partial<Serenata>) => {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const currentQueue = queue ? JSON.parse(queue) : [];
      
      const newQueue = [...currentQueue, { 
        data: serenata, 
        timestamp: new Date().toISOString() 
      }];
      
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (e) {
      console.error('Error en cola de sincro', e);
    }
  },

  getSyncQueue: async () => {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  },

  clearSyncQueue: async () => {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }
};
