import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../database/supabaseClient';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (!session) {
        navigate('/login', { replace: true });
      }
    }

    checkSession();
  }, [navigate]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;