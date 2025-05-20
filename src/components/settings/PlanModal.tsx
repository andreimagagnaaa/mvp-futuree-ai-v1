import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CreditCard, Check } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: 'Basic',
    price: 'R$ 99/mês',
    features: [
      'Análise básica de dados',
      'Até 3 projetos',
      'Suporte por email',
      'Atualizações mensais'
    ],
    current: false
  },
  {
    name: 'Premium',
    price: 'R$ 199/mês',
    features: [
      'Análise avançada de dados',
      'Projetos ilimitados',
      'Suporte prioritário 24/7',
      'Atualizações semanais',
      'Acesso a recursos beta'
    ],
    current: true
  },
  {
    name: 'Enterprise',
    price: 'R$ 499/mês',
    features: [
      'Análise personalizada',
      'Projetos ilimitados',
      'Suporte dedicado',
      'Atualizações em tempo real',
      'Recursos personalizados',
      'API exclusiva'
    ],
    current: false
  }
];

export const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 mb-4"
                >
                  <CreditCard className="w-5 h-5" />
                  Seu Plano
                </Dialog.Title>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`rounded-lg border ${
                        plan.current
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      } p-6 space-y-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold">{plan.name}</h4>
                          <p className="text-gray-600">{plan.price}</p>
                        </div>
                        {plan.current && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Atual
                          </span>
                        )}
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
                          plan.current
                            ? 'bg-blue-100 text-blue-700 cursor-default'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Plano Atual' : 'Escolher Plano'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 