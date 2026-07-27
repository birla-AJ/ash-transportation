import { createTheme } from '@mui/material/styles';

// Deep steel-blue + warm amber palette, evoking heavy transport / freight
// operations rather than a generic SaaS blue.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B3A4B', // steel blue-black
      light: '#2E5266',
      dark: '#0F2530',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C97B2E', // amber / rust — ash & road-dust accent
      light: '#E0954E',
      dark: '#9A5D1F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F5F3',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2427',
      secondary: '#5B6B72',
    },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    warning: { main: '#C97B2E' },
    divider: '#E1E5E4',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' },
      },
    },
  },
});

export default theme;
