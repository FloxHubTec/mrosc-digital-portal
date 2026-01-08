import React, { useState } from 'react';
import { BarChartHorizontal, Download, Filter, FilePieChart, FileSpreadsheet, Database, ArrowUpRight, ShieldCheck, TrendingUp, FileText, X, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'doc';

const ReportsModule: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  
  // Filters state
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterOSC, setFilterOSC] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  
  // Customize state
  const [customColumns, setCustomColumns] = useState({
    osc: true,
    valor: true,
    status: true,
    data: true,
    metas: true,
    repasses: true,
  });

  const reportTypes = [
    { title: 'Relatório Técnico Consolidado', desc: 'Análise detalhada do cumprimento de metas e objeto.', icon: TrendingUp, color: 'text-info', bg: 'bg-info/10' },
    { title: 'Relatório de Execução Financeira', desc: 'Fluxo de caixa, repasses e saldos em conta.', icon: FilePieChart, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Controle Interno e Auditoria', desc: 'Pendências de CND e prazos de prestação de contas.', icon: ShieldCheck, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Exportação SICOM-TCEMG', desc: 'Arquivo formatado para o Tribunal de Contas.', icon: Database, color: 'text-info', bg: 'bg-info/10' },
  ];

  const generateMockData = (reportIndex: number) => {
    const data = [
      ['Instituto Unaí Forte', 'R$ 250.000,00', 'Aprovada', '15/01/2024', '100%', 'R$ 250.000,00'],
      ['Associação Vida Plena', 'R$ 85.000,00', 'Em Análise', '20/02/2024', '75%', 'R$ 63.750,00'],
      ['Creche Raio de Sol', 'R$ 150.000,00', 'Aprovada', '10/03/2024', '90%', 'R$ 135.000,00'],
      ['Casa de Acolhimento', 'R$ 120.000,00', 'Pendente', '05/04/2024', '50%', 'R$ 60.000,00'],
    ];
    return data;
  };

  const handleExport = (format: ExportFormat, reportIndex: number) => {
    const report = reportTypes[reportIndex];
    const filename = report.title.toLowerCase().replace(/\s+/g, '-');
    const headers = ['OSC', 'Valor Total', 'Status', 'Data', 'Metas (%)', 'Repasses'];
    const data = generateMockData(reportIndex);
    
    switch (format) {
      case 'excel':
        exportToExcel(filename, report.title, headers, data);
        break;
      case 'csv':
        exportToCSV(filename, headers, data);
        break;
      case 'pdf':
        exportToPDF(filename, report.title, headers, data);
        break;
      case 'doc':
        exportToDoc(filename, report.title, headers, data);
        break;
    }
    
    setShowExportDropdown(null);
    toast.success(`Relatório exportado em ${format.toUpperCase()}!`);
  };

  const exportToExcel = (filename: string, title: string, headers: string[], data: string[][]) => {
    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const colWidths = headers.map((header, i) => {
      const maxLength = Math.max(header.length, ...data.map(row => String(row[i] || '').length));
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = colWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 30));
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToCSV = (filename: string, headers: string[], data: string[][]) => {
    const csvContent = [headers.join(';'), ...data.map(row => row.map(cell => `"${cell}"`).join(';'))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = (filename: string, title: string, headers: string[], data: string[][]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
    
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} • Sistema MROSC Unaí/MG`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    doc.save(`${filename}.pdf`);
  };

  const exportToDoc = (filename: string, title: string, headers: string[], data: string[][]) => {
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>${title}</title></head>
      <body>
        <h1 style="text-align:center;font-family:Arial;">${title}</h1>
        <p style="font-family:Arial;font-size:12px;">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <table border="1" style="border-collapse:collapse;width:100%;font-family:Arial;font-size:11px;">
          <thead><tr style="background-color:#3b82f6;color:white;">
            ${headers.map(h => `<th style="padding:8px;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${data.map((row, i) => `<tr style="background-color:${i % 2 === 0 ? '#f5f7fa' : 'white'};">${row.map(cell => `<td style="padding:8px;">${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <p style="text-align:center;font-family:Arial;font-size:10px;margin-top:20px;">Sistema MROSC Unaí/MG</p>
      </body></html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.doc`;
    link.click();
  };

  const handleGenerateSICOM = (format: ExportFormat) => {
    const filename = 'sicom-tcemg-export';
    const title = 'Exportação SICOM-TCEMG';
    const headers = ['Código', 'OSC', 'CNPJ', 'Tipo', 'Valor', 'Data Repasse', 'Status'];
    const data = [
      ['001', 'Instituto Unaí Forte', '12.345.678/0001-01', 'Termo de Fomento', 'R$ 250.000,00', '15/01/2024', 'Aprovada'],
      ['002', 'Associação Vida Plena', '98.765.432/0001-99', 'Termo de Colaboração', 'R$ 85.000,00', '20/02/2024', 'Em Análise'],
      ['003', 'Creche Raio de Sol', '45.123.789/0001-44', 'Termo de Fomento', 'R$ 150.000,00', '10/03/2024', 'Aprovada'],
    ];
    
    switch (format) {
      case 'excel':
        exportToExcel(filename, title, headers, data);
        break;
      case 'csv':
        exportToCSV(filename, headers, data);
        break;
      case 'pdf':
        exportToPDF(filename, title, headers, data);
        break;
    }
    
    toast.success(`Arquivo SICOM exportado em ${format.toUpperCase()}!`);
  };

  const ExportDropdownButton = ({ reportIndex }: { reportIndex: number }) => {
    const isOpen = showExportDropdown === `report-${reportIndex}`;
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowExportDropdown(isOpen ? null : `report-${reportIndex}`)}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
        >
          <Download size={16} />
          Exportar
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(null)} />
            <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
              {[
                { id: 'excel' as ExportFormat, label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'csv' as ExportFormat, label: 'CSV (.csv)', icon: FileText },
                { id: 'pdf' as ExportFormat, label: 'PDF (.pdf)', icon: FileText },
                { id: 'doc' as ExportFormat, label: 'Word (.doc)', icon: FileText },
              ].map(format => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id, reportIndex)}
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

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3"><BarChartHorizontal size={14} /><span>Inteligência de Dados e Prestação Jurisdicional</span></div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Relatórios e BI</h2>
          <p className="text-muted-foreground font-medium">Geração de documentos técnicos e gerenciais exportáveis.</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 bg-card border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all flex items-center space-x-2 shadow-sm"
        >
          <Filter size={18} />
          <span>Filtros Globais</span>
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </header>

      {/* Global Filters Panel */}
      {showFilters && (
        <Card className="animate-in fade-in slide-in-from-top-2 duration-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filtros Globais</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label className="text-xs font-bold mb-2 block">Período</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="month">Este Mês</SelectItem>
                    <SelectItem value="quarter">Este Trimestre</SelectItem>
                    <SelectItem value="year">Este Ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filterPeriod === 'custom' && (
                <>
                  <div>
                    <Label className="text-xs font-bold mb-2 block">Data Início</Label>
                    <Input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold mb-2 block">Data Fim</Label>
                    <Input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <Label className="text-xs font-bold mb-2 block">OSC</Label>
                <Select value={filterOSC} onValueChange={setFilterOSC}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">Instituto Unaí Forte</SelectItem>
                    <SelectItem value="2">Associação Vida Plena</SelectItem>
                    <SelectItem value="3">Creche Raio de Sol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold mb-2 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="analise">Em Análise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                setFilterPeriod('all');
                setFilterOSC('all');
                setFilterStatus('all');
                setFilterDateStart('');
                setFilterDateEnd('');
              }}>Limpar Filtros</Button>
              <Button onClick={() => {
                toast.success('Filtros aplicados!');
                setShowFilters(false);
              }}>Aplicar Filtros</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportTypes.map((report, i) => (
          <div key={i} className="bg-card p-10 rounded-[3rem] border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
             <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                  <div className={`p-4 rounded-[1.5rem] w-fit ${report.bg} ${report.color}`}><report.icon size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{report.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">{report.desc}</p>
                  </div>
                </div>
                <ExportDropdownButton reportIndex={i} />
             </div>
             <div className="mt-8 pt-8 border-t border-border flex items-center justify-between relative z-10">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Última geração: Hoje, 08:20</span>
                <button 
                  onClick={() => { setSelectedReport(i); setShowCustomizeModal(true); }}
                  className="text-primary font-black text-xs flex items-center gap-2 hover:translate-x-1 transition-transform"
                >
                  <span>PERSONALIZAR</span><ArrowUpRight size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-sidebar-background p-12 rounded-[4rem] text-sidebar-foreground flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Database size={300} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sidebar-primary/20 rounded-full border border-sidebar-primary/30 text-[10px] font-black uppercase tracking-widest text-sidebar-primary"><div className="w-2 h-2 rounded-full bg-sidebar-primary animate-pulse"></div>Integração TCEMG Ativa</div>
          <h3 className="text-3xl font-black">Módulo de Exportação SICOM</h3>
          <p className="text-sidebar-foreground/60 max-w-xl font-medium leading-relaxed">Prepare e valide os dados das parcerias, emendas e repasses para o envio periódico ao Tribunal de Contas do Estado de Minas Gerais.</p>
        </div>
        <div className="relative shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(showExportDropdown === 'sicom' ? null : 'sicom')}
              className="px-10 py-6 bg-sidebar-primary text-sidebar-primary-foreground rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 relative z-10 flex items-center gap-3"
            >
              GERAR ARQUIVO SICOM
              <ChevronDown size={18} className={`transition-transform ${showExportDropdown === 'sicom' ? 'rotate-180' : ''}`} />
            </button>
            
            {showExportDropdown === 'sicom' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(null)} />
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    { id: 'excel' as ExportFormat, label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                    { id: 'csv' as ExportFormat, label: 'CSV (.csv)', icon: FileText },
                    { id: 'pdf' as ExportFormat, label: 'PDF (.pdf)', icon: FileText },
                  ].map(format => (
                    <button
                      key={format.id}
                      onClick={() => { handleGenerateSICOM(format.id); setShowExportDropdown(null); }}
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
        </div>
      </div>

      {/* Customize Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personalizar Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Selecione as colunas que deseja incluir no relatório:
            </p>
            <div className="space-y-3">
              {Object.entries(customColumns).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <Checkbox 
                    id={key} 
                    checked={value} 
                    onCheckedChange={(checked) => setCustomColumns({ ...customColumns, [key]: !!checked })}
                  />
                  <Label htmlFor={key} className="capitalize">{key === 'osc' ? 'OSC' : key}</Label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCustomizeModal(false)}>Cancelar</Button>
              <Button onClick={() => {
                toast.success('Configurações salvas!');
                setShowCustomizeModal(false);
              }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsModule;
