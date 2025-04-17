# Futuree AI

Plataforma de diagnóstico e otimização de marketing digital com inteligência artificial.

## 🚀 Funcionalidades

- **Diagnóstico Inteligente**: Análise completa da sua estratégia de marketing digital
- **Dashboard Personalizado**: Visualização clara dos seus resultados e métricas
- **Recomendações Práticas**: Sugestões acionáveis baseadas em dados
- **Agendamento de Demonstrações**: Sistema integrado com Google Calendar
- **Relatórios Detalhados**: Exportação de relatórios em PDF

## 🛠️ Tecnologias

- React
- TypeScript
- Tailwind CSS
- Supabase
- Firebase
- Framer Motion
- Headless UI
- Recharts
- Lucide Icons

## 📦 Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/futuree-ai.git
```

2. Instale as dependências
```bash
cd futuree-ai
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Preencha as variáveis no arquivo `.env` com suas credenciais.

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: agendamentos
- `id`: UUID (primary key)
- `nome`: text
- `email`: text
- `empresa`: text
- `telefone`: text
- `status`: text (default: 'pendente')
- `created_at`: timestamp
- `updated_at`: timestamp
- `horario_agendado`: timestamp
- `observacoes`: text

## 🔐 Segurança

- Row Level Security (RLS) configurado no Supabase
- Autenticação via Firebase
- Proteção de rotas para usuários autenticados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 