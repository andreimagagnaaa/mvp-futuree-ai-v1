import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { auth, db } from "../config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  currentUser: any;
  userData: any;
  login: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string, companyName: string, phone: string) => Promise<any>;
  logout: () => Promise<void>;
  error: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Função para verificar e redirecionar o usuário
  const checkAndRedirectUser = async (userId: string) => {
    if (isRedirecting) return;
    
    // Não redirecionar se estiver na landing page
    if (location.pathname === '/') {
      setLoading(false);
      return;
    }
    
    try {
      setIsRedirecting(true);
      console.log('AuthContext: Verificando usuário:', userId);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('AuthContext: Dados do usuário:', data);
        setUserData(data);
        
        // Só redireciona se não estiver já na rota correta
        if (data.hasCompletedDiagnostic && data.diagnostic?.completedAt && location.pathname !== '/report') {
          console.log('AuthContext: Redirecionando para /report');
          navigate('/report', { replace: true });
        } else if (!data.hasCompletedDiagnostic && location.pathname !== '/diagnostic') {
          console.log('AuthContext: Redirecionando para /diagnostic');
          navigate('/diagnostic', { replace: true });
        }
      } else {
        console.log('AuthContext: Usuário sem documento');
        setUserData(null);
        if (location.pathname !== '/diagnostic' && location.pathname !== '/') {
          console.log('AuthContext: Redirecionando para /diagnostic');
          navigate('/diagnostic', { replace: true });
        }
      }
    } catch (error) {
      console.error('AuthContext: Erro ao verificar usuário:', error);
      setUserData(null);
    } finally {
      setIsRedirecting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Iniciando monitoramento de autenticação');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Estado de autenticação mudou:', user?.uid);
      
      if (!user) {
        console.log('AuthContext: Usuário não autenticado');
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      console.log('AuthContext: Usuário autenticado:', user.uid);
      setCurrentUser(user);
      
      // Carregar dados do usuário sem redirecionar
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('AuthContext: Dados do usuário carregados');
          setUserData(data);
        }
      } catch (error) {
        console.error('AuthContext: Erro ao carregar dados do usuário:', error);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthContext: Cleanup useEffect');
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, companyName: string, phone: string) => {
    try {
      console.log('AuthContext: Iniciando cadastro');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        name,
        companyName,
        phone,
        createdAt: serverTimestamp(),
        hasCompletedDiagnostic: false,
        diagnostic: null
      });

      console.log('AuthContext: Cadastro bem-sucedido, verificando redirecionamento');
      await checkAndRedirectUser(result.user.uid);
      return result;
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado. Por favor, use outro email ou faça login.');
      } else {
        setError('Ocorreu um erro durante o cadastro. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando login');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login bem-sucedido');
      return result;
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error("Erro ao sair:", error);
      setError(error.message);
    }
  };

  const value = {
    currentUser,
    userData,
    login,
    signUp,
    logout,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
