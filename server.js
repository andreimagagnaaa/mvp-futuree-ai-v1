import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createServer } from 'http';

dotenv.config();

const app = express();
let port = process.env.PORT || 5173;
const alternativePorts = [5000, 5174, 5175, 5176, 5177];

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:5174', // URL do frontend Vite
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configuração da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota para chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Erro na API da OpenAI:', error);
    res.status(500).json({ error: 'Erro ao processar a requisição' });
  }
});

const server = createServer(app);

function startServer(currentPort) {
  server.listen(currentPort);
}

// Tratamento de erros do servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Porta ${port} está em uso, tentando próxima porta...`);
    const nextPort = alternativePorts.shift();
    if (nextPort) {
      port = nextPort;
      startServer(port);
    } else {
      console.error('Todas as portas alternativas estão em uso. Por favor, libere alguma porta ou especifique uma nova porta no .env');
      process.exit(1);
    }
  } else {
    console.error('Erro no servidor:', error);
    process.exit(1);
  }
});

// Evento quando o servidor começa a escutar
server.on('listening', () => {
  console.log(`✨ Servidor Futuree AI rodando com sucesso na porta ${port}`);
  console.log(`🌐 Frontend: http://85.31.63.187:${port}`);
  console.log(`🚀 API: http://85.31.63.187:${port}/api`);
});

// Inicia o servidor
startServer(port); 
