import { Route, Routes } from 'react-router-dom';


import Dashboard from './components/pages/private/Dashboard';
import LandingPage from "./components/pages/public/LandingPage";
import Login from './components/pages/public/Login';
import Register from './components/pages/public/Register';
import CadastroEvento from './components/eventos/CadastroEvento';
import AddItem from './components/eventos/AddItem';
import Perfil from './components/pages/private/Perfil';
import ProtectedRoute from './components/ProtectedRoute';
import EventCode from './components/pages/private/EventCode';
import Recarga from './components/pages/private/Recarga';
import Venda from './components/pages/private/Venda';
import Convidado from './components/pages/private/Convidado';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/cadastro" element={<Register />}/>
      <Route path="/convidado/:idOrg" element={<Convidado />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastroEvento" element={<CadastroEvento />} />
        <Route path="/add-itens/:idEvento" element={<AddItem />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/ficha-evento" element={<EventCode />} />
        <Route path="/recarga" element={<Recarga />} />
        <Route path="/venda" element={<Venda />} />
      </Route>

      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  );
}

export default App;
