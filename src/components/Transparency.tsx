import React, { useState } from 'react';
import { Search, ChevronRight, FileText, CheckCircle2, AlertCircle, Download, X, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Mock data for partnerships
const mockPartnerships = [
  { 
    id: '1',
    osc: 'Inst. Unaí Forte', 
    cnpj: '12.345.678/0001-01', 
    type: 'Termo de Fomento', 
    obj: 'Alimentação Escolar Rural', 
    val: 'R$ 250.000,00', 
    status: 'Aprovada',
    vigencia: '01/01/2025 a 31/12/2025',
    responsavel: 'João Silva',
    repasses: [
      { data: '15/01/2025', valor: 'R$ 62.500,00' },
      { data: '15/04/2025', valor: 'R$ 62.500,00' },
      { data: '15/07/2025', valor: 'R$ 62.500,00' },
      { data: '15/10/2025', valor: 'R$ 62.500,00' },
    ],
    metas: 'Atender 500 alunos da zona rural com refeições diárias',
  },
  { 
    id: '2',
    osc: 'Assoc. Vida Plena', 
    cnpj: '98.765.432/0001-99', 
    type: 'Termo de Colaboração', 
    obj: 'Oficinas de Música', 
    val: 'R$ 85.000,00', 
    status: 'Em Análise',
    vigencia: '01/03/2025 a 28/02/2026',
    responsavel: 'Maria Santos',
    repasses: [
      { data: '01/03/2025', valor: 'R$ 42.500,00' },
      { data: '01/09/2025', valor: 'R$ 42.500,00' },
    ],
    metas: 'Capacitar 200 jovens em instrumentos musicais',
  },
  { 
    id: '3',
    osc: 'Creche Raio de Sol', 
    cnpj: '45.123.789/0001-44', 
    type: 'Termo de Fomento', 
    obj: 'Manutenção de Berçário', 
    val: 'R$ 150.000,00', 
    status: 'Aprovada com Ressalvas',
    vigencia: '01/02/2025 a 31/01/2026',
    responsavel: 'Ana Oliveira',
    repasses: [
      { data: '01/02/2025', valor: 'R$ 50.000,00' },
      { data: '01/06/2025', valor: 'R$ 50.000,00' },
      { data: '01/10/2025', valor: 'R$ 50.000,00' },
    ],
    metas: 'Atender 100 crianças de 0 a 3 anos',
  }
];

// Mock data for public calls
const mockChamamentos = [
  { 
    id: '1', 
    edital: 'Edital 001/2023', 
    titulo: 'Processo de Seleção para Projetos de Cultura',
    pdfUrl: 'https://www.unai.mg.gov.br/edital-cultura-2023.pdf',
    status: 'encerrado'
  },
  { 
    id: '2', 
    edital: 'Edital 002/2023', 
    titulo: 'Processo de Seleção para Projetos de Educação',
    pdfUrl: 'https://www.unai.mg.gov.br/edital-educacao-2023.pdf',
    status: 'encerrado'
  },
];

// Mock legislation with PDF URLs
const mockLegislacao = [
  { 
    id: '1', 
    titulo: 'Lei Municipal nº 3.083/2017', 
    pdfUrl: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm',
  },
  { 
    id: '2', 
    titulo: 'Instrução Normativa CITP 01/2023', 
    pdfUrl: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm',
  },
];

const TransparencyPortal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnership, setSelectedPartnership] = useState<typeof mockPartnerships[0] | null>(null);

  const filteredPartnerships = mockPartnerships.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.osc.toLowerCase().includes(term) ||
      p.cnpj.includes(term) ||
      p.obj.toLowerCase().includes(term)
    );
  });

  const handleDownloadPDF = (partnership: typeof mockPartnerships[0]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EXTRATO DE PARCERIA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Portal da Transparência - MROSC Unaí/MG', 105, 28, { align: 'center' });
    
    doc.setDrawColor(0, 128, 128);
    doc.line(20, 32, 190, 32);
    
    // Partnership Info
    let y = 45;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA PARCERIA', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const info = [
      ['Organização:', partnership.osc],
      ['CNPJ:', partnership.cnpj],
      ['Tipo:', partnership.type],
      ['Objeto:', partnership.obj],
      ['Valor Total:', partnership.val],
      ['Vigência:', partnership.vigencia],
      ['Responsável:', partnership.responsavel],
      ['Status Prestação de Contas:', partnership.status],
    ];
    
    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, y);
      y += 7;
    });
    
    // Metas
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('METAS:', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const splitMetas = doc.splitTextToSize(partnership.metas, 160);
    doc.text(splitMetas, 20, y);
    y += splitMetas.length * 5 + 10;
    
    // Repasses
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA DE REPASSES:', 20, y);
    y += 7;
    
    partnership.repasses.forEach((repasse) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${repasse.data} - ${repasse.valor}`, 25, y);
      y += 6;
    });
    
    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, y, { align: 'center' });
    doc.text('Este documento é meramente informativo e não possui validade jurídica.', 105, y + 5, { align: 'center' });
    
    doc.save(`Extrato_Parceria_${partnership.osc.replace(/\s+/g, '_')}.pdf`);
  };

  const handleOpenEdital = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenPDF = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground pt-12 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">PORTAL<span className="text-primary-foreground/80">MROSC</span></h1>
            <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest">Prefeitura Municipal de Unaí/MG</p>
          </div>
          <Link to="/" className="text-xs font-black uppercase tracking-widest bg-primary-foreground/10 px-4 py-2 rounded-xl hover:bg-primary-foreground/20 text-primary-foreground">Acesso Restrito</Link>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6 text-primary-foreground">Transparência nas Parcerias</h2>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
            <input 
              type="text" 
              placeholder="Pesquisar OSC, CNPJ ou Objeto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-3xl text-foreground bg-card shadow-xl border-none outline-none focus:ring-4 focus:ring-primary/20" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-16 space-y-12 pb-24">
        <section className="bg-card rounded-[3rem] shadow-2xl overflow-hidden border border-border">
          <div className="p-10 border-b border-border flex justify-between items-center bg-muted/50">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight italic">Extrato de Parcerias (Art. 38 Lei 13.019/14)</h3>
              <p className="text-sm text-muted-foreground font-medium">Dados atualizados em tempo real conforme exigência legal.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Parceira / CNPJ</th>
                  <th className="px-8 py-6">Tipo / Objeto</th>
                  <th className="px-6 py-6 text-center">Valor / Repasses</th>
                  <th className="px-6 py-6 text-center">Situação Contas</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPartnerships.map((p, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-all">
                    <td className="px-8 py-7">
                      <div className="font-black text-foreground">{p.osc}</div>
                      <div className="text-[10px] font-bold text-muted-foreground font-mono">{p.cnpj}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-xs font-bold text-primary">{p.type}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{p.obj}</div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      <div className="font-black text-foreground text-sm">{p.val}</div>
                      <div className="text-[9px] font-bold text-green-600 uppercase">100% Repassado</div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        p.status === 'Aprovada' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : p.status === 'Em Análise' 
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button 
                        onClick={() => setSelectedPartnership(p)}
                        className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-primary/10 rounded-xl"
                        title="Ver detalhes"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPartnerships.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                      Nenhuma parceria encontrada para "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-10 rounded-[3.5rem] shadow-xl border border-border">
            <h4 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
              <FileText className="text-primary" /> Chamamentos Públicos
            </h4>
            <div className="space-y-4">
              {mockChamamentos.map(chamamento => (
                <div 
                  key={chamamento.id} 
                  className="flex justify-between items-center p-6 bg-muted rounded-3xl hover:bg-primary/10 transition-colors cursor-pointer"
                  onClick={() => handleOpenEdital(chamamento.pdfUrl)}
                >
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase">{chamamento.edital}</p>
                    <p className="text-sm font-bold text-foreground">{chamamento.titulo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <ExternalLink className="text-primary" size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card p-10 rounded-[3.5rem] shadow-xl border border-border">
            <h4 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
              <AlertCircle className="text-primary" /> Legislação MROSC
            </h4>
            <div className="space-y-4">
              {mockLegislacao.map(leg => (
                <div key={leg.id} className="p-6 bg-muted rounded-3xl flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">{leg.titulo}</span>
                  <button 
                    onClick={() => handleOpenPDF(leg.pdfUrl)}
                    className="text-[10px] font-black text-primary uppercase flex items-center gap-2 hover:underline"
                  >
                    <FileText size={14} />
                    Ver PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Partnership Details Modal */}
      <Dialog open={!!selectedPartnership} onOpenChange={() => setSelectedPartnership(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Extrato da Parceria</DialogTitle>
          </DialogHeader>
          
          {selectedPartnership && (
            <div className="space-y-6 mt-4">
              <div className="bg-muted p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Organização</p>
                    <p className="font-bold text-foreground">{selectedPartnership.osc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">CNPJ</p>
                    <p className="font-mono text-foreground">{selectedPartnership.cnpj}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Tipo</p>
                    <p className="text-foreground">{selectedPartnership.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Valor Total</p>
                    <p className="font-black text-primary text-lg">{selectedPartnership.val}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Objeto</p>
                  <p className="text-foreground">{selectedPartnership.obj}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Vigência</p>
                    <p className="text-foreground">{selectedPartnership.vigencia}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Responsável</p>
                    <p className="text-foreground">{selectedPartnership.responsavel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Metas</p>
                  <p className="text-foreground">{selectedPartnership.metas}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Situação Prestação de Contas</p>
                  <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
                    selectedPartnership.status === 'Aprovada' 
                      ? 'bg-green-100 text-green-700' 
                      : selectedPartnership.status === 'Em Análise' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedPartnership.status}
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-4">Cronograma de Repasses</p>
                <div className="space-y-2">
                  {selectedPartnership.repasses.map((repasse, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-xl">
                      <span className="text-sm text-foreground">{repasse.data}</span>
                      <span className="font-bold text-primary">{repasse.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => handleDownloadPDF(selectedPartnership)}
                className="w-full gap-2"
              >
                <Download size={16} />
                Baixar Extrato em PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransparencyPortal;
