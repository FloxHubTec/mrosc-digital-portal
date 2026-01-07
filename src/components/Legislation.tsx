import React, { useState, useRef } from 'react';
import { 
  Scale, FileText, Download, Search, 
  Eye, Sparkles, Printer, ArrowLeft, Plus, X,
  Loader2, Edit, ExternalLink, Link2, FileSpreadsheet
} from 'lucide-react';
import { GeminiService } from '../services/gemini';
import { useLegislation } from '@/hooks/useLegislation';
import { usePartnerships } from '@/hooks/usePartnerships';
import { exportToPDF } from '@/utils/exportUtils';
import jsPDF from 'jspdf';

const LegislationModule: React.FC = () => {
  const { legislation, loading, searchTerm, searchLegislation, createLegislation, updateLegislation } = useLegislation();
  const { partnerships } = usePartnerships();
  
  const [selectedDoc, setSelectedDoc] = useState<typeof legislation[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<typeof legislation[0] | null>(null);
  const [saving, setSaving] = useState(false);
  const [linkedPartnership, setLinkedPartnership] = useState<string>('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    numero: '',
    tipo: 'lei_federal',
    ementa: '',
    conteudo: '',
    data_publicacao: '',
  });

  // Static templates that are always available
  const staticTemplates = [
    { 
      id: 'static-1', 
      titulo: 'Lei Federal 13.019/2014', 
      tipo: 'lei_federal',
      numero: '13.019/2014',
      ementa: 'Marco Regulatório das Organizações da Sociedade Civil',
      conteudo: null,
      data_publicacao: '2014-07-31',
      arquivo_url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm',
      ativo: true,
      created_at: '',
    },
    { 
      id: 'static-2', 
      titulo: 'Modelo: Termo de Fomento (Padrão MROSC)', 
      tipo: 'modelo',
      numero: null,
      ementa: 'Modelo padrão para elaboração de Termo de Fomento',
      conteudo: `# TERMO DE FOMENTO Nº [00X]/[ANO]

**CONCEDENTE:** PREFEITURA MUNICIPAL DE UNAÍ/MG
**CONVENIADA:** [NOME DA ORGANIZAÇÃO DA SOCIEDADE CIVIL]

**CLÁUSULA PRIMEIRA - DO OBJETO**
O presente Termo de Fomento tem por objeto a execução do projeto "[NOME DO PROJETO]", conforme detalhado no Plano de Trabalho aprovado, que passa a fazer parte integrante deste instrumento.

**CLÁUSULA SEGUNDA - DAS METAS E RESULTADOS**
A OSC compromete-se a atingir as metas estabelecidas no cronograma de execução física, sob pena de glosa de recursos.

**CLÁUSULA TERCEIRA - DOS RECURSOS FINANCEIROS**
O valor total deste Termo é de R$ [VALOR], a ser repassado em [X] parcelas.

**CLÁUSULA QUARTA - DA PRESTAÇÃO DE CONTAS**
A prestação de contas deverá ser realizada eletronicamente através da plataforma MROSC Digital, contendo o REO (Relatório de Execução do Objeto) e o REFF (Relatório de Execução Físico-Financeira).`,
      data_publicacao: null,
      arquivo_url: null,
      ativo: true,
      created_at: '',
    },
    { 
      id: 'static-3', 
      titulo: 'Modelo: Plano de Trabalho MROSC', 
      tipo: 'modelo',
      numero: null,
      ementa: 'Modelo padrão para elaboração de Plano de Trabalho',
      conteudo: `# PLANO DE TRABALHO - MROSC UNAÍ

1. **DADOS DA OSC**
   CNPJ: [CNPJ]
   Responsável Legal: [NOME]

2. **DESCRIÇÃO DO PROJETO**
   [Descrever brevemente o interesse público e recíproco]

3. **METAS E INDICADORES**
   Meta 1: [Descrição] - Indicador: [Unid. Medida]
   Meta 2: [Descrição] - Indicador: [Unid. Medida]

4. **CRONOGRAMA DE DESEMBOLSO**
   Parcela 1: R$ [VALOR]
   Parcela 2: R$ [VALOR]`,
      data_publicacao: null,
      arquivo_url: null,
      ativo: true,
      created_at: '',
    },
  ];

  const allDocs = [...staticTemplates, ...legislation];

  const handleGenerateAI = async (doc: typeof legislation[0]) => {
    setIsGenerating(true);
    try {
      const result = await GeminiService.generateLegalMinute(doc.titulo, "[OSC EXEMPLO]", "[OBJETO DO PROJETO]");
      setAiContent(result || "Não foi possível gerar a minuta.");
    } catch (err) {
      setAiContent("Erro na conexão com a inteligência jurídica.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      numero: '',
      tipo: 'lei_federal',
      ementa: '',
      conteudo: '',
      data_publicacao: '',
    });
    setEditingDoc(null);
    setLinkedPartnership('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const docData = {
      titulo: formData.titulo,
      numero: formData.numero || undefined,
      tipo: formData.tipo,
      ementa: formData.ementa || undefined,
      conteudo: formData.conteudo || undefined,
      data_publicacao: formData.data_publicacao || undefined,
    };

    if (editingDoc) {
      await updateLegislation(editingDoc.id, docData);
    } else {
      await createLegislation(docData);
    }

    resetForm();
    setShowModal(false);
    setSaving(false);
  };

  const handleEdit = (doc: typeof legislation[0]) => {
    setEditingDoc(doc);
    setFormData({
      titulo: doc.titulo,
      numero: doc.numero || '',
      tipo: doc.tipo || 'lei_federal',
      ementa: doc.ementa || '',
      conteudo: doc.conteudo || '',
      data_publicacao: doc.data_publicacao || '',
    });
    setShowModal(true);
  };

  const getTypeLabel = (tipo: string | null) => {
    const labels: Record<string, string> = {
      'lei_federal': 'Federal',
      'lei_municipal': 'Municipal',
      'decreto': 'Decreto',
      'portaria': 'Portaria',
      'modelo': 'Modelo',
      'manual': 'Manual',
    };
    return labels[tipo || ''] || tipo || 'Documento';
  };

  const getTypeColor = (tipo: string | null) => {
    if (tipo?.includes('modelo')) return 'bg-info/10 text-info';
    if (tipo?.includes('manual')) return 'bg-success/10 text-success';
    if (tipo?.includes('federal')) return 'bg-primary/10 text-primary';
    if (tipo?.includes('municipal')) return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  const handlePrint = () => {
    const content = aiContent || selectedDoc?.conteudo || '';
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${selectedDoc?.titulo || 'Documento'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
            pre { white-space: pre-wrap; font-family: inherit; }
            .header { margin-bottom: 30px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedDoc?.titulo || 'Documento'}</h1>
            <p class="meta">${getTypeLabel(selectedDoc?.tipo || null)} • ${selectedDoc?.numero || 'Sem número'}</p>
            <p class="meta">Impresso em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
          <pre>${content}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadDOCX = () => {
    const content = aiContent || selectedDoc?.conteudo || '';
    const title = selectedDoc?.titulo || 'Documento';
    
    // Create a simple text file with .doc extension (compatible with Word)
    const header = `${title}\n${'='.repeat(title.length)}\n\n${getTypeLabel(selectedDoc?.tipo || null)} • ${selectedDoc?.numero || 'Sem número'}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n${'─'.repeat(50)}\n\n`;
    const fullContent = header + content;
    
    const blob = new Blob([fullContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    link.click();
  };

  const handleDownloadPDF = () => {
    const content = aiContent || selectedDoc?.conteudo || '';
    const title = selectedDoc?.titulo || 'Documento';
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${getTypeLabel(selectedDoc?.tipo || null)} • ${selectedDoc?.numero || 'Sem número'}`, 14, 28);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 34);
    
    // Content
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 14, 45);
    
    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedDoc && (selectedDoc.conteudo || aiContent)) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <button 
            onClick={() => { setSelectedDoc(null); setAiContent(null); }} 
            className="flex items-center gap-2 text-primary font-black text-xs uppercase hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Voltar para Biblioteca
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-primary hover:bg-muted transition-all"
              title="Imprimir documento"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-primary hover:bg-muted transition-all"
              title="Baixar PDF"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={handleDownloadDOCX}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <Download size={16} /> Baixar .DOC
            </button>
          </div>
        </header>

        <div className="bg-card rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-border p-8 md:p-12 max-w-4xl mx-auto">
          <div className="mb-10 pb-8 border-b border-border flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">{selectedDoc.titulo}</h3>
              <p className="text-xs text-primary font-bold uppercase tracking-widest mt-2">
                {getTypeLabel(selectedDoc.tipo)} • {selectedDoc.numero || 'Sem número'}
              </p>
            </div>
            {selectedDoc.tipo?.includes('modelo') && (
              <button 
                onClick={() => handleGenerateAI(selectedDoc)}
                disabled={isGenerating}
                className="px-4 py-2 bg-info/10 text-info rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-info/20 transition-all disabled:opacity-50"
              >
                <Sparkles size={14} /> 
                {isGenerating ? 'Processando IA...' : 'Refinar com IA'}
              </button>
            )}
          </div>
          
          <div className="prose prose-teal max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed text-sm bg-muted/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border">
              {aiContent || selectedDoc.conteudo}
            </pre>
          </div>
          
          {aiContent && (
            <div className="mt-8 p-6 bg-info/10 border border-info/20 rounded-3xl flex items-start gap-4">
              <Sparkles size={20} className="text-info shrink-0" />
              <p className="text-xs text-info font-medium italic">
                Este conteúdo foi gerado/refinado via Inteligência Artificial baseado na Lei 13.019/14. Revise antes de oficializar.
              </p>
            </div>
          )}

          {/* Vinculação com parceria */}
          <div className="mt-8 p-6 bg-muted rounded-2xl">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              <Link2 size={12} className="inline mr-1" />
              Vincular a Parceria
            </label>
            <select
              value={linkedPartnership}
              onChange={(e) => setLinkedPartnership(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm appearance-none cursor-pointer"
            >
              <option value="">Selecione uma parceria...</option>
              {partnerships.map(p => (
                <option key={p.id} value={p.id}>
                  {p.numero_termo || 'S/N'} - {p.osc?.razao_social}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <Scale size={14} />
            <span>Biblioteca Legal e Instruções (Item 37 POC)</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Legislação e Modelos</h2>
          <p className="text-muted-foreground font-medium">Modelos editáveis e minutas para formalização de parcerias MROSC.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl"
        >
          <Plus size={18} /> Novo Documento
        </button>
      </header>

      <div className="relative mb-8 md:mb-12">
        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-primary" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => searchLegislation(e.target.value)}
          placeholder="Pesquisar lei, decreto ou modelo de documento..." 
          className="w-full pl-14 md:pl-16 pr-6 py-6 md:py-8 bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-none outline-none focus:ring-8 focus:ring-primary/10 text-base md:text-lg transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {allDocs.map((doc) => (
          <div key={doc.id} className="bg-card p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-border shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${getTypeColor(doc.tipo)}`}>
                  <FileText size={24} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getTypeColor(doc.tipo)}`}>
                    {getTypeLabel(doc.tipo)}
                  </span>
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-black text-foreground mb-2 leading-tight">{doc.titulo}</h4>
              {doc.ementa && (
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.ementa}</p>
              )}
              {doc.numero && (
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-3">{doc.numero}</p>
              )}
            </div>
            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-border flex gap-3">
              {doc.conteudo ? (
                <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 py-3 md:py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/10"
                >
                  <Eye size={14} /> Visualizar
                </button>
              ) : doc.arquivo_url ? (
                <a 
                  href={doc.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 md:py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <ExternalLink size={14} /> Acessar
                </a>
              ) : (
                <button className="flex-1 py-3 md:py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  <Download size={14} /> Download
                </button>
              )}
              {!doc.id.startsWith('static-') && (
                <button
                  onClick={() => handleEdit(doc)}
                  className="p-3 md:p-4 bg-card border border-border text-muted-foreground rounded-2xl hover:bg-muted transition-all"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 md:mt-20 bg-gradient-to-br from-info/90 to-primary/90 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-primary-foreground relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-4">
            <Sparkles className="text-primary-foreground/70" />
            IA Jurídica Unaí
          </h3>
          <p className="text-primary-foreground/70 font-medium leading-relaxed mb-8 md:mb-10">
            Gere rascunhos de minutas jurídicas personalizadas para cada OSC em segundos. O sistema utiliza IA para adaptar o objeto do plano de trabalho às cláusulas obrigatórias da Lei 13.019/14.
          </p>
          <button className="px-8 md:px-10 py-5 md:py-6 bg-card text-primary rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            Acessar Assistente de Redação
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">
                {editingDoc ? 'Editar Documento' : 'Novo Documento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Lei Municipal 3.083/2017"
                  required
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Ex: 3.083/2017"
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="lei_federal">Lei Federal</option>
                    <option value="lei_municipal">Lei Municipal</option>
                    <option value="decreto">Decreto</option>
                    <option value="portaria">Portaria</option>
                    <option value="modelo">Modelo</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Data de Publicação
                </label>
                <input
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Ementa
                </label>
                <textarea
                  value={formData.ementa}
                  onChange={(e) => setFormData({ ...formData, ementa: e.target.value })}
                  placeholder="Resumo do documento..."
                  rows={2}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Conteúdo / Texto Integral
                </label>
                <textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Cole o texto do documento aqui..."
                  rows={6}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold text-sm hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {editingDoc ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegislationModule;
