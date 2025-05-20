import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/format';
import { Clock, DollarSign, TrendingUp, Users, Target } from 'lucide-react';

interface RoiInputs {
  marketingCosts: number;
  salesCosts: number;
  newCustomers: number;
  averageMonthlyValue: number;
  churnRate: number;
  averageCustomerLifetime: number;
}

const RoiCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<RoiInputs>({
    marketingCosts: 10000,
    salesCosts: 5000,
    newCustomers: 20,
    averageMonthlyValue: 200,
    churnRate: 5,
    averageCustomerLifetime: 24
  });

  const [results, setResults] = useState({
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    paybackPeriod: 0,
    monthlyRevenue: 0,
    projectedRevenue: 0
  });

  const calculateMetrics = () => {
    const cac = (inputs.marketingCosts + inputs.salesCosts) / inputs.newCustomers;
    const monthlyRevenue = inputs.averageMonthlyValue * inputs.newCustomers;
    const averageLifetimeMonths = inputs.averageCustomerLifetime;
    const ltv = (inputs.averageMonthlyValue * averageLifetimeMonths);
    const ltvCacRatio = ltv / cac;
    const paybackPeriod = cac / inputs.averageMonthlyValue;
    const projectedRevenue = ltv * inputs.newCustomers;

    setResults({
      cac,
      ltv,
      ltvCacRatio,
      paybackPeriod,
      monthlyRevenue,
      projectedRevenue
    });
  };

  useEffect(() => {
    calculateMetrics();
  }, [inputs]);

  const handleInputChange = (field: keyof RoiInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({
      ...prev,
      [field]: numValue
    }));
  };

  const getLtvRatioColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-600 dark:text-green-400';
    if (ratio >= 1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Calculadora de ROI
        </h2>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Tempo Médio do Cliente: {inputs.averageCustomerLifetime} meses
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custos de Marketing
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={inputs.marketingCosts}
                  onChange={(e) => handleInputChange('marketingCosts', e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custos de Vendas
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={inputs.salesCosts}
                  onChange={(e) => handleInputChange('salesCosts', e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Novos Clientes
              </label>
              <input
                type="number"
                value={inputs.newCustomers}
                onChange={(e) => handleInputChange('newCustomers', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor Médio Mensal
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={inputs.averageMonthlyValue}
                  onChange={(e) => handleInputChange('averageMonthlyValue', e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Taxa de Churn (%)
              </label>
              <input
                type="number"
                value={inputs.churnRate}
                onChange={(e) => handleInputChange('churnRate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tempo Médio do Cliente (meses)
              </label>
              <input
                type="number"
                value={inputs.averageCustomerLifetime}
                onChange={(e) => handleInputChange('averageCustomerLifetime', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">CAC</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(results.cac)}
              </p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Custo de Aquisição por Cliente
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">LTV</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(results.ltv)}
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Valor do Tempo de Vida
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">LTV/CAC</span>
              </div>
              <p className={`mt-2 text-2xl font-bold ${getLtvRatioColor(results.ltvCacRatio)}`}>
                {results.ltvCacRatio.toFixed(2)}x
              </p>
              <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                Razão LTV/CAC
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Payback</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {results.paybackPeriod.toFixed(1)} meses
              </p>
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                Período de Recuperação
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Projeção de Receita
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mensal</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(results.monthlyRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total ({inputs.averageCustomerLifetime} meses)
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(results.projectedRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoiCalculator; 