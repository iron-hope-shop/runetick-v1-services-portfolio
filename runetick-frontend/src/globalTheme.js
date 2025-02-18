import { createTheme } from '@mui/material/styles';

const globalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#b43634' },
    secondary: { main: '#dfb19f' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  customGradients: {
    main: 'linear-gradient(45deg, #b43634 30%, #dfb19f 90%)',
    hover: 'linear-gradient(45deg, #b43634 30%, #dfb19f 90%)',
  },
});

export { globalTheme };
