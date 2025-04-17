import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qkinvbzxhggczimyejjy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW52Ynp4aGdnY3ppbXllamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzUyNjUsImV4cCI6MjA1OTAxMTI2NX0.o0xiNqeFwP5P3u-NpziDHsiwrM1c6L-C0nqjHuSCKkA'
)

async function verificarRecomendacoes() {
  try {
    console.log('🔍 Analisando estrutura da tabela tarefas_recomendadas...\n')

    // 1. Verificar valores únicos de área, score e tipo_cliente
    const { data: uniqueValues, error: uniqueError } = await supabase
      .from('tarefas_recomendadas')
      .select('area, score, tipo_cliente')

    if (uniqueError) {
      throw new Error('Erro ao buscar valores únicos: ' + uniqueError.message)
    }

    const areas = [...new Set(uniqueValues.map(item => item.area))]
    const scores = [...new Set(uniqueValues.map(item => item.score))]
    const tiposCliente = [...new Set(uniqueValues.map(item => item.tipo_cliente))]

    console.log('📊 Valores únicos encontrados:')
    console.log('Áreas:', areas)
    console.log('Scores:', scores)
    console.log('Tipos de Cliente:', tiposCliente)

    // 2. Buscar alguns exemplos de recomendações
    console.log('\n📋 Exemplos de recomendações:')
    const { data: examples, error: examplesError } = await supabase
      .from('tarefas_recomendadas')
      .select('*')
      .limit(3)

    if (examplesError) {
      throw new Error('Erro ao buscar exemplos: ' + examplesError.message)
    }

    examples.forEach((example, index) => {
      console.log(`\nExemplo ${index + 1}:`)
      console.log('Área:', example.area)
      console.log('Score:', example.score)
      console.log('Tipo de Cliente:', example.tipo_cliente)
      console.log('Tarefa:', example.tarefa_recomendada)
      console.log('Framework:', example.framework_sugerido)
      console.log('Material:', example.nome_material)
      console.log('Link:', example.link_pdf)
    })

  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
}

verificarRecomendacoes() 