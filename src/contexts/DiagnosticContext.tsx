import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface DiagnosticContextType {
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [key: string]: string };
  setAnswers: (answers: { [key: string]: string }) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitDiagnostic: () => Promise<void>;
  diagnosticData: DiagnosticData | null;
  startDiagnostic: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface QuestionOption {
  id: string;
  text: string;
  score: number;
  tag?: string;
}

interface Question {
  id: string;
  area: string;
    text: string;
  options: QuestionOption[];
}

interface DiagnosticData {
  scores: { [key: string]: number };
  totalScore: number;
  businessType: string;
  recommendations: string[];
  insights: string[];
  previousScore?: number | null;
  history: { date: Date; totalScore: number; scores: { [key: string]: number } }[];
}

interface Answer {
  questionId: string;
  optionId: string;
}

const DiagnosticContext = createContext<DiagnosticContextType>({} as DiagnosticContextType);

export const useDiagnostic = () => useContext(DiagnosticContext);

const questions: Question[] = [
  {
    id: '1',
    area: 'Geração de Leads',
    text: 'Como você avalia sua estratégia atual de geração de leads?',
    options: [
      { id: '1a', text: 'Não possui estratégia definida', score: 3 },
      { id: '1b', text: 'Estratégia básica, sem automação', score: 5 },
      { id: '1c', text: 'Estratégia com automação básica', score: 7 },
      { id: '1d', text: 'Estratégia avançada com automação e segmentação', score: 10 }
    ]
  },
  {
    id: '2',
    area: 'Conversão',
    text: 'Qual é sua taxa média de conversão de leads em clientes?',
    options: [
      { id: '2a', text: 'Não possui métricas de conversão', score: 3 },
      { id: '2b', text: 'Métricas básicas de conversão', score: 5 },
      { id: '2c', text: 'Métricas e otimização regular', score: 7 },
      { id: '2d', text: 'Otimização avançada de conversão', score: 10 }
    ]
  },
  {
    id: '3',
    area: 'Canais de Aquisição',
    text: 'Como você utiliza diferentes canais de aquisição?',
    options: [
      { id: '3a', text: 'Não utiliza canais de aquisição', score: 3 },
      { id: '3b', text: 'Utilização básica de 1-2 canais', score: 5 },
      { id: '3c', text: 'Múltiplos canais com integração', score: 7 },
      { id: '3d', text: 'Estratégia omnichannel avançada', score: 10 }
    ]
  },
  {
    id: '4',
    area: 'Conteúdo',
    text: 'Como você avalia sua estratégia de conteúdo?',
    options: [
      { id: '4a', text: 'Não possui estratégia de conteúdo', score: 3 },
      { id: '4b', text: 'Conteúdo básico sem planejamento', score: 5 },
      { id: '4c', text: 'Conteúdo planejado e segmentado', score: 7 },
      { id: '4d', text: 'Conteúdo personalizado e otimizado', score: 10 }
    ]
  },
  {
    id: '5',
    area: 'CRM e Relacionamento',
    text: 'Como você gerencia o relacionamento com leads e clientes?',
    options: [
      { id: '5a', text: 'Não possui sistema de CRM', score: 3 },
      { id: '5b', text: 'CRM básico sem automação', score: 5 },
      { id: '5c', text: 'CRM com automação básica', score: 7 },
      { id: '5d', text: 'CRM avançado com automação e IA', score: 10 }
    ]
  },
  {
    id: '6',
    area: 'Análise de Dados',
    text: 'Como você utiliza dados e análises para tomada de decisão?',
    options: [
      { id: '6a', text: 'Não utiliza dados estruturados', score: 3 },
      { id: '6b', text: 'Análises básicas e manuais', score: 5 },
      { id: '6c', text: 'Dashboard com métricas essenciais', score: 7 },
      { id: '6d', text: 'Análise avançada com predição', score: 10 }
    ]
  },
  {
    id: '7',
    area: 'Presença Digital',
    text: 'Como você avalia sua presença digital?',
    options: [
      { id: '7a', text: 'Presença digital mínima', score: 3 },
      { id: '7b', text: 'Presença básica em redes sociais', score: 5 },
      { id: '7c', text: 'Presença consolidada com estratégia', score: 7 },
      { id: '7d', text: 'Presença digital avançada e integrada', score: 10 }
    ]
  },
  {
    id: '8',
    area: 'Automações',
    text: 'Como você utiliza automação em seus processos?',
    options: [
      { id: '8a', text: 'Processos totalmente manuais', score: 3 },
      { id: '8b', text: 'Automações básicas pontuais', score: 5 },
      { id: '8c', text: 'Automação em processos principais', score: 7 },
      { id: '8d', text: 'Automação avançada integrada', score: 10 }
    ]
  },
  {
    id: '9',
    area: 'Perfil do Cliente',
    text: 'Qual é o seu cliente?',
    options: [
      { id: '9a', text: 'B2C - Consumidor Final', score: 0, tag: 'B2C' },
      { id: '9b', text: 'B2B - Para Empresas', score: 0, tag: 'B2B' }
    ]
  }
] as Question[];

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Atualiza a questão atual quando o índice muda
  useEffect(() => {
    if (!isInitialized) return;
    console.log('Atualizando questão atual:', currentQuestionIndex);
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, isInitialized]);

  const startDiagnostic = async () => {
    try {
      setIsLoading(true);
    setCurrentQuestionIndex(0);
      setAnswers({});
    setSelectedOption(null);
      setCurrentQuestion(questions[0]);
      setIsInitialized(true);
      console.log('Diagnóstico iniciado');
    } catch (error) {
      console.error('Erro ao iniciar diagnóstico:', error);
      setError('Erro ao iniciar diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async (questionId: string, optionId: string) => {
    try {
      console.log('Respondendo questão:', { questionId, optionId, currentQuestionIndex });
      
      // Salvar resposta
      const newAnswers = { ...answers, [questionId]: optionId };
      setAnswers(newAnswers);
      setSelectedOption(optionId);

      // Se for a última pergunta, gerar relatório
      if (currentQuestionIndex >= questions.length - 1) {
        console.log('Última questão - Gerando relatório');
        const report = generateReport(newAnswers);
        setCurrentReport(report);
        
        // Atualizar status no Firestore
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            hasCompletedDiagnostic: true,
            diagnostic: {
              completedAt: new Date(),
              answers: newAnswers,
              report
            }
          });
        }
      } else {
        // Avançar para próxima pergunta
        console.log('Avançando para próxima questão');
        setCurrentQuestionIndex(currentIndex => {
          console.log('Novo índice:', currentIndex + 1);
          return currentIndex + 1;
        });
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
      setError('Erro ao salvar resposta');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const previousIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(previousIndex);
      const previousQuestionId = String(previousIndex + 1);
      setSelectedOption(answers[previousQuestionId] || null);
    }
  };

  const generateReport = (answers: { [key: string]: string }): DiagnosticData => {
    const areas = [
      'Geração de Leads',
      'Conversão',
      'Canais de Aquisição',
      'Conteúdo',
      'CRM e Relacionamento',
      'Análise de Dados',
      'Presença Digital',
      'Automações'
    ];

    const scores: { [key: string]: number } = {};

    // Processa as respostas e mantém os scores originais (3, 5, 7, 10)
    Object.entries(answers).forEach(([questionId, optionId]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      // Ignora a pergunta de perfil do cliente na pontuação
      if (question.area === 'Perfil do Cliente') return;

      const option = question.options.find(o => o.id === optionId);
      if (!option) return;

      scores[question.area] = option.score;
    });

    // Calcula o score total
    let totalScore = 0;

    // Soma os scores de todas as áreas
    // Se uma área não foi respondida, considera score 0
    areas.forEach(area => {
      const areaScore = scores[area] || 0;
      totalScore += areaScore;
      console.log(`Área: ${area}, Score: ${areaScore}, Total acumulado: ${totalScore}`);
    });

    // Garante que o score total não ultrapasse 80 (8 áreas × 10 pontos)
    totalScore = Math.min(totalScore, 80);

    // Determina o tipo de negócio baseado nas respostas
    const businessType = determineBusinessType(answers);

    // Gera recomendações e insights
    const recommendations = generateRecommendations(scores, businessType);
    const insights = generateInsights(scores, businessType);

    return {
      scores,
      totalScore,
      businessType,
      recommendations,
      insights,
      history: []
    };
  };

  const determineBusinessType = (answers: { [key: string]: string }): string => {
    // Encontra a resposta para a pergunta de perfil do cliente
    const perfilQuestion = questions.find(q => q.area === 'Perfil do Cliente');
    if (!perfilQuestion) return 'B2B'; // Valor padrão

    const answer = answers[perfilQuestion.id];
    if (!answer) return 'B2B'; // Valor padrão

    const option = perfilQuestion.options.find(o => o.id === answer);
    return option?.tag || 'B2B'; // Retorna a tag da opção ou B2B como padrão
  };

  const generateRecommendations = (scores: { [key: string]: number }, businessType: string): string[] => {
    const recommendations: string[] = [];
    
    // Adicionar recomendação específica baseada no tipo de negócio
    if (businessType === 'B2C') {
      recommendations.push('Foque em estratégias de marketing digital voltadas para o consumidor final');
    } else if (businessType === 'B2B') {
      recommendations.push('Desenvolva estratégias de marketing focadas em relacionamento empresarial');
    }

    Object.entries(scores).forEach(([area, score]) => {
      if (score < 50) {
        switch (area) {
          case 'Estratégia e Visão':
            recommendations.push('Desenvolva uma estratégia clara de IA alinhada aos objetivos do negócio');
            break;
          case 'Dados e Infraestrutura':
            recommendations.push('Invista na organização e estruturação dos dados da empresa');
            break;
          case 'Processos':
            recommendations.push('Implemente automação gradual dos processos principais');
            break;
          case 'Pessoas e Cultura':
            recommendations.push('Invista em treinamento e capacitação em IA para a equipe');
            break;
          case 'Tecnologia':
            recommendations.push('Modernize a infraestrutura tecnológica gradualmente');
            break;
          case 'Governança e Ética':
            recommendations.push('Estabeleça políticas claras de governança e ética em IA');
            break;
          case 'Inovação':
            recommendations.push('Crie um programa estruturado de inovação em IA');
            break;
          case 'Resultados e Métricas':
            recommendations.push('Implemente um sistema de métricas para avaliar o impacto da IA');
            break;
        }
      }
    });

    return recommendations;
  };

  const generateInsights = (scores: { [key: string]: number }, businessType: string): string[] => {
    const insights: string[] = [];
    
    // Adicionar insight específico para o tipo de negócio
    if (businessType === 'B2C') {
      insights.push('Seu foco em B2C requer estratégias direcionadas ao consumidor final');
    } else if (businessType === 'B2B') {
      insights.push('Seu foco em B2B demanda estratégias específicas para o mercado empresarial');
    }

    // Identificar áreas mais fortes
    const strongAreas = Object.entries(scores)
      .filter(([_, score]) => score >= 75)
      .map(([area]) => area);

    if (strongAreas.length > 0) {
      insights.push(`Pontos fortes identificados em: ${strongAreas.join(', ')}`);
    }

    // Identificar áreas que precisam de atenção
    const weakAreas = Object.entries(scores)
      .filter(([_, score]) => score < 50)
      .map(([area]) => area);

    if (weakAreas.length > 0) {
      insights.push(`Áreas que precisam de atenção: ${weakAreas.join(', ')}`);
    }

    // Insight geral baseado na média
    const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    if (averageScore >= 75) {
      insights.push('Sua empresa está bem posicionada para implementar IA');
    } else if (averageScore >= 50) {
      insights.push('Sua empresa tem bom potencial, mas precisa de alguns ajustes');
    } else {
      insights.push('Recomendamos começar com projetos piloto de IA em áreas específicas');
    }

    return insights;
  };

  const submitDiagnostic = async () => {
    try {
      setIsLoading(true);
      
      // Gera o relatório com as respostas atuais
      const report = generateReport(answers);
      
      // Remove o campo previousScore do relatório antes de salvar
      const { previousScore, ...reportWithoutPrevious } = report;
      
      setCurrentReport(report);
      
      // Atualiza no Firestore
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // Busca o diagnóstico anterior e histórico
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const previousScore = userData?.diagnostic?.totalScore || null;
        const previousHistory = userData?.diagnostic?.history || [];
        
        // Prepara o novo registro histórico
        const newHistoryEntry = {
          date: new Date(),
          totalScore: reportWithoutPrevious.totalScore,
          scores: reportWithoutPrevious.scores
        };
        
        // Prepara os dados para salvar
      const diagnosticData = {
          completedAt: new Date(),
          answers,
          scores: reportWithoutPrevious.scores,
          totalScore: reportWithoutPrevious.totalScore,
          recommendations: reportWithoutPrevious.recommendations,
          insights: reportWithoutPrevious.insights,
          previousScore,
          businessType: reportWithoutPrevious.businessType,
          history: [...previousHistory, newHistoryEntry]
        };

        await updateDoc(userRef, {
          hasCompletedDiagnostic: true,
          diagnostic: diagnosticData
        });
      }
    } catch (error) {
      console.error('Erro ao submeter diagnóstico:', error);
      setError('Erro ao salvar diagnóstico');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DiagnosticContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        answers,
        setAnswers,
        nextQuestion: () => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentIndex => currentIndex + 1);
          }
        },
        previousQuestion: () => {
          if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentIndex => currentIndex - 1);
          }
        },
        submitDiagnostic,
        diagnosticData: currentReport,
        startDiagnostic,
        isLoading,
        error
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
};