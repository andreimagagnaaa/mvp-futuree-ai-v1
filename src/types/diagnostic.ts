export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Report {
  score: number;
  recommendations: string[];
  insights: string[];
} 