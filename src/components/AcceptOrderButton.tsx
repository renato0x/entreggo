import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert, View } from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    orderId: string;
    price: number;
    onSuccess?: () => void;
    onFailure?: () => void;
}

export const AcceptOrderButton = ({ orderId, price, onSuccess, onFailure }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const { acceptOffer } = useWebSocket();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            // Tenta aceitar via WebSocket (que deve chamar a API internamente ou emitir evento)
            // Nota: Se a implementação for via HTTP direto, substituiríamos por orderService.acceptOrder
            // Aqui assumindo que o hook useWebSocket gerencia a chamada ou expõe a função

            await acceptOffer(orderId);

            // Sucesso (O socket deve confirmar, mas para UX imediata assumimos sucesso se não houver erro de rede)
            // Idealmente, aguardaríamos o evento 'order-accepted' de volta

            if (onSuccess) onSuccess();

            // Navegar para tela de entrega ativa
            // navigation.navigate('ActiveDelivery', { orderId }); 

        } catch (error: any) {
            console.error('Erro ao aceitar:', error);

            let message = 'Não foi possível aceitar o pedido.';

            if (error.response?.status === 409) {
                message = 'Este pedido já foi aceito por outro entregador.';
            } else if (error.response?.status === 403) {
                message = 'Você não está habilitado para este pedido.';
            }

            Alert.alert('Atenção', message);
            if (onFailure) onFailure();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, isLoading && styles.disabled]}
                onPress={handleAccept}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        <Text style={styles.text}>ACEITAR CORRIDA</Text>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceText}>R$ {price.toFixed(2)}</Text>
                        </View>
                    </>
                )}
            </TouchableOpacity>
            <Text style={styles.timerText}>Toque para aceitar em 30s</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#22C55E', // Green-500
        width: '100%',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    disabled: {
        backgroundColor: '#86EFAC', // Green-300
        opacity: 0.8,
    },
    text: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    priceTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    timerText: {
        marginTop: 8,
        color: '#64748B',
        fontSize: 12,
    },
});
