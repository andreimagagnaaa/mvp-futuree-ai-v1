import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { auth, db } from "../config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

interface UserData {
  email: string;
  name: string;
  companyName: string;
  phone: string;
  createdAt: any;
  hasCompletedDiagnostic: boolean;
  diagnostic: any;
  lastLogin?: any;
  updatedAt?: any;
  role?: string;
  bio?: string;
}

interface AuthContextType {
  currentUser: any;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string, companyName: string, phone: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserData: (newData: Partial<UserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  error: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Função para validar dados do usuário
  const validateUserData = (data: any): data is UserData => {
    if (!data) return false;
    
    // Validação básica dos campos obrigatórios
    if (!data.email || !data.name || !data.companyName || !data.phone) {
      return false;
    }

    // Se o usuário completou o diagnóstico, valida os dados do diagnóstico
    if (data.hasCompletedDiagnostic && data.diagnostic) {
      // Garante que o totalScore existe e é um número
      if (typeof data.diagnostic.totalScore !== 'number') {
        return false;
      }
      
      // Garante que os scores existem e são números
      if (!data.diagnostic.scores || typeof data.diagnostic.scores !== 'object') {
        return false;
      }
    }

    return true;
  };

  // Função para verificar e redirecionar o usuário
  const checkAndRedirectUser = async (userId: string) => {
    if (isRedirecting) return;
    
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

        if (!validateUserData(data)) {
          console.log('AuthContext: Dados do usuário inválidos');
          await signOut(auth);
          setUserData(null);
          setCurrentUser(null);
          navigate('/', { replace: true });
          return;
        }

        // Atualizar lastLogin
        await setDoc(userRef, {
          ...data,
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        setUserData(data as UserData);
        
        if (data.hasCompletedDiagnostic && data.diagnostic?.completedAt && location.pathname !== '/report') {
          console.log('AuthContext: Redirecionando para /report');
          navigate('/report', { replace: true });
        } else if (!data.hasCompletedDiagnostic && location.pathname !== '/diagnostic') {
          console.log('AuthContext: Redirecionando para /diagnostic');
          navigate('/diagnostic', { replace: true });
        }
      } else {
        console.log('AuthContext: Usuário sem documento');
        await signOut(auth);
        setUserData(null);
        setCurrentUser(null);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('AuthContext: Erro ao verificar usuário:', error);
      setUserData(null);
      await signOut(auth);
      navigate('/', { replace: true });
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
      
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (validateUserData(data)) {
            console.log('AuthContext: Dados do usuário carregados e validados');
            setUserData(data as UserData);
          } else {
            console.error('AuthContext: Dados do usuário inválidos');
            await signOut(auth);
            setUserData(null);
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('AuthContext: Erro ao carregar dados do usuário:', error);
        await signOut(auth);
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
      
      // Validações adicionais
      if (!email.trim() || !password || !name.trim() || !companyName.trim() || !phone.trim()) {
        throw new Error('Todos os campos são obrigatórios');
      }

      const phoneRegex = /^\+?\d{10,14}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        throw new Error('Formato de telefone inválido');
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: UserData = {
        email: email.trim(),
        name: name.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
        hasCompletedDiagnostic: false,
        diagnostic: null
      };

      await setDoc(doc(db, "users", result.user.uid), userData);

      console.log('AuthContext: Cadastro bem-sucedido, verificando redirecionamento');
      await checkAndRedirectUser(result.user.uid);
      return result;
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado. Por favor, use outro email ou faça login.');
      } else {
        setError(error.message || 'Ocorreu um erro durante o cadastro. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando login');
      
      // Validações adicionais
      if (!email.trim() || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('AuthContext: Login bem-sucedido, verificando redirecionamento');
      
      await checkAndRedirectUser(result.user.uid);
      return result;
      
    } catch (error: any) {
      console.error("Erro no login:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Muitas tentativas de login. Por favor, tente novamente mais tarde.');
      } else {
        setError(error.message || 'Ocorreu um erro durante o login. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Iniciando logout');
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setError("");
      navigate('/', { replace: true });
      console.log('AuthContext: Logout bem-sucedido');
    } catch (error: any) {
      console.error("Erro no logout:", error);
      setError('Ocorreu um erro ao fazer logout. Por favor, tente novamente.');
      throw error;
    }
  };

  const updateUserData = async (newData: Partial<UserData>) => {
    try {
      if (!currentUser?.uid) {
        throw new Error('Usuário não autenticado');
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        ...newData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updatedData);
      
      // Atualiza o estado local
      setUserData(prev => prev ? { ...prev, ...updatedData } : null);
      
      console.log('AuthContext: Dados do usuário atualizados com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar dados do usuário:', error);
      setError('Erro ao atualizar dados. Por favor, tente novamente.');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!email.trim()) {
        throw new Error('Email é obrigatório');
      }
      
      await sendPasswordResetEmail(auth, email.trim());
      console.log('AuthContext: Email de redefinição de senha enviado');
    } catch (error: any) {
      console.error('Erro ao enviar email de redefinição:', error);
      if (error.code === 'auth/user-not-found') {
        setError('Não existe conta com este email.');
      } else {
        setError('Erro ao enviar email de redefinição. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const updateUserEmail = async (newEmail: string) => {
    try {
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      if (!newEmail.trim()) {
        throw new Error('Novo email é obrigatório');
      }

      await updateEmail(currentUser, newEmail.trim());
      await updateUserData({ email: newEmail.trim() });
      console.log('AuthContext: Email atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      if (error.code === 'auth/requires-recent-login') {
        setError('Por favor, faça login novamente para alterar seu email.');
      } else {
        setError('Erro ao atualizar email. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('Nova senha deve ter pelo menos 6 caracteres');
      }

      await updatePassword(currentUser, newPassword);
      console.log('AuthContext: Senha atualizada com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      if (error.code === 'auth/requires-recent-login') {
        setError('Por favor, faça login novamente para alterar sua senha.');
      } else {
        setError('Erro ao atualizar senha. Por favor, tente novamente.');
      }
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    login,
    signUp,
    logout,
    updateUserData,
    resetPassword,
    updateEmail: updateUserEmail,
    updatePassword: updateUserPassword,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
