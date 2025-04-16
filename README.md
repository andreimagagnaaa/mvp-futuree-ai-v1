
# Futuree AI - Dashboard de Marketing

Este projeto é uma plataforma de dashboard para marketing digital que oferece ferramentas para análise, planejamento e execução de estratégias de marketing.

## Funcionalidades Principais

### Dashboard de Métricas
- Visualização de KPIs importantes (visitas, conversão, leads, receita)
- Gráficos de tendência para acompanhamento de métricas
- Análise de desempenho por canal
- Filtros por período (dia, semana, mês, ano)

### Plano de Ação
- Gerenciamento de tarefas por etapas (Diagnóstico, Estratégia, Execução, Análise)
- Acompanhamento visual de progresso
- Priorização de tarefas
- Notas e prazos para cada tarefa

### Checklist de Tarefas
- Criação e gerenciamento de tarefas
- Marcação de conclusão com feedback visual
- Categorização e priorização
- Exportação para PDF

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Lucide React (ícones)
- Canvas Confetti (efeitos visuais)

## Estrutura do Projeto

```
Landing Pagee/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ActionPlanDashboard.tsx
│   │   │   ├── MetricsDashboard.tsx
│   │   │   ├── TaskChecklist.tsx
│   │   │   └── PremiumReport.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   └── ...
│   ├── contexts/
│   ├── hooks/
│   └── ...
├── public/
└── ...
```

## Instalação e Execução

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```
4. Acesse a aplicação em `http://localhost:5173`

## Componentes Principais

### MetricsDashboard
Dashboard de métricas chave com indicadores de tendência, gráficos e análise de desempenho por canal.

### ActionPlanDashboard
Plano de ação interativo com cartões de progresso visual para cada etapa do processo de marketing.

### TaskChecklist
Sistema de checklist para gerenciamento de tarefas com feedback visual e categorização.

## Contribuição

Para contribuir com o projeto, siga estas etapas:
1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT. 