export interface Metric {
  id: string;
  name: string;
  key: string;
  type: 'number' | 'percentage' | 'currency';
  isActive: boolean;
  isRequired?: boolean;
  userId: string;
}

export interface CompetitorMetrics {
  marketShare?: number;
  growth?: number;
  socialFollowers?: number;
  engagement?: number;
  websiteTraffic?: number;
  contentFrequency?: number;
  [key: string]: number | undefined;
}

export interface CompetitorData {
  id: string;
  name: string;
  sector: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  metrics: CompetitorMetrics;
}

export interface SectorMetrics {
  [key: string]: number;
}

export interface FormattingOptions {
  type: Metric['type'];
  precision?: number;
  currency?: string;
}

export interface CompetitorFormData extends Partial<CompetitorData> {
  metrics?: CompetitorMetrics;
} 