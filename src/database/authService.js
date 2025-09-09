import { supabase } from './supabaseClient';

export const authService = {
  // Função para registrar um novo usuário
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw new Error(error.message);

    return data;
  },

  // Função para fazer login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return data;
  },

  // Função para fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw new Error(error.message);
  },

  // Função para obter o usuário atualmente logado
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};