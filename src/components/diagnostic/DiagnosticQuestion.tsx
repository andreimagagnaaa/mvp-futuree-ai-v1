import React from 'react';
import { Question } from '../../types/diagnostic';

interface DiagnosticQuestionProps {
  question: Question;
  selectedOption: string | null;
  onAnswer: (questionId: string, optionId: string) => void;
  onPrevious: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const DiagnosticQuestion: React.FC<DiagnosticQuestionProps> = ({
  question,
  selectedOption,
  onAnswer,
  onPrevious,
  currentQuestionIndex,
  totalQuestions
}) => {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium text-gray-900">
        {question.text}
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswer(question.id, option.id)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
              selectedOption === option.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        {!isFirstQuestion && (
          <button
            onClick={onPrevious}
            className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Voltar
          </button>
        )}
        {isFirstQuestion && <div />}
        
        <div className="text-sm text-gray-500">
          {currentQuestionIndex + 1} de {totalQuestions}
        </div>
      </div>
    </div>
  );
}; 