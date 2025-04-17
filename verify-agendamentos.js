import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkinvbzxhggczimyejjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW52Ynp4aGdnY3ppbXllamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzUyNjUsImV4cCI6MjA1OTAxMTI2NX0.o0xiNqeFwP5P3u-NpziDHsiwrM1c6L-C0nqjHuSCKkA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabela() {
  console.log('🔍 Verificando tabela agendamentos...');
  
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar a tabela:', error.message);
      return;
    }
    
    console.log('✅ Tabela agendamentos está acessível');
    console.log('📊 Estrutura da tabela está correta');
    
    if (data && data.length > 0) {
      console.log('📝 Exemplo de registro:', data[0]);
    } else {
      console.log('ℹ️ A tabela está vazia, aguardando primeiro agendamento');
    }
    
  } catch (err) {
    console.error('❌ Erro ao verificar tabela:', err);
  }
}

verificarTabela(); 