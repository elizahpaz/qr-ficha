import { Route, Routes } from 'react-router-dom';


import Dashboard from './components/pages/private/Dashboard';
import LandingPage from "./components/pages/public/LandingPage";
import Login from './components/pages/public/Login';
import Register from './components/pages/public/Register';
import CadastroEvento from './components/eventos/CadastroEvento';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/cadastro" element={<Register />}/>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastroEvento" element={<CadastroEvento />} />
      </Route>

      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  );
}

export default App;
