import React from 'react';

const ReportPreview: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Marketing Digital</h3>
          <span className="text-xl font-bold text-blue-600">85</span>
        </div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Redes Sociais</h3>
          <span className="text-xl font-bold text-blue-600">78</span>
        </div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">SEO</h3>
          <span className="text-xl font-bold text-blue-600">92</span>
        </div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Conteúdo</h3>
          <span className="text-xl font-bold text-blue-600">81</span>
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Total</h3>
            <span className="text-2xl font-bold text-blue-600">84</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview; 