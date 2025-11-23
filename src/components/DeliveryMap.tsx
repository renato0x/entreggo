import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { DeliveryLocation } from '../types/delivery';
import { Location } from '../types/store';

interface Props {
    currentLocation: Location | null;
    pickupLocation: DeliveryLocation;
    deliveryLocation: DeliveryLocation;
    showRoute?: boolean;
}

export const DeliveryMap = ({
    currentLocation,
    pickupLocation,
    deliveryLocation,
    showRoute = true,
}: Props) => {
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        // Auto-zoom to show all markers
        if (mapRef.current && currentLocation) {
            const coordinates = [
                { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
                { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude },
            ];

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [currentLocation, pickupLocation, deliveryLocation]);

    const routeCoordinates = currentLocation
        ? [
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
            { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude },
        ]
        : [
            { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
            { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude },
        ];

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: pickupLocation.latitude,
                    longitude: pickupLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {/* Current Location Marker */}
                {currentLocation && (
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }}
                        title="Você"
                        pinColor="#007AFF"
                    />
                )}

                {/* Pickup Location Marker */}
                <Marker
                    coordinate={{
                        latitude: pickupLocation.latitude,
                        longitude: pickupLocation.longitude,
                    }}
                    title={pickupLocation.name || 'Retirada'}
                    description={pickupLocation.address}
                    pinColor="#22C55E"
                />

                {/* Delivery Location Marker */}
                <Marker
                    coordinate={{
                        latitude: deliveryLocation.latitude,
                        longitude: deliveryLocation.longitude,
                    }}
                    title="Entrega"
                    description={deliveryLocation.address}
                    pinColor="#EF4444"
                />

                {/* Route Polyline */}
                {showRoute && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#007AFF"
                        strokeWidth={4}
                    />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
