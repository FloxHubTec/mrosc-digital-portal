import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight, Edit3, Settings, ShieldCheck, Download, ArrowLeft, Save, Eye, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ManualTopic {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  content: string;
  steps: string[];
}

const ManualModule: React.FC = () => {
  const { profile } = useAuth();
  
  // Check if user is OSC
  const isOSC = profile?.role === UserRole.OSC_LEGAL || profile?.role === UserRole.OSC_USER;
  
  const [selectedTopic, setSelectedTopic] = useState<ManualTopic | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContent, setEditingContent] = useState({ title: '', content: '', steps: '' });

  const [topics, setTopics] = useState<ManualTopic[]>([
    { 
      id: '1', 
      title: 'Processamento de Emendas Parlamentares', 
      category: 'Operacional', 
      icon: Settings,
      content: 'Este guia detalha o processo completo de cadastro, acompanhamento e execução de emendas parlamentares no sistema MROSC.',
      steps: [
        '1. Acesse o módulo "Emendas" no menu lateral',
        '2. Clique em "Nova Emenda" para cadastrar',
        '3. Preencha todos os campos obrigatórios: número, autor, valor e ano',
        '4. Selecione a OSC beneficiária se aplicável',
        '5. Anexe os documentos de indicação',
        '6. Acompanhe o status da emenda no painel principal',
        '7. Vincule a emenda a uma parceria quando aprovada',
      ]
    },
    { 
      id: '2', 
      title: 'Prestação de Contas (REO/REFF)', 
      category: 'Compliance', 
      icon: ShieldCheck,
      content: 'Procedimentos para elaboração e submissão dos Relatórios de Execução do Objeto (REO) e Relatório de Execução Físico-Financeira (REFF).',
      steps: [
        '1. Acesse a parceria no módulo "Parcerias"',
        '2. Clique em "Prestação de Contas"',
        '3. Selecione o período de referência',
        '4. Preencha o REO com as atividades executadas',
        '5. Anexe as evidências (fotos, listas de presença, etc.)',
        '6. Preencha o REFF com os dados financeiros',
        '7. Anexe os comprovantes de despesas',
        '8. Submeta para análise do gestor',
      ]
    },
    { 
      id: '3', 
      title: 'Chamamento e Seleção Pública', 
      category: 'Fluxo Legal', 
      icon: BookOpen,
      content: 'Guia completo do processo de chamamento público, desde a publicação do edital até a celebração do termo de parceria.',
      steps: [
        '1. Crie o edital no módulo "Chamamentos"',
        '2. Defina objeto, critérios e cronograma',
        '3. Publique o edital e aguarde inscrições',
        '4. Analise as propostas na aba "Seleção"',
        '5. Realize a habilitação das OSCs',
        '6. Avalie tecnicamente as propostas',
        '7. Publique o resultado preliminar',
        '8. Analise recursos se houver',
        '9. Publique resultado definitivo',
        '10. Convoque a OSC selecionada',
      ]
    },
    { 
      id: '4', 
      title: 'Manual Master da Prefeitura', 
      category: 'Admin', 
      icon: Edit3,
      content: 'Instruções gerais para o Administrador Master do sistema, incluindo configurações, gestão de usuários e personalização.',
      steps: [
        '1. Gerencie usuários no módulo "Usuários"',
        '2. Configure permissões por perfil',
        '3. Personalize alertas e notificações',
        '4. Configure integrações externas',
        '5. Monitore logs de auditoria',
        '6. Gere relatórios gerenciais',
        '7. Mantenha o manual atualizado',
      ]
    },
    { 
      id: '5', 
      title: 'Como Enviar Evidências Fotográficas', 
      category: 'OSC', 
      icon: ShieldCheck,
      content: 'Guia para envio de evidências fotográficas obrigatórias: fotos de antes, durante e depois das atividades executadas.',
      steps: [
        '1. Acesse o módulo "Prestação de Contas"',
        '2. Selecione a parceria desejada',
        '3. Clique na aba "REO (Execução do Objeto)"',
        '4. Clique no botão "Upload de Arquivos"',
        '5. Selecione no mínimo 3 imagens: ANTES, DURANTE e DEPOIS',
        '6. Cada imagem deve ter no máximo 10MB',
        '7. Formatos aceitos: JPG, PNG, PDF',
        '8. Aguarde o upload e confirmação do sistema',
        '9. As evidências serão analisadas pelo gestor da parceria',
      ]
    },
  ]);

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditManual = () => {
    if (!selectedTopic) {
      toast.error('Selecione um tópico para editar');
      return;
    }
    setEditingContent({
      title: selectedTopic.title,
      content: selectedTopic.content,
      steps: selectedTopic.steps.join('\n'),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTopic) return;
    
    const updatedTopics = topics.map(t => {
      if (t.id === selectedTopic.id) {
        return {
          ...t,
          title: editingContent.title,
          content: editingContent.content,
          steps: editingContent.steps.split('\n').filter(s => s.trim()),
        };
      }
      return t;
    });
    
    setTopics(updatedTopics);
    setSelectedTopic({
      ...selectedTopic,
      title: editingContent.title,
      content: editingContent.content,
      steps: editingContent.steps.split('\n').filter(s => s.trim()),
    });
    setShowEditModal(false);
    toast.success('Manual atualizado com sucesso!');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Manual do Sistema MROSC', 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Prefeitura Municipal de Unaí/MG', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, yPos, { align: 'center' });
    yPos += 20;
    
    // Topics
    topics.forEach((topic, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${topic.title}`, 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Categoria: ${topic.category}`, 14, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      const contentLines = doc.splitTextToSize(topic.content, 180);
      doc.text(contentLines, 14, yPos);
      yPos += contentLines.length * 5 + 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Passo a Passo:', 14, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      topic.steps.forEach(step => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const stepLines = doc.splitTextToSize(step, 175);
        doc.text(stepLines, 18, yPos);
        yPos += stepLines.length * 5 + 2;
      });
      
      yPos += 10;
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} • Sistema MROSC Unaí/MG`, 105, 290, { align: 'center' });
    }
    
    doc.save('manual-mrosc-unai.pdf');
    toast.success('Manual baixado em PDF!');
  };

  const handleOpenGuide = (topic: ManualTopic) => {
    setSelectedTopic(topic);
    setShowGuideModal(true);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <BookOpen size={14} />
            <span>Capacitação e Suporte</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Manual do Sistema</h2>
          <p className="text-muted-foreground font-medium">Instruções de uso editáveis pelo Administrador Master.</p>
        </div>
        <div className="flex gap-3">
          {/* Botão Editar Manual - OCULTO para OSC */}
          {!isOSC && (
            <Button 
              variant="outline" 
              onClick={handleEditManual}
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase"
            >
              <Edit3 size={16} className="mr-2" />
              Editar Manual
            </Button>
          )}
          <Button 
            onClick={handleDownloadPDF}
            className="px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-xl"
          >
            <Download size={16} className="mr-2" />
            Baixar em PDF
          </Button>
        </div>
      </header>

      <div className="relative mb-12">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-primary" size={24} />
        <input 
          type="text" 
          placeholder="Pesquisar instrução ou base legal..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-20 pr-8 py-10 bg-card rounded-[3rem] text-xl font-medium shadow-xl border-none outline-none focus:ring-8 focus:ring-primary/10 transition-all" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTopics.map((t) => (
          <div 
            key={t.id} 
            className={`bg-card p-12 rounded-[4rem] border shadow-sm hover:shadow-xl transition-all cursor-pointer group ${selectedTopic?.id === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            onClick={() => setSelectedTopic(t)}
          >
             <div className="flex items-center gap-6 mb-8">
                <div className="p-5 bg-primary/10 text-primary rounded-[2rem] group-hover:scale-110 transition-transform">
                   <t.icon size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-foreground tracking-tight">{t.title}</h3>
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t.category}</span>
                </div>
             </div>
             <p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed">{t.content}</p>
             <button 
               onClick={(e) => { e.stopPropagation(); handleOpenGuide(t); }}
               className="flex items-center gap-2 text-[10px] font-black text-primary uppercase group-hover:translate-x-2 transition-transform"
             >
                Acessar Guia Passo a Passo <ChevronRight size={14} />
             </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tópico do Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-bold mb-2 block">Título</label>
              <Input 
                value={editingContent.title}
                onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-2 block">Descrição</label>
              <Textarea 
                value={editingContent.content}
                onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-2 block">Passos (um por linha)</label>
              <Textarea 
                value={editingContent.steps}
                onChange={(e) => setEditingContent({ ...editingContent, steps: e.target.value })}
                rows={8}
                placeholder="1. Primeiro passo&#10;2. Segundo passo&#10;3. Terceiro passo"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step by Step Guide Modal */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTopic?.icon && <selectedTopic.icon size={24} />}
              {selectedTopic?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="p-4 bg-muted rounded-2xl">
              <p className="text-sm text-muted-foreground">{selectedTopic?.content}</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Eye size={18} />
                Guia Passo a Passo
              </h4>
              <div className="space-y-3">
                {selectedTopic?.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm pt-1">{step.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowGuideModal(false)}>
                <X size={16} className="mr-2" />
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualModule;
