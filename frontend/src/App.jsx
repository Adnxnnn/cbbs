import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@fontsource/inter';
import Signupp from './components/Signupp'; // or your main component
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import HomePage from './components/Home';
import Home from './components/Home';
import Admin from './components/Admin';
import Payments from './components/Payments';


const theme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
   <Routes>
    <Route path="/s" element={<Signupp />} />
    <Route path="/" element={<Login />} />
    <Route path="/h" element={<Home />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/pay" element={<Payments />} />
    
    

   </Routes>
    </ThemeProvider>
  );
}

export default App;