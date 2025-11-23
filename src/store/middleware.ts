import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple AsyncStorage adapter for future use
export const asyncStorageAdapter = {
    getItem: async (name: string): Promise<string | null> => {
        return await AsyncStorage.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await AsyncStorage.removeItem(name);
    },
};

// Simple logger for development
export const logStateChange = (storeName: string, prevState: any, nextState: any) => {
    if (__DEV__) {
        console.group(`🔄 ${storeName} State Update`);
        console.log('Previous:', prevState);
        console.log('Next:', nextState);
        console.groupEnd();
    }
};
