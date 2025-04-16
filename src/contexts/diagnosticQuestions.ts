import { Question } from '../types/diagnostic';

export const questions: Question[] = [
  {
    id: 'q1',
    text: 'Como você avalia sua estratégia atual de geração de leads?',
    area: 'leadGeneration',
    options: [
      {
        id: 'q1_opt1',
        text: 'Não temos uma estratégia definida',
        score: 0
      },
      {
        id: 'q1_opt2',
        text: 'Temos algumas ações básicas, mas sem estrutura',
        score: 3
      },
      {
        id: 'q1_opt3',
        text: 'Temos uma estratégia estruturada mas com resultados inconsistentes',
        score: 6
      },
      {
        id: 'q1_opt4',
        text: 'Temos uma estratégia bem definida e com bons resultados',
        score: 10
      }
    ]
  },
  {
    id: 'q2',
    text: 'Como está sua taxa de conversão de leads em clientes?',
    area: 'conversion',
    options: [
      {
        id: 'q2_opt1',
        text: 'Não medimos nossa taxa de conversão',
        score: 0
      },
      {
        id: 'q2_opt2',
        text: 'Abaixo de 1%',
        score: 3
      },
      {
        id: 'q2_opt3',
        text: 'Entre 1% e 3%',
        score: 6
      },
      {
        id: 'q2_opt4',
        text: 'Acima de 3%',
        score: 10
      }
    ]
  },
  {
    id: 'q3',
    text: 'Quais canais de marketing digital você utiliza ativamente?',
    area: 'channels',
    options: [
      {
        id: 'q3_opt1',
        text: 'Apenas redes sociais orgânicas',
        score: 3
      },
      {
        id: 'q3_opt2',
        text: 'Redes sociais e e-mail marketing',
        score: 5
      },
      {
        id: 'q3_opt3',
        text: 'Múltiplos canais incluindo anúncios pagos',
        score: 8
      },
      {
        id: 'q3_opt4',
        text: 'Estratégia omnichannel integrada',
        score: 10
      }
    ]
  },
  {
    id: 'q4',
    text: 'Como você avalia sua estratégia de conteúdo?',
    area: 'content',
    options: [
      {
        id: 'q4_opt1',
        text: 'Não produzimos conteúdo regularmente',
        score: 0
      },
      {
        id: 'q4_opt2',
        text: 'Produzimos conteúdo sem planejamento',
        score: 3
      },
      {
        id: 'q4_opt3',
        text: 'Temos um calendário editorial básico',
        score: 6
      },
      {
        id: 'q4_opt4',
        text: 'Estratégia completa de conteúdo alinhada ao funil',
        score: 10
      }
    ]
  },
  {
    id: 'q5',
    text: 'Como você gerencia o relacionamento com seus leads/clientes?',
    area: 'crm',
    options: [
      {
        id: 'q5_opt1',
        text: 'Não utilizamos nenhum sistema',
        score: 0
      },
      {
        id: 'q5_opt2',
        text: 'Usamos planilhas ou sistemas básicos',
        score: 3
      },
      {
        id: 'q5_opt3',
        text: 'Temos um CRM mas não utilizamos todo seu potencial',
        score: 6
      },
      {
        id: 'q5_opt4',
        text: 'CRM totalmente integrado e otimizado',
        score: 10
      }
    ]
  },
  {
    id: 'q6',
    text: 'Como você monitora e analisa seus resultados de marketing?',
    area: 'analytics',
    options: [
      {
        id: 'q6_opt1',
        text: 'Não monitoramos métricas',
        score: 0
      },
      {
        id: 'q6_opt2',
        text: 'Análise básica de métricas principais',
        score: 3
      },
      {
        id: 'q6_opt3',
        text: 'Monitoramento regular com algumas análises avançadas',
        score: 6
      },
      {
        id: 'q6_opt4',
        text: 'Analytics avançado com decisões baseadas em dados',
        score: 10
      }
    ]
  },
  {
    id: 'q7',
    text: 'Como está sua presença digital?',
    area: 'digitalPresence',
    options: [
      {
        id: 'q7_opt1',
        text: 'Apenas perfil em redes sociais',
        score: 3
      },
      {
        id: 'q7_opt2',
        text: 'Website básico e redes sociais',
        score: 5
      },
      {
        id: 'q7_opt3',
        text: 'Presença digital estruturada mas não otimizada',
        score: 8
      },
      {
        id: 'q7_opt4',
        text: 'Presença digital completa e otimizada',
        score: 10
      }
    ]
  },
  {
    id: 'q8',
    text: 'Qual o nível de automação do seu marketing?',
    area: 'automation',
    options: [
      {
        id: 'q8_opt1',
        text: 'Nenhuma automação implementada',
        score: 0
      },
      {
        id: 'q8_opt2',
        text: 'Automações básicas de email',
        score: 3
      },
      {
        id: 'q8_opt3',
        text: 'Várias automações mas não integradas',
        score: 6
      },
      {
        id: 'q8_opt4',
        text: 'Marketing totalmente automatizado e integrado',
        score: 10
      }
    ]
  }
]; 