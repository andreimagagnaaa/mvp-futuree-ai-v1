# Backend do Chatbot OpenAI

Backend simples e prático para o chatbot OpenAI do nosso SaaS.

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
OPENAI_API_KEY=sua_chave_aqui
PORT=3000
```

## Uso

1. Para iniciar o servidor em modo desenvolvimento (com hot-reload):
```bash
npm run dev
```

2. Para iniciar o servidor em modo produção:
```bash
npm start
```

## Endpoints

### POST /chat
Endpoint principal para processar mensagens do chatbot.

Exemplo de requisição:
```json
{
  "message": "Como melhorar minha estratégia de marketing digital?",
  "context": "Contexto adicional (opcional)"
}
```

Exemplo de resposta:
```json
{
  "success": true,
  "message": "Resposta do chatbot...",
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

### GET /health
Endpoint para verificar o status do servidor.

## Integração com o Frontend

Para integrar com o frontend existente, atualize o arquivo de configuração da API no frontend (`src/config/openai.ts`) com a URL do backend:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoint: '/chat'
};
``` 