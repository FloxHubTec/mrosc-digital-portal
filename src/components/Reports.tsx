import React, { useState } from 'react';
import { BarChartHorizontal, Download, Filter, FilePieChart, FileSpreadsheet, Database, ArrowUpRight, ShieldCheck, TrendingUp, FileText, X, ChevronDown, FileCheck2, Calculator } from 'lucide-react';
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
import { usePartnerships } from '@/hooks/usePartnerships';
import { useTheme } from '@/contexts/ThemeContext';

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'doc';

const ReportsModule: React.FC = () => {
  const { partnerships } = usePartnerships();
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [showREOModal, setShowREOModal] = useState(false);
  const [showREFFModal, setShowREFFModal] = useState(false);
  const [selectedPartnershipId, setSelectedPartnershipId] = useState<string>('');
  
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

  // Generate REO PDF
  const generateREOPDF = () => {
    const selectedPartnership = partnerships.find(p => p.id === selectedPartnershipId);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(theme.organizationName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(theme.organizationSubtitle, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE EXECUÇÃO DO OBJETO - REO', doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });
    
    // Partnership info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Termo de Parceria: ${selectedPartnership?.numero_termo || 'N/A'}`, 14, 50);
    doc.text(`OSC: ${selectedPartnership?.osc?.razao_social || 'N/A'}`, 14, 56);
    doc.text(`CNPJ: ${selectedPartnership?.osc?.cnpj || 'N/A'}`, 14, 62);
    doc.text(`Vigência: ${selectedPartnership?.vigencia_inicio || 'N/A'} a ${selectedPartnership?.vigencia_fim || 'N/A'}`, 14, 68);
    doc.text(`Valor Total: R$ ${selectedPartnership?.valor_repassado?.toLocaleString('pt-BR') || '0,00'}`, 14, 74);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 80);
    
    // Mock REO data
    const reoData = [
      ['1', 'Capacitação de beneficiários', 'Realizar 10 oficinas', '10 oficinas', '100%'],
      ['2', 'Aquisição de materiais', 'Comprar equipamentos', '80% adquirido', '80%'],
      ['3', 'Atendimentos diretos', 'Atender 200 pessoas', '180 atendidas', '90%'],
      ['4', 'Eventos comunitários', 'Realizar 4 eventos', '3 realizados', '75%'],
    ];
    
    autoTable(doc, {
      head: [['Meta', 'Descrição', 'Etapa Prevista', 'Etapa Executada', '% Concluído']],
      body: reoData,
      startY: 90,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 250] },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} • Sistema MROSC ${theme.organizationName.split(' ').slice(-1)[0]}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    doc.save(`REO_${selectedPartnership?.numero_termo || 'parceria'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('REO gerado com sucesso!');
    setShowREOModal(false);
  };

  // Generate REFF PDF
  const generateREFFPDF = () => {
    const selectedPartnership = partnerships.find(p => p.id === selectedPartnershipId);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(theme.organizationName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(theme.organizationSubtitle, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE EXECUÇÃO FÍSICO-FINANCEIRA - REFF', doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });
    
    // Partnership info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Termo de Parceria: ${selectedPartnership?.numero_termo || 'N/A'}`, 14, 50);
    doc.text(`OSC: ${selectedPartnership?.osc?.razao_social || 'N/A'}`, 14, 56);
    doc.text(`CNPJ: ${selectedPartnership?.osc?.cnpj || 'N/A'}`, 14, 62);
    doc.text(`Valor do Repasse: R$ ${selectedPartnership?.valor_repassado?.toLocaleString('pt-BR') || '0,00'}`, 14, 68);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 74);
    
    // Receitas
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEITAS', 14, 86);
    
    const receitasData = [
      ['Repasse Inicial', 'R$ 150.000,00'],
      ['Repasse 2ª Parcela', 'R$ 50.000,00'],
      ['Rendimento de Aplicação', 'R$ 1.250,00'],
      ['TOTAL RECEITAS', 'R$ 201.250,00'],
    ];
    
    autoTable(doc, {
      head: [['Descrição', 'Valor']],
      body: receitasData,
      startY: 90,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 250] },
    });
    
    // Despesas
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DESPESAS', 14, finalY);
    
    const despesasData = [
      ['Material de Consumo', 'R$ 25.000,00'],
      ['Serviços de Terceiros', 'R$ 80.000,00'],
      ['Equipamentos', 'R$ 45.000,00'],
      ['Recursos Humanos', 'R$ 40.000,00'],
      ['TOTAL DESPESAS', 'R$ 190.000,00'],
    ];
    
    autoTable(doc, {
      head: [['Descrição', 'Valor']],
      body: despesasData,
      startY: finalY + 4,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });
    
    // Saldo
    const finalY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SALDO EM CONTA: R$ 11.250,00', 14, finalY2);
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} • Sistema MROSC Unaí/MG`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    doc.save(`REFF_${selectedPartnership?.numero_termo || 'parceria'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('REFF gerado com sucesso!');
    setShowREFFModal(false);
  };

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

      {/* Official Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-teal-600 rounded-2xl">
                <FileCheck2 size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-teal-800 dark:text-teal-200">Relatório REO</h3>
                <p className="text-sm text-teal-600 dark:text-teal-400">Execução do Objeto</p>
              </div>
            </div>
            <p className="text-sm text-teal-700 dark:text-teal-300 mb-4">
              Documento oficial que demonstra o cumprimento das metas e etapas previstas no plano de trabalho.
            </p>
            <Button 
              onClick={() => setShowREOModal(true)} 
              className="w-full bg-teal-700 hover:bg-teal-800 text-white gap-2"
            >
              <FileCheck2 size={16} />
              Gerar REO (Execução do Objeto)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-blue-600 rounded-2xl">
                <Calculator size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-blue-800 dark:text-blue-200">Relatório REFF</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Físico-Financeiro</p>
              </div>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Documento oficial que apresenta receitas, despesas e saldo financeiro da parceria.
            </p>
            <Button 
              onClick={() => setShowREFFModal(true)} 
              className="w-full bg-blue-700 hover:bg-blue-800 text-white gap-2"
            >
              <Calculator size={16} />
              Gerar REFF (Físico-Financeiro)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* REO Modal */}
      <Dialog open={showREOModal} onOpenChange={setShowREOModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Gerar REO - Execução do Objeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-bold mb-2 block">Selecione a Parceria</Label>
              <Select value={selectedPartnershipId} onValueChange={setSelectedPartnershipId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma parceria..." />
                </SelectTrigger>
                <SelectContent>
                  {partnerships.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.numero_termo} - {p.osc?.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={generateREOPDF} 
              disabled={!selectedPartnershipId}
              className="w-full gap-2"
            >
              <Download size={16} />
              Gerar PDF do REO
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* REFF Modal */}
      <Dialog open={showREFFModal} onOpenChange={setShowREFFModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Gerar REFF - Físico-Financeiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-bold mb-2 block">Selecione a Parceria</Label>
              <Select value={selectedPartnershipId} onValueChange={setSelectedPartnershipId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma parceria..." />
                </SelectTrigger>
                <SelectContent>
                  {partnerships.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.numero_termo} - {p.osc?.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={generateREFFPDF} 
              disabled={!selectedPartnershipId}
              className="w-full gap-2"
            >
              <Download size={16} />
              Gerar PDF do REFF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <div className="fixed inset-0 z-30" onClick={() => setShowExportDropdown(null)} />
                <div className="absolute left-0 bottom-full mb-2 bg-white dark:bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden min-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => { handleGenerateSICOM('excel'); setShowExportDropdown(null); }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-800 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted flex items-center gap-3 transition-colors"
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => { handleGenerateSICOM('csv'); setShowExportDropdown(null); }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-800 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted flex items-center gap-3 transition-colors"
                  >
                    <FileText size={16} className="text-blue-600" />
                    CSV (.csv)
                  </button>
                  <button
                    onClick={() => { handleGenerateSICOM('pdf'); setShowExportDropdown(null); }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-800 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted flex items-center gap-3 transition-colors"
                  >
                    <FileText size={16} className="text-red-600" />
                    PDF (.pdf)
                  </button>
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
