import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onLoginClick: () => void;
  onClose: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onLoginClick, onClose }) => {
  const { signUp, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log('SignupForm: Iniciando cadastro');
      
      // Criar usuário
      const result = await signUp(
        values.email,
        values.password,
        values.name,
        values.companyName,
        values.phone
      );
      
      console.log('SignupForm: Cadastro realizado com sucesso, uid:', result.user.uid);
      
      // Fechar o modal antes de navegar
      onClose();
      
      // Aguardar um momento para o modal fechar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('SignupForm: Redirecionando para /diagnostic');
      navigate('/diagnostic', { replace: true });
    } catch (error: any) {
      console.error('SignupForm: Erro no cadastro:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <Formik
        initialValues={{
          email: '',
          password: '',
          name: '',
          companyName: '',
          phone: '',
          acceptTerms: false
        }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email('Email inválido')
            .required('Email é obrigatório'),
          password: Yup.string()
            .min(6, 'A senha deve ter pelo menos 6 caracteres')
            .required('Senha é obrigatória'),
          name: Yup.string()
            .required('Nome é obrigatório'),
          companyName: Yup.string()
            .required('Nome da empresa é obrigatório'),
          phone: Yup.string()
            .required('Telefone é obrigatório')
            .matches(/^[0-9]{10,11}$/, 'Telefone inválido'),
          acceptTerms: Yup.boolean()
            .oneOf([true], 'Você precisa aceitar os termos para continuar')
            .required('Você precisa aceitar os termos para continuar')
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, status }) => (
          <Form className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Criar Conta
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Preencha os dados para começar a usar a plataforma
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Field
                  name="name"
                  type="text"
                  placeholder="Nome completo"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                {errors.name && touched.name && (
                  <div className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Field
                  name="companyName"
                  type="text"
                  placeholder="Nome da empresa"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                {errors.companyName && touched.companyName && (
                  <div className="text-red-500 text-xs sm:text-sm mt-1">{errors.companyName}</div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Field
                  name="phone"
                  type="text"
                  placeholder="Telefone"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                {errors.phone && touched.phone && (
                  <div className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</div>
                )}
              </div>

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

              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Field
                      type="checkbox"
                      name="acceptTerms"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                      Eu concordo com os{' '}
                      <a href="/termos" target="_blank" className="text-blue-600 hover:text-blue-700">
                        Termos de Uso
                      </a>{' '}
                      e{' '}
                      <a href="/privacidade" target="_blank" className="text-blue-600 hover:text-blue-700">
                        Política de Privacidade
                      </a>
                    </label>
                    {errors.acceptTerms && touched.acceptTerms && (
                      <div className="text-red-500 text-xs mt-1">{errors.acceptTerms}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {status && (
              <div className="text-red-500 text-sm text-center">{status}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Faça login
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupForm; 