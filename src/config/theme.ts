// IBM Plex Sans must be loaded at app root via expo-font before these fontFamily values take effect.
// Fallback is 'System' (San Francisco on iOS, Roboto on Android).

export const theme = {
  colors: {
    // Backgrounds
    background: '#fcfcfc',
    blobMint: '#caf1ec',
    blobCream: '#fdf6e0',

    // Buttons
    buttonPrimary: '#c6a7f8',
    buttonPrimaryDisabled: '#ede4fd',
    buttonSecondary: '#f9f6fe',

    // Text
    textDark: '#1c1c1e',
    textDark2: '#141414',
    textDark3: '#262626',
    textSecondary: '#8c8c8c',
    textLabel: '#1e1e1e',
    textHeadingAccent: '#fbecbb',
    textWhite: '#ffffff',
    textNearWhite: '#fcfcfc',

    // Inputs
    inputBg: '#ffffff',
    inputBorder: '#ffffff',

    // Tags
    tagBg: '#f5f5f5',
    tagSelected: '#ede4fd',

    // Chat
    chatBubble: '#e5d7fc',

    // Banners
    safeSpaceBanner: '#e7e9f9',

    // Splash / accent
    splashLavender: '#d1b9f9',
    splashCoral: '#ff9a8d',
    splashTeal: '#54d1c1',
    logoFill: '#f9e29a',
  },

  fonts: {
    heading: 'IBMPlexSans-SemiBold',
    headingBold: 'IBMPlexSans-Bold',
    body: 'IBMPlexSans-Regular',
    bodyMedium: 'IBMPlexSans-Medium',
    input: 'Inter-Regular',
    fallback: 'System',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    screenPadding: 24,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 27,
    full: 9999,
  },

  typography: {
    display: {
      fontSize: 32,
      fontWeight: '600' as const,
      fontFamily: 'System',
      color: '#1c1c1e',
      lineHeight: 40,
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: '700' as const,
      fontFamily: 'System',
      color: '#1c1c1e',
      lineHeight: 36,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      fontFamily: 'System',
      color: '#1c1c1e',
      lineHeight: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '500' as const,
      fontFamily: 'System',
      color: '#1e1e1e',
      lineHeight: 24,
    },
    small: {
      fontSize: 13,
      fontWeight: '400' as const,
      fontFamily: 'System',
      color: '#8c8c8c',
      lineHeight: 18,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: '600' as const,
      fontFamily: 'System',
      color: '#1c1c1e',
    },
    inputText: {
      fontSize: 16,
      fontWeight: '400' as const,
      fontFamily: 'System',
      color: '#1c1c1e',
    },
  },

  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    button: {
      shadowColor: '#c6a7f8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.24,
      shadowRadius: 8,
      elevation: 3,
    },
  },
} as const;

export type Theme = typeof theme;
