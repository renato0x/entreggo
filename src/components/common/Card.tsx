import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
    children: ReactNode;
    style?: ViewStyle;
    elevated?: boolean;
}

export const Card = ({ children, style, elevated = false }: CardProps) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    ...(elevated ? theme.shadows.md : {}),
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {},
});
