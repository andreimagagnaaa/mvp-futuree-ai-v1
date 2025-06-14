export interface Database {
  public: {
    Tables: {
      task_progress: {
        Row: {
          id: string
          user_id: string
          task_id: string
          status: 'pending' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
          completed_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          created_at: string
          category: string
          status: 'pending' | 'in_progress' | 'completed'
        }
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type TaskProgress = Tables['task_progress']['Row']
export type Recommendations = Tables['recommendations']['Row'] 