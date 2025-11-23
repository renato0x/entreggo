import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
}

export const Input = ({
    label,
    error,
    icon,
    rightIcon,
    onRightIconPress,
    secureTextEntry,
    ...props
}: InputProps) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = secureTextEntry;
    const actualSecureTextEntry = isPassword && !isPasswordVisible;

    return (
        <View style={styles.container}>
            {label && (
                <Text
                    style={[
                        styles.label,
                        {
                            color: theme.colors.text,
                            fontSize: theme.typography.sizes.sm,
                            fontWeight: theme.typography.weights.medium,
                            marginBottom: theme.spacing.xs,
                        },
                    ]}
                >
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: error
                            ? theme.colors.error
                            : isFocused
                                ? theme.colors.primary
                                : theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 1,
                    },
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={theme.colors.textSecondary}
                        style={{ marginLeft: theme.spacing.md }}
                    />
                )}
                <TextInput
                    {...props}
                    secureTextEntry={actualSecureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[
                        styles.input,
                        {
                            color: theme.colors.text,
                            fontSize: theme.typography.sizes.md,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.md,
                        },
                    ]}
                    placeholderTextColor={theme.colors.textTertiary}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={{ marginRight: theme.spacing.md }}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
                {rightIcon && !isPassword && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={{ marginRight: theme.spacing.md }}
                    >
                        <Ionicons name={rightIcon} size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text
                    style={[
                        styles.error,
                        {
                            color: theme.colors.error,
                            fontSize: theme.typography.sizes.sm,
                            marginTop: theme.spacing.xs,
                        },
                    ]}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {},
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
    },
    error: {},
});
