import React, { useState, useRef } from 'react';
import { Settings, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      setUploadedFile(files[0]);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas arquivos CSV.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].name.endsWith('.csv')) {
      setUploadedFile(files[0]);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas arquivos CSV.",
        variant: "destructive",
      });
    }
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setUploadedFile(null);
    
    toast({
      title: "Migração concluída!",
      description: "54 OSCs importadas com sucesso.",
    });
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
          <Settings size={14} />
          <span>Configurações do Sistema</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Administração</h2>
        <p className="text-muted-foreground font-medium">Configurações avançadas e ferramentas de migração de dados.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest">
          Migração de Dados
        </button>
        <button className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-colors">
          Parâmetros Gerais
        </button>
        <button className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-colors">
          Backup
        </button>
      </div>

      {/* Migration Section */}
      <div className="bg-card rounded-[2.5rem] border border-border p-8 md:p-12 shadow-sm">
        <h3 className="text-2xl font-black text-foreground mb-2">Migração de Dados</h3>
        <p className="text-muted-foreground mb-8">
          Importe dados de OSCs e parcerias de exercícios anteriores através de arquivos CSV.
        </p>

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
            ${uploadedFile ? 'border-success bg-success/5' : ''}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-success/10 rounded-2xl">
                <FileSpreadsheet size={48} className="text-success" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-destructive"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`p-6 rounded-2xl transition-colors ${isDragOver ? 'bg-primary/10' : 'bg-muted'}`}>
                <Upload size={48} className={isDragOver ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div>
                <p className="text-lg font-black text-foreground mb-1">
                  Arraste e solte seu arquivo CSV aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">
                  OSCs
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">
                  Parcerias
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">
                  Emendas
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Process Button */}
        {uploadedFile && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Iniciar Migração
                </>
              )}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-10 p-6 bg-muted rounded-2xl">
          <h4 className="font-black text-foreground mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-warning" />
            Instruções para Migração
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• O arquivo CSV deve conter as colunas obrigatórias: CNPJ, Razão Social, Status</li>
            <li>• Campos de data devem estar no formato DD/MM/AAAA</li>
            <li>• Valores monetários devem usar ponto como separador decimal</li>
            <li>• Faça um backup antes de iniciar a migração</li>
          </ul>
        </div>
      </div>

      {/* Recent Migrations */}
      <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
        <h3 className="text-xl font-black text-foreground mb-6">Histórico de Migrações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle size={18} className="text-success" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">oscs_2023.csv</p>
                <p className="text-[10px] text-muted-foreground">12/11/2024 às 14:32</p>
              </div>
            </div>
            <span className="text-xs font-bold text-success">32 registros</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle size={18} className="text-success" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">parcerias_exercicio_2022.csv</p>
                <p className="text-[10px] text-muted-foreground">10/11/2024 às 09:15</p>
              </div>
            </div>
            <span className="text-xs font-bold text-success">18 registros</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
