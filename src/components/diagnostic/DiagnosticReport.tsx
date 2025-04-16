import React from 'react';

interface ReportArea {
  area: string;
  score: number;
  recommendations: string[];
}

interface Report {
  totalScore: number;
  areas: ReportArea[];
  overallRecommendation: string;
}

interface DiagnosticReportProps {
  report: Report;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Decoração */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#007BFF] to-[#007BFF] opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-[#007BFF] to-[#007BFF] opacity-10 rounded-full -ml-16 -mb-16"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Seu Diagnóstico de Marketing Digital
            </h1>
            <p className="text-gray-600">
              Análise detalhada do seu marketing digital com recomendações personalizadas
            </p>
          </div>

          {/* Pontuação Total */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className={`text-center p-6 rounded-full ${getScoreBackground(report.totalScore)}`}>
                <span className={`text-4xl font-bold ${getScoreColor(report.totalScore)}`}>
                  {report.totalScore}
                </span>
                <span className="text-gray-600 block text-sm mt-1">Pontuação Total</span>
              </div>
            </div>
          </div>

          {/* Áreas */}
          <div className="grid gap-6 mb-8">
            {report.areas.map((area) => (
              <div
                key={area.area}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-[#007BFF] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{area.area}</h3>
                  <span className={`text-lg font-bold ${getScoreColor(area.score)}`}>
                    {area.score}/100
                  </span>
                </div>
                <div className="space-y-2">
                  {area.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#007BFF] mt-1 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <p className="text-gray-600">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recomendação Geral */}
          <div className="bg-[#007BFF]/5 p-6 rounded-xl border border-[#007BFF]/20">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Recomendação Geral
            </h3>
            <p className="text-gray-600">{report.overallRecommendation}</p>
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-white border border-[#007BFF] text-[#007BFF] rounded-lg hover:bg-[#007BFF]/5 transition-colors duration-300"
            >
              Baixar Relatório
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors duration-300"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 