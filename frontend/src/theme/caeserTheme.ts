import { createTheme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    ceaser: {
      loyal: string;
      intelligent: string;
      creative: string;
      fast: string;
      accent: string;
    };
    surface: {
      main: string;
      dark: string;
      light: string;
    };
    gradient: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }

  interface PaletteOptions {
    ceaser?: {
      loyal: string;
      intelligent: string;
      creative: string;
      fast: string;
      accent: string;
    };
    surface?: {
      main: string;
      dark: string;
      light: string;
    };
    gradient?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }
}

// CeaserTheAdGenius Brand Colors - inspired by loyalty, intelligence, and creativity
const caeserBrandColors = {
  primary: {
    main: "#1976d2", // Loyal Blue - like a trustworthy Border Collie
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#ff9800", // Golden Retriever Orange - creative energy
    light: "#ffb74d",
    dark: "#f57c00",
    contrastText: "#000000",
  },
  ceaser: {
    loyal: "#1976d2", // Deep Blue - Border Collie intelligence
    intelligent: "#2e7d32", // Forest Green - wise and dependable
    creative: "#ff9800", // Golden Orange - creative spark
    fast: "#e91e63", // Greyhound Pink - speed and agility
    accent: "#9c27b0", // Purple - premium and sophisticated
  },
  success: {
    main: "#4caf50", // Good Dog Green
    light: "#81c784",
    dark: "#388e3c",
  },
  warning: {
    main: "#ff9800", // Alert Bark Orange
    light: "#ffb74d",
    dark: "#f57c00",
  },
  error: {
    main: "#f44336", // Bad Dog Red
    light: "#e57373",
    dark: "#d32f2f",
  },
  info: {
    main: "#2196f3", // Information Blue
    light: "#64b5f6",
    dark: "#1976d2",
  },
  gradient: {
    primary: "linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)",
    secondary: "linear-gradient(135deg, #ff9800 0%, #e91e63 100%)",
    accent: "linear-gradient(135deg, #9c27b0 0%, #1976d2 100%)",
  },
};

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    ...caeserBrandColors,
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    surface: {
      main: "#f5f5f5",
      dark: "#eeeeee",
      light: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.08)",
    "0px 8px 16px rgba(0, 0, 0, 0.1)",
    "0px 12px 24px rgba(0, 0, 0, 0.12)",
    "0px 16px 32px rgba(0, 0, 0, 0.14)",
    "0px 20px 40px rgba(0, 0, 0, 0.16)",
    "0px 24px 48px rgba(0, 0, 0, 0.18)",
    "0px 28px 56px rgba(0, 0, 0, 0.2)",
    "0px 32px 64px rgba(0, 0, 0, 0.22)",
    "0px 36px 72px rgba(0, 0, 0, 0.24)",
    "0px 40px 80px rgba(0, 0, 0, 0.26)",
    "0px 44px 88px rgba(0, 0, 0, 0.28)",
    "0px 48px 96px rgba(0, 0, 0, 0.3)",
    "0px 52px 104px rgba(0, 0, 0, 0.32)",
    "0px 56px 112px rgba(0, 0, 0, 0.34)",
    "0px 60px 120px rgba(0, 0, 0, 0.36)",
    "0px 64px 128px rgba(0, 0, 0, 0.38)",
    "0px 68px 136px rgba(0, 0, 0, 0.4)",
    "0px 72px 144px rgba(0, 0, 0, 0.42)",
    "0px 76px 152px rgba(0, 0, 0, 0.44)",
    "0px 80px 160px rgba(0, 0, 0, 0.46)",
    "0px 84px 168px rgba(0, 0, 0, 0.48)",
    "0px 88px 176px rgba(0, 0, 0, 0.5)",
    "0px 92px 184px rgba(0, 0, 0, 0.52)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
        containedPrimary: {
          background: caeserBrandColors.gradient.primary,
          "&:hover": {
            background: caeserBrandColors.gradient.primary,
            opacity: 0.9,
          },
        },
        containedSecondary: {
          background: caeserBrandColors.gradient.secondary,
          "&:hover": {
            background: caeserBrandColors.gradient.secondary,
            opacity: 0.9,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease-in-out",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          background: caeserBrandColors.gradient.primary,
          color: "#ffffff",
        },
        colorSecondary: {
          background: caeserBrandColors.gradient.secondary,
          color: "#ffffff",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#212121",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 8px",
          "&.Mui-selected": {
            background: caeserBrandColors.gradient.primary,
            color: "#ffffff",
            "& .MuiListItemIcon-root": {
              color: "#ffffff",
            },
            "&:hover": {
              background: caeserBrandColors.gradient.primary,
              opacity: 0.9,
            },
          },
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
          },
        },
      },
    },
  },
};

const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    mode: "dark",
    ...caeserBrandColors,
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    surface: {
      main: "#2a2a2a",
      dark: "#1e1e1e",
      light: "#3a3a3a",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  components: {
    ...lightThemeOptions.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e1e1e",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.4)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease-in-out",
          },
        },
      },
    },
  },
};

export const caeserLightTheme = createTheme(lightThemeOptions);
export const caeserDarkTheme = createTheme(darkThemeOptions);

// Dog-themed helper utilities
export const caeserUtils = {
  // Quick access to brand colors
  colors: caeserBrandColors,

  // Dog-themed animations
  animations: {
    wag: {
      animation: "wag 0.6s ease-in-out infinite alternate",
      "@keyframes wag": {
        "0%": { transform: "rotate(-10deg)" },
        "100%": { transform: "rotate(10deg)" },
      },
    },
    fetch: {
      animation: "fetch 1s ease-in-out",
      "@keyframes fetch": {
        "0%": { transform: "translateX(-100px)", opacity: 0 },
        "50%": { transform: "translateX(0)", opacity: 1 },
        "100%": { transform: "translateX(0)", opacity: 1 },
      },
    },
    bounce: {
      animation: "bounce 0.5s ease-in-out",
      "@keyframes bounce": {
        "0%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-10px)" },
        "100%": { transform: "translateY(0)" },
      },
    },
  },

  // Ceaser-themed gradients for special components
  gradients: {
    loyalCard: "linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)",
    creativeCard: "linear-gradient(135deg, #ff9800 0%, #e91e63 100%)",
    intelligentCard: "linear-gradient(135deg, #2e7d32 0%, #9c27b0 100%)",
    fastCard: "linear-gradient(135deg, #e91e63 0%, #1976d2 100%)",
  },
};
