export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
};

export const lightTheme = {
    colors: {
        // Backgrounds
        background: '#FFFFFF',
        surface: '#F9FAFB',
        surfaceElevated: '#FFFFFF',

        // Primary - Orange
        primary: '#FF8C42',
        primaryLight: '#FFB574',
        primaryDark: '#E67A32',

        // Text
        text: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',

        // Borders
        border: '#E5E7EB',
        borderLight: '#F3F4F6',

        // Status
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Overlay
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Tab bar
        tabBarBackground: '#FFFFFF',
        tabBarBorder: '#E5E7EB',
        tabBarActive: '#FF8C42',
        tabBarInactive: '#9CA3AF',
    },
    spacing,
    typography,
    borderRadius,
    shadows,
};

export const darkTheme = {
    colors: {
        // Backgrounds - All Black
        background: '#000000',
        surface: '#0A0A0A',
        surfaceElevated: '#121212',

        // Primary - Orange
        primary: '#FF8C42',
        primaryLight: '#FFB574',
        primaryDark: '#E67A32',

        // Text - Subtle grays
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        textTertiary: '#666666',

        // Borders - Very subtle
        border: '#1A1A1A',
        borderLight: '#0F0F0F',

        // Status
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#FF8C42',

        // Overlay
        overlay: 'rgba(0, 0, 0, 0.85)',

        // Tab bar
        tabBarBackground: '#000000',
        tabBarBorder: '#1A1A1A',
        tabBarActive: '#FF8C42',
        tabBarInactive: '#666666',
    },
    spacing,
    typography,
    borderRadius,
    shadows,
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;
