const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qkinvbzxhggczimyejjy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFraW52Ynp4aGdnY3ppbXllamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzUyNjUsImV4cCI6MjA1OTAxMTI2NX0.o0xiNqeFwP5P3u-NpziDHsiwrM1c6L-C0nqjHuSCKkA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTable() {
  try {
    const { data, error } = await supabase
      .from('tarefas_recomendadas')
      .select('area, score, tipo_cliente, tarefa_recomendada, framework_sugerido, nome_material, link_pdf')
      .limit(1)

    if (error) {
      console.error('Erro ao acessar a tabela:', error.message)
      return
    }

    console.log('Estrutura da tabela:', Object.keys(data[0]))
    console.log('Exemplo de registro:', data[0])
  } catch (err) {
    console.error('Erro:', err.message)
  }
}

checkTable() 