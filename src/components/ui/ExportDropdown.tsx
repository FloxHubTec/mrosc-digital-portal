import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { ExportFormat } from '@/utils/exportUtils';

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  className?: string;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExport, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { id: 'excel' as ExportFormat, label: 'Excel (.xlsx)', icon: FileSpreadsheet },
    { id: 'csv' as ExportFormat, label: 'CSV (.csv)', icon: FileText },
    { id: 'pdf' as ExportFormat, label: 'PDF (.pdf)', icon: FileText },
    { id: 'sicom' as ExportFormat, label: 'Layout SICOM (CSV)', icon: FileSpreadsheet },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
      >
        <Download size={16} />
        Exportar
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
            {formats.map(format => (
              <button
                key={format.id}
                onClick={() => {
                  onExport(format.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted flex items-center gap-3 transition-colors"
              >
                <format.icon size={16} className="text-muted-foreground" />
                {format.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportDropdown;
