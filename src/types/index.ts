export interface Metrics {
  count: number;
  conversionRate: number;
  revenue?: number;
  averageTicket?: number;
}

export interface Stage {
  id?: string;
  name: string;
  type: 'lead' | 'opportunity' | 'sale';
  metrics?: Metrics;
}

export interface Funnel {
  id?: string;
  name: string;
  stages: Stage[];
  createdAt?: Date;
  updatedAt?: Date;
  user_id?: string;
}

export type Severity = 'high' | 'medium' | 'low';

export interface Gap {
  type: string;
  stage: string;
  metric: string;
  message: string;
  severity: Severity;
}

export interface TaskProgress {
  completed: boolean;
  points: number;
  first_completion_date?: string;
}

export interface TaskRecommendation {
  id: string;
  title: string;
  description: string;
  points: number;
  priority: 'Baixa' | 'Média' | 'Alta';
  category: string;
  impact: number;
  effort: number;
}

export interface UserData {
  email: string;
  name: string;
  companyName: string;
  phone: string;
  createdAt: any;
  hasCompletedDiagnostic: boolean;
  diagnostic: any;
  lastLogin?: any;
  updatedAt?: any;
  goals?: Goal[];
}

export interface Goal {
  area: string;
  currentScore: number;
  targetScore: number;
  deadline: Date;
  status: 'active' | 'completed' | 'cancelled';
  classification: string;
}

export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: 'inbound' | 'outbound' | 'pos_venda' | 'upsell' | 'retencao' | 'nutricao';
  stages: Stage[];
  thumbnail: string;
}

export interface FunnelTemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: FunnelTemplate[];
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    weight: number;
    gapTypes: string[];
  }[];
}

export interface DiagnosticGap {
  type: string;
  probability: number;
  impact: 'Alto' | 'Médio' | 'Baixo';
  description: string;
  recommendations: string[];
}

export interface DiagnosticResult {
  overallScore: number;
  gaps: DiagnosticGap[];
  needsConsultation: boolean;
}

export interface ConsultationRequest {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
  preferredDate: Date;
  diagnosticResult: DiagnosticResult;
} 