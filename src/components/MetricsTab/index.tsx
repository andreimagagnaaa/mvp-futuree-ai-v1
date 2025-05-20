import React, { useState } from 'react';
import { CustomMetricsProvider } from '../../contexts/CustomMetricsContext';
import MetricsHeader from './MetricsHeader';
import MetricsOverview from './MetricsOverview';
import RoiCalculator from './RoiCalculator';
import MetricsConfig from './MetricsConfig';
import { useCustomMetrics } from '../../contexts/CustomMetricsContext';

const MetricsContent: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);
  const { config } = useCustomMetrics();

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="px-6 py-4">
        <div className="overflow-visible max-w-7xl mx-auto">
          <MetricsHeader 
            onConfigClick={() => setShowConfig(!showConfig)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {showConfig ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <MetricsConfig />
            </div>
          ) : (
            <>
              <div className="space-y-8">
                <MetricsOverview />

                {config.layout.showRoiCalculator && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <RoiCalculator />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricsTab: React.FC = () => {
  return (
    <CustomMetricsProvider>
      <MetricsContent />
    </CustomMetricsProvider>
  );
};

export default MetricsTab; 