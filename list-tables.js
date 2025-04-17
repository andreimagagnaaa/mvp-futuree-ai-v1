import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qkinvbzxhggczimyejjy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW52Ynp4aGdnY3ppbXllamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzUyNjUsImV4cCI6MjA1OTAxMTI2NX0.o0xiNqeFwP5P3u-NpziDHsiwrM1c6L-C0nqjHuSCKkA'
)

async function listarTabelas() {
  try {
    console.log('🔍 Listando todas as tabelas disponíveis...')
    
    const { data, error } = await supabase
      .rpc('list_tables')

    if (error) {
      console.error('❌ Erro ao listar tabelas:', error.message)
      return
    }

    if (data && data.length > 0) {
      console.log('\n📋 Tabelas encontradas:')
      data.forEach(table => console.log(`- ${table}`))
    } else {
      console.log('⚠️ Nenhuma tabela encontrada no schema público')
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message)
  }
}

listarTabelas() 