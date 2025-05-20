import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Verificar se as variáveis de ambiente necessárias estão definidas
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são necessárias')
  process.exit(1)
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTaskProgressTable() {
  try {
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'create-task-progress-function.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // Executar o SQL diretamente
    const { error } = await supabase
      .from('task_progress')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        task_id: 'test',
        status: 'pending'
      })
      .select()

    // Se der erro de tabela não existe, vamos criar
    if (error?.message?.includes('does not exist')) {
      console.log('Tabela não existe, criando...')
      
      // Criar a tabela
      const { error: createError } = await supabase
        .rpc('create_task_progress_table')

      if (createError) {
        console.error('Erro ao criar tabela:', createError)
        process.exit(1)
      }

      console.log('Tabela task_progress criada com sucesso!')
    } else if (error) {
      console.error('Erro ao testar tabela:', error)
    } else {
      console.log('Tabela task_progress já existe')
    }

    process.exit(0)
  } catch (error) {
    console.error('Erro ao executar o script:', error)
    process.exit(1)
  }
}

// Executar a função
createTaskProgressTable() 