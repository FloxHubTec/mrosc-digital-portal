
import React, { useState } from 'react';
import { 
  Scale, FileText, Download, Search, 
  Eye, Sparkles, Printer, Copy, ArrowLeft
} from 'lucide-react';
import { GeminiService } from '../services/gemini';

interface DocumentModel {
  id: string;
  title: string;
  category: 'Federal' | 'Municipal' | 'Modelo' | 'Manual';
  type: 'PDF' | 'DOCX' | 'XLSX';
  content?: string;
}

const LegislationModule: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);

  const docs: DocumentModel[] = [
    { id: '1', title: 'Lei Federal 13.019/2014', category: 'Federal', type: 'PDF' },
    { id: '2', title: 'Lei Municipal 3.083/2017 - Unaí/MG', category: 'Municipal', type: 'PDF' },
    { 
      id: '3', 
      title: 'Modelo: Termo de Fomento (Padrão MROSC)', 
      category: 'Modelo', 
      type: 'DOCX',
      content: `
# TERMO DE FOMENTO Nº [00X]/[ANO]

**CONCEDENTE:** PREFEITURA MUNICIPAL DE UNAÍ/MG
**CONVENIADA:** [NOME DA ORGANIZAÇÃO DA SOCIEDADE CIVIL]

**CLÁUSULA PRIMEIRA - DO OBJETO**
O presente Termo de Fomento tem por objeto a execução do projeto "[NOME DO PROJETO]", conforme detalhado no Plano de Trabalho aprovado, que passa a fazer parte integrante deste instrumento.

**CLÁUSULA SEGUNDA - DAS METAS E RESULTADOS**
A OSC compromete-se a atingir as metas estabelecidas no cronograma de execução física, sob pena de glosa de recursos.

**CLÁUSULA TERCEIRA - DOS RECURSOS FINANCEIROS**
O valor total deste Termo é de R$ [VALOR], a ser repassado em [X] parcelas.

**CLÁUSULA QUARTA - DA PRESTAÇÃO DE CONTAS**
A prestação de contas deverá ser realizada eletronicamente através da plataforma MROSC Digital, contendo o REO (Relatório de Execução do Objeto) e o REFF (Relatório de Execução Físico-Financeira).
      `
    },
    { 
      id: '4', 
      title: 'Modelo: Plano de Trabalho MROSC', 
      category: 'Modelo', 
      type: 'DOCX',
      content: `
# PLANO DE TRABALHO - MROSC UNAÍ

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
   Parcela 2: R$ [VALOR]
      `
    },
    { id: '5', title: 'Modelo: Relatório REO/REFF (Excel)', category: 'Modelo', type: 'XLSX' },
    { id: '6', title: 'Manual CITP: Gestão de Parcerias Unaí', category: 'Manual', type: 'PDF' },
  ];

  const handleGenerateAI = async (doc: DocumentModel) => {
    setIsGenerating(true);
    try {
      const result = await GeminiService.generateLegalMinute(doc.title, "[OSC EXEMPRO]", "[OBJETO DO PROJETO]");
      setAiContent(result || "Não foi possível gerar a minuta.");
    } catch (err) {
      setAiContent("Erro na conexão com a inteligência jurídica.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedDoc && (selectedDoc.content || aiContent)) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
        <header className="flex justify-between items-center">
          <button 
            onClick={() => { setSelectedDoc(null); setAiContent(null); }} 
            className="flex items-center gap-2 text-primary font-black text-xs uppercase hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Voltar para Biblioteca
          </button>
          <div className="flex gap-3">
             <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-primary transition-all">
                <Printer size={18} />
             </button>
             <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2">
                <Download size={16} /> Baixar .DOCX
             </button>
          </div>
        </header>

        <div className="bg-card rounded-[3.5rem] shadow-2xl border border-border p-12 max-w-4xl mx-auto">
          <div className="mb-10 pb-8 border-b border-border flex justify-between items-start">
             <div>
                <h3 className="text-3xl font-black text-foreground tracking-tighter">{selectedDoc.title}</h3>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mt-2">{selectedDoc.category} • Versão Oficial</p>
             </div>
             {selectedDoc.category === 'Modelo' && (
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
             <pre className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed text-sm bg-muted/50 p-8 rounded-[2rem] border border-border">
                {aiContent || selectedDoc.content}
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <Scale size={14} />
            <span>Biblioteca Legal e Instruções (Item 37 POC)</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Legislação e Modelos</h2>
          <p className="text-muted-foreground font-medium">Modelos editáveis e minutas para formalização de parcerias MROSC.</p>
        </div>
      </header>

      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
        <input 
          type="text" 
          placeholder="Pesquisar lei, decreto ou modelo de documento..." 
          className="w-full pl-16 pr-6 py-8 bg-card rounded-[2.5rem] shadow-xl border-none outline-none focus:ring-8 focus:ring-primary/10 text-lg transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-card p-10 rounded-[3rem] border border-border shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${
                    doc.category === 'Modelo' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[9px] font-black uppercase">{doc.type}</span>
                  </div>
               </div>
               <h4 className="text-xl font-black text-foreground mb-2 leading-tight">{doc.title}</h4>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">{doc.category}</p>
            </div>
            <div className="mt-10 pt-8 border-t border-border flex gap-3">
               {doc.content ? (
                 <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/10"
                 >
                    <Eye size={14} /> Visualizar
                 </button>
               ) : (
                 <button className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    <Download size={14} /> Download
                 </button>
               )}
               {doc.category === 'Modelo' && (
                  <button className="p-4 bg-card border border-border text-primary rounded-2xl hover:bg-muted transition-all">
                     <Copy size={16} />
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-gradient-to-br from-info/90 to-primary/90 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles size={200} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-black mb-4 flex items-center gap-4">
              <Sparkles className="text-white/70" />
              IA Jurídica Unaí
            </h3>
            <p className="text-white/70 font-medium leading-relaxed mb-10">
              Gere rascunhos de minutas juridicas personalizadas para cada OSC em segundos. O sistema utiliza IA para adaptar o objeto do plano de trabalho às cláusulas obrigatórias da Lei 13.019/14.
            </p>
            <button className="px-10 py-6 bg-white text-primary rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
              Acessar Assistente de Redação
            </button>
         </div>
      </div>
    </div>
  );
};

export default LegislationModule;
