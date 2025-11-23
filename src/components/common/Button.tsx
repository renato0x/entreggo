import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
}: ButtonProps) => {
    const { theme } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return theme.colors.border;

        switch (variant) {
            case 'primary':
                return theme.colors.primary;
            case 'secondary':
                return theme.colors.surface;
            case 'outline':
                return 'transparent';
            case 'danger':
                return theme.colors.error;
            default:
                return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.textTertiary;

        switch (variant) {
            case 'primary':
            case 'danger':
                return '#FFFFFF';
            case 'secondary':
                return theme.colors.text;
            case 'outline':
                return theme.colors.primary;
            default:
                return '#FFFFFF';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm':
                return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md };
            case 'md':
                return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
            case 'lg':
                return { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl };
            default:
                return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm':
                return theme.typography.sizes.sm;
            case 'md':
                return theme.typography.sizes.md;
            case 'lg':
                return theme.typography.sizes.lg;
            default:
                return theme.typography.sizes.md;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderRadius: theme.borderRadius.md,
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
                    ...getPadding(),
                    width: fullWidth ? '100%' : 'auto',
                },
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: getTextColor(),
                            fontSize: getFontSize(),
                            fontWeight: theme.typography.weights.semibold,
                        },
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
});
