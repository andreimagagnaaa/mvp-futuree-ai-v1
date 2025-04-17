import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qkinvbzxhggczimyejjy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW52Ynp4aGdnY3ppbXllamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzUyNjUsImV4cCI6MjA1OTAxMTI2NX0.o0xiNqeFwP5P3u-NpziDHsiwrM1c6L-C0nqjHuSCKkA'
)

console.log('🔍 Verificando conexão com Supabase...')

async function verificarTabela() {
  try {
    // Primeiro, verifica se a conexão está funcionando
    const { error: healthError } = await supabase.from('tarefas_recomendadas').select('count')
    if (healthError) {
      throw new Error('Erro na conexão com Supabase: ' + healthError.message)
    }
    console.log('✅ Conexão com Supabase estabelecida com sucesso')

    // Agora tenta acessar a tabela com as colunas acentuadas
    const { data, error } = await supabase
      .from('tarefas_recomendadas')
      .select('área, pontuação, tipo_cliente, tarefa_recomendada, framework_sugerido, nome_material, link_pdf')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ A tabela não existe no schema público')
      } else if (error.message.includes('permission denied')) {
        console.error('❌ Erro de permissão - Verifique as políticas RLS')
      } else if (error.message.includes('column')) {
        console.error('❌ Erro na estrutura das colunas:', error.message)
      } else {
        console.error('❌ Erro ao acessar a tabela:', error.message)
      }
      process.exit(1)
    }

    console.log('✅ Tabela encontrada e acessível')
    
    if (data && data.length > 0) {
      console.log('✅ Dados encontrados na tabela')
      console.log('\nColunas disponíveis:', Object.keys(data[0]).join(', '))
      console.log('\nExemplo de registro:', JSON.stringify(data[0], null, 2))
    } else {
      console.log('⚠️ A tabela existe mas está vazia')
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message)
    process.exit(1)
  }
}

verificarTabela() 