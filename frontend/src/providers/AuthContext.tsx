'use client'

// Importe as bibliotecas necessárias

import { createContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { jwtDecode } from 'jwt-decode';
import { decodedTokenProps } from '@/src/middleware';
import { login } from '@/src/http/generated/login/login';
// import { toast } from 'sonner';

// Defina as interfaces necessárias

interface SignInData {
  email: string;
  senha: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
  user: {
    usuario: {
      id: string;
      nome: string;
      email: string;
      funcao: string;
    }
  } | undefined
}

interface AuthProviderProps {
  children: ReactNode; // Aqui você usa ReactNode para tipar o children
}

// Crie o contexto
export const AuthContext = createContext({} as AuthContextType);

// Crie o provedor de autenticação
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthContextType['user']>();

  const { 'nextauth.token': token } = parseCookies();
  const isAuthenticated = !!token

  useEffect(() => {
    // // Função assíncrona para recuperar as informações do usuário
    async function recoverUserInformation(): Promise<void> {
      if (!token) {
        return;
      }
      try {
        const { usuario }: decodedTokenProps = jwtDecode(token);

        const dados = { usuario };
        setUser(dados);

      } catch (error) {
        // Toast.fire({
        //   icon: 'error',
        //   title: `Erro ao decodificar o token`,
        //   text: error.message
        // })
        throw error;
      }
    }

    recoverUserInformation()
  }, [token]);

  // Função para realizar o logout
  const signOut = () => {
    destroyCookie(undefined, 'nextauth.token', { path: '/' });
    router.replace('/');
  };

  // Função para realizar o login
  const signIn = async (data: SignInData) => {
    try {
      // const { data: dataResponse } = await api.post('/auth', data);
      const response = await login({
        email: data.email,
        senha: data.senha,
      });

      // response agora é do tipo esperado (Login200)
      const { token } = response;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 8 * 60 * 60,
        path: '/'
      });

      const { usuario }: decodedTokenProps = jwtDecode(token);
      setUser({
        usuario
      });

      return router.replace(`/dashboard`);
    } catch (error) {
      throw error
    }
  };

  // Forneça o contexto
  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
