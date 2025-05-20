import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:5174', // URL do frontend Vite
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Rota de teste
app.get('/api/status', (req, res) => {
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

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 