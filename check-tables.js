import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qkinvbzxhggczimyejjy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW52Ynp4aGdnY3ppbXllamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzUyNjUsImV4cCI6MjA1OTAxMTI2NX0.o0xiNqeFwP5P3u-NpziDHsiwrM1c6L-C0nqjHuSCKkA'
)

async function verificarTabelas() {
  try {
    // Verifica tabela tasks
    console.log('\n🔍 Verificando tabela tasks...')
    let { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)

    if (!tasksError) {
      console.log('✅ Tabela tasks encontrada!')
      if (tasksData && tasksData.length > 0) {
        console.log('✅ Dados encontrados na tabela tasks')
        console.log('Colunas:', Object.keys(tasksData[0]).join(', '))
      } else {
        console.log('⚠️ Tabela tasks existe mas está vazia')
      }
    } else {
      console.log('❌ Erro ao acessar tabela tasks:', tasksError.message)
    }

    // Verifica tabela tarefas_recomendadas
    console.log('\n🔍 Verificando tabela tarefas_recomendadas...')
    let { data: exactMatch, error: exactError } = await supabase
      .from('tarefas_recomendadas')
      .select('*')
      .limit(1)

    if (!exactError) {
      console.log('✅ Tabela encontrada com o nome exato!')
      if (exactMatch && exactMatch.length > 0) {
        console.log('✅ Dados encontrados')
        console.log('Colunas:', Object.keys(exactMatch[0]).join(', '))
      } else {
        console.log('⚠️ Tabela existe mas está vazia')
      }
      return
    }

    // Se não encontrou com o nome exato, tenta com variações
    console.log('\n🔍 Tentando variações do nome da tabela...')
    const variations = [
      'Tarefas_Recomendadas',
      'TAREFAS_RECOMENDADAS',
      'tarefasrecomendadas',
      'tarefas',
      'recomendacoes'
    ]

    for (const tableName of variations) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (!error) {
        console.log(`✅ Tabela encontrada com o nome: ${tableName}`)
        if (data && data.length > 0) {
          console.log('Colunas:', Object.keys(data[0]).join(', '))
        } else {
          console.log('⚠️ Tabela existe mas está vazia')
        }
        return
      }
    }

    console.log('❌ Nenhuma tabela encontrada com as variações testadas')
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message)
  }
}

verificarTabelas()