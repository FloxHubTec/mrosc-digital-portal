import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LabelDictionary {
  chamamento: string;
  edital: string;
  osc: string;
  parceria: string;
  [key: string]: string;
}

interface LabelContextType {
  labels: LabelDictionary;
  updateLabel: (key: string, value: string) => void;
  getLabel: (key: string) => string;
}

const defaultLabels: LabelDictionary = {
  chamamento: 'Chamamento',
  edital: 'Edital',
  osc: 'OSC',
  parceria: 'Parceria',
};

const LabelContext = createContext<LabelContextType | undefined>(undefined);

export const LabelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [labels, setLabels] = useState<LabelDictionary>(() => {
    const stored = localStorage.getItem('mrosc_labels');
    return stored ? { ...defaultLabels, ...JSON.parse(stored) } : defaultLabels;
  });

  const updateLabel = (key: string, value: string) => {
    setLabels(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('mrosc_labels', JSON.stringify(updated));
      return updated;
    });
  };

  const getLabel = (key: string) => labels[key] || key;

  return (
    <LabelContext.Provider value={{ labels, updateLabel, getLabel }}>
      {children}
    </LabelContext.Provider>
  );
};

export const useLabels = () => {
  const context = useContext(LabelContext);
  if (!context) {
    throw new Error('useLabels must be used within a LabelProvider');
  }
  return context;
};
