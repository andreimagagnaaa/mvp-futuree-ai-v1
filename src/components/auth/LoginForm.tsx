import React, { useState } from 'react';
import { Formik, Form as FormikForm, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { getDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSignupClick,
  onForgotPasswordClick,
  onClose
}) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validação adicional de email
      if (!values.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      // Validação adicional de senha
      if (!values.password.trim()) {
        throw new Error('Senha é obrigatória');
      }

      console.log('LoginForm: Iniciando login');
      
      const result = await login(values.email.trim(), values.password);
      console.log('LoginForm: Login realizado com sucesso, uid:', result.user.uid);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      console.log('LoginForm: Documento do usuário encontrado:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('LoginForm: Dados do usuário:', userData);
        
        // Verificação mais rigorosa dos campos obrigatórios
        if (!userData.name?.trim() || !userData.companyName?.trim() || !userData.phone?.trim()) {
          console.log('LoginForm: Documento do usuário incompleto');
          await signOut(auth);
          setError('Dados de cadastro incompletos. Por favor, complete seu cadastro.');
          onSignupClick();
          return;
        }
        
        // Verificação de formato de telefone
        const phoneRegex = /^\+?\d{10,14}$/;
        if (!phoneRegex.test(userData.phone.replace(/\D/g, ''))) {
          console.log('LoginForm: Formato de telefone inválido');
          await signOut(auth);
          setError('Formato de telefone inválido. Por favor, atualize seu cadastro.');
          onSignupClick();
          return;
        }

        onClose();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (userData.hasCompletedDiagnostic) {
          console.log('LoginForm: Usuário já completou diagnóstico, indo para /report');
          navigate('/report', { replace: true });
        } else {
          console.log('LoginForm: Usuário não completou diagnóstico, indo para /diagnostic');
          navigate('/diagnostic', { replace: true });
        }
      } else {
        console.log('LoginForm: Usuário sem documento, redirecionando para cadastro');
        await signOut(auth);
        setError('Conta não encontrada. Por favor, faça o cadastro.');
        onSignupClick();
      }
    } catch (err: any) {
      console.error('LoginForm: Erro no login:', err);
      
      // Tratamento de erros mais detalhado
      if (err.code === 'auth/user-not-found') {
        setError('Email não cadastrado. Verifique o email ou crie uma nova conta.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta. Verifique sua senha ou use a opção "Esqueceu sua senha?"');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de email inválido. Use um email válido.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas incorretas. Por segurança, tente novamente mais tarde.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email('Email inválido')
            .required('Email é obrigatório'),
          password: Yup.string()
            .required('Senha é obrigatória')
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, status, handleSubmit: formikHandleSubmit }) => (
          <form 
            className="space-y-4 sm:space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              formikHandleSubmit(e);
            }}
          >
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Faça login para acessar sua conta
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                {errors.email && touched.email && (
                  <div className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Senha"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                {errors.password && touched.password && (
                  <div className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</div>
                )}
              </div>
            </div>

            {status && (
              <div className="text-red-500 text-xs sm:text-sm text-center">{status}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Entrar
                </>
              )}
            </button>

            <div className="text-center space-y-2 sm:space-y-3">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm flex items-center justify-center w-full"
              >
                <KeyIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Esqueceu sua senha?
              </button>
              <div className="text-xs sm:text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Cadastre-se
                </button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm; 