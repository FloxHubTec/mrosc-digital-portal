import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { usePublicCalls } from '@/hooks/usePublicCalls';
import { useOSCs } from '@/hooks/useOSCs';
import { supabase } from '@/integrations/supabase/client';
import ExportDropdown from '@/components/ui/ExportDropdown';
import { exportData, exportToPDF } from '@/utils/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ClipboardCheck, FileText, Users, Trophy, AlertCircle, Search, 
  Plus, Star, ThumbsUp, ThumbsDown, Eye, CheckCircle, Upload,
  XCircle, Clock, BarChart3, Mail, FileDown, Megaphone, Gavel,
  Trash2, File, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    inscrita: { color: 'bg-blue-100 text-blue-800', label: 'Inscrita' },
    habilitada: { color: 'bg-emerald-100 text-emerald-800', label: 'Habilitada' },
    inabilitada: { color: 'bg-red-100 text-red-800', label: 'Inabilitada' },
    avaliada: { color: 'bg-purple-100 text-purple-800', label: 'Avaliada' },
    selecionada: { color: 'bg-green-100 text-green-800', label: 'Selecionada' },
    desclassificada: { color: 'bg-gray-100 text-gray-800', label: 'Desclassificada' },
    convocada: { color: 'bg-indigo-100 text-indigo-800', label: 'Convocada' },
    diligencia: { color: 'bg-orange-100 text-orange-800', label: 'Em Diligência' },
  };
  const { color, label } = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return <Badge className={`${color} font-semibold`}>{label}</Badge>;
};

const ProposalSelectionModule: React.FC = () => {
  const { proposals, loading, createProposal, updateProposal, evaluateProposal, submitRecurso, respondRecurso, calculateRankings, getStatsByStatus, refetch } = useProposals();
  const { publicCalls } = usePublicCalls();
  const { oscs } = useOSCs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [callFilter, setCallFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDiligenciaModal, setShowDiligenciaModal] = useState(false);
  const [showAtaModal, setShowAtaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    public_call_id: '',
    osc_id: '',
    titulo: '',
    descricao: '',
    valor_solicitado: '',
  });
  const [evalData, setEvalData] = useState({ pontuacao: '', parecer: '' });
  const [recursoData, setRecursoData] = useState({ texto: '', resposta: '', deferido: false });
  const [diligenciaText, setDiligenciaText] = useState('');
  const [ataText, setAtaText] = useState('');

  const stats = getStatsByStatus();

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.osc?.razao_social?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCall = callFilter === 'all' || p.public_call_id === callFilter;
    return matchesSearch && matchesStatus && matchesCall;
  });

  const handleCreate = async () => {
    if (!formData.public_call_id || !formData.osc_id || !formData.titulo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const result = await createProposal({
      ...formData,
      valor_solicitado: parseFloat(formData.valor_solicitado) || 0,
    });
    if (result) {
      toast.success('Proposta inscrita com sucesso!');
      setShowCreateModal(false);
      setFormData({ public_call_id: '', osc_id: '', titulo: '', descricao: '', valor_solicitado: '' });
    }
  };

  const handleEvaluate = async () => {
    if (!selectedProposal || !evalData.pontuacao) return;
    const result = await evaluateProposal(selectedProposal.id, parseFloat(evalData.pontuacao), evalData.parecer);
    if (result) {
      toast.success('Proposta avaliada com sucesso!');
      setShowEvalModal(false);
      setEvalData({ pontuacao: '', parecer: '' });
    }
  };

  const handleRecursoResponse = async (deferido: boolean) => {
    if (!selectedProposal || !recursoData.resposta) return;
    const result = await respondRecurso(selectedProposal.id, recursoData.resposta, deferido);
    if (result) {
      toast.success(deferido ? 'Recurso deferido!' : 'Recurso indeferido!');
      setShowRecursoModal(false);
      setRecursoData({ texto: '', resposta: '', deferido: false });
    }
  };

  const handleConvocar = async (proposal: Proposal) => {
    const result = await updateProposal(proposal.id, { status: 'convocada' });
    if (result) {
      toast.success('OSC convocada! Envie comunicação oficial.');
    }
  };

  const handleDiligencia = async () => {
    if (!selectedProposal || !diligenciaText) return;
    const result = await updateProposal(selectedProposal.id, { 
      status: 'diligencia',
      parecer_tecnico: `DILIGÊNCIA: ${diligenciaText}\n\n${selectedProposal.parecer_tecnico || ''}`
    });
    if (result) {
      toast.success('Diligência registrada!');
      setShowDiligenciaModal(false);
      setDiligenciaText('');
    }
  };

  const handlePublicarResultado = async () => {
    if (!callFilter || callFilter === 'all') {
      toast.error('Selecione um chamamento específico');
      return;
    }
    await calculateRankings(callFilter);
    toast.success('Rankings calculados e resultado publicado!');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedProposal) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [...(selectedProposal.documentos_urls || [])];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedProposal.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`proposals/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`proposals/${fileName}`);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      await updateProposal(selectedProposal.id, { 
        documentos_urls: uploadedUrls as any 
      });

      toast.success(`${files.length} documento(s) enviado(s) com sucesso!`);
      setSelectedProposal({ ...selectedProposal, documentos_urls: uploadedUrls });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar documento: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (url: string) => {
    if (!selectedProposal) return;
    
    try {
      const newUrls = selectedProposal.documentos_urls.filter(u => u !== url);
      await updateProposal(selectedProposal.id, { documentos_urls: newUrls as any });
      setSelectedProposal({ ...selectedProposal, documentos_urls: newUrls });
      toast.success('Documento removido!');
    } catch (error: any) {
      toast.error('Erro ao remover documento');
    }
  };

  const getFileNameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const generateAta = () => {
    const chamamento = publicCalls.find(c => c.id === callFilter);
    if (!chamamento || callFilter === 'all') {
      toast.error('Selecione um chamamento para gerar a ata');
      return;
    }

    const doc = new jsPDF();
    const propostas = filteredProposals.filter(p => p.public_call_id === callFilter);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ATA DA COMISSÃO DE SELEÇÃO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Chamamento Público: ${chamamento.numero_edital}`, 14, 35);
    doc.text(`Objeto: ${chamamento.objeto}`, 14, 42);
    doc.text(`Data: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, 49);
    
    doc.text('Aos dias acima referidos, reuniu-se a Comissão de Seleção para análise', 14, 62);
    doc.text('das propostas inscritas no chamamento público em epígrafe.', 14, 69);
    
    doc.text('PROPOSTAS ANALISADAS:', 14, 82);
    
    autoTable(doc, {
      startY: 88,
      head: [['#', 'OSC', 'Título', 'Valor', 'Pontuação', 'Status']],
      body: propostas.map((p, i) => [
        (i + 1).toString(),
        p.osc?.razao_social || '-',
        p.titulo,
        p.valor_solicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        p.pontuacao_total.toString(),
        p.status
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    if (ataText) {
      doc.text('DELIBERAÇÕES:', 14, finalY);
      const lines = doc.splitTextToSize(ataText, 180);
      doc.text(lines, 14, finalY + 7);
    }
    
    doc.text('_______________________________', 30, finalY + 50);
    doc.text('Presidente da Comissão', 45, finalY + 57);
    
    doc.text('_______________________________', 120, finalY + 50);
    doc.text('Membro', 145, finalY + 57);
    
    doc.save(`ata-selecao-${chamamento.numero_edital}.pdf`);
    toast.success('Ata gerada com sucesso!');
    setShowAtaModal(false);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const headers = ['Ranking', 'Título', 'OSC', 'Chamamento', 'Valor', 'Pontuação', 'Status', 'Data Inscrição'];
    const data = filteredProposals.map(p => [
      p.ranking?.toString() || '-',
      p.titulo,
      p.osc?.razao_social || '-',
      p.public_call?.numero_edital || '-',
      p.valor_solicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      p.pontuacao_total.toString(),
      p.status,
      p.data_inscricao ? new Date(p.data_inscricao).toLocaleDateString('pt-BR') : '-',
    ]);
    exportData(format, { filename: 'propostas-selecao', title: 'Seleção de Propostas - MROSC Unaí/MG', headers, data });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Seleção de Propostas</h1>
          <p className="text-muted-foreground text-sm">Gerencie inscrições, avaliações, recursos e resultados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportDropdown onExport={handleExport} />
          <Button variant="outline" onClick={() => setShowAtaModal(true)} className="gap-2">
            <Gavel size={16} /> Gerar Ata
          </Button>
          <Button variant="outline" onClick={handlePublicarResultado} className="gap-2">
            <Megaphone size={16} /> Publicar Resultado
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} /> Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Inscrever Proposta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Select value={formData.public_call_id} onValueChange={v => setFormData({ ...formData, public_call_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o Chamamento *" /></SelectTrigger>
                  <SelectContent>
                    {publicCalls.filter(c => c.status === 'aberto').map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.numero_edital} - {c.objeto?.substring(0, 50)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.osc_id} onValueChange={v => setFormData({ ...formData, osc_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a OSC *" /></SelectTrigger>
                  <SelectContent>
                    {oscs.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.razao_social} ({o.cnpj})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Título da Proposta *" 
                  value={formData.titulo} 
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })} 
                />
                <Textarea 
                  placeholder="Descrição detalhada da proposta" 
                  value={formData.descricao} 
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                />
                <Input 
                  type="number" 
                  placeholder="Valor Solicitado (R$)" 
                  value={formData.valor_solicitado} 
                  onChange={e => setFormData({ ...formData, valor_solicitado: e.target.value })} 
                />
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Upload size={14} /> Upload de documentos disponível após inscrição
                  </p>
                </div>
                <Button onClick={handleCreate} className="w-full">Inscrever Proposta</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-black text-blue-800">{stats.inscrita}</p>
            <p className="text-[10px] text-blue-600">Inscritas</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xl font-black text-emerald-800">{stats.habilitada}</p>
            <p className="text-[10px] text-emerald-600">Habilitadas</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 text-center">
            <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-xl font-black text-red-800">{stats.inabilitada}</p>
            <p className="text-[10px] text-red-600">Inabilitadas</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-center">
            <Star className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-black text-purple-800">{stats.avaliada}</p>
            <p className="text-[10px] text-purple-600">Avaliadas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <Trophy className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-black text-green-800">{stats.selecionada}</p>
            <p className="text-[10px] text-green-600">Selecionadas</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-3 text-center">
            <Mail className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-xl font-black text-indigo-800">{proposals.filter(p => p.status === 'convocada').length}</p>
            <p className="text-[10px] text-indigo-600">Convocadas</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-3 text-center">
            <AlertCircle className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xl font-black text-orange-800">{proposals.filter(p => p.recurso_status === 'pendente').length}</p>
            <p className="text-[10px] text-orange-600">Recursos</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3 text-center">
            <BarChart3 className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-black text-gray-800">{stats.total}</p>
            <p className="text-[10px] text-gray-600">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Buscar por título ou OSC..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={callFilter} onValueChange={setCallFilter}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Chamamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Chamamentos</SelectItem>
                {publicCalls.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.numero_edital}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="inscrita">Inscrita</SelectItem>
                <SelectItem value="habilitada">Habilitada</SelectItem>
                <SelectItem value="inabilitada">Inabilitada</SelectItem>
                <SelectItem value="avaliada">Avaliada</SelectItem>
                <SelectItem value="selecionada">Selecionada</SelectItem>
                <SelectItem value="convocada">Convocada</SelectItem>
                <SelectItem value="diligencia">Em Diligência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck size={20} /> Propostas ({filteredProposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>OSC</TableHead>
                <TableHead>Chamamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Pontuação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma proposta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map(proposal => (
                  <TableRow key={proposal.id} className="group">
                    <TableCell>
                      {proposal.ranking ? (
                        <Badge variant={proposal.ranking === 1 ? 'default' : proposal.ranking <= 3 ? 'secondary' : 'outline'}>
                          #{proposal.ranking}
                        </Badge>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <button 
                        className="font-medium text-left hover:text-primary transition-colors"
                        onClick={() => { setSelectedProposal(proposal); setShowDetailModal(true); }}
                      >
                        {proposal.titulo}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">{proposal.osc?.razao_social || '-'}</TableCell>
                    <TableCell className="text-sm">{proposal.public_call?.numero_edital || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {proposal.valor_solicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="font-semibold">{proposal.pontuacao_total}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={proposal.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedProposal(proposal); setShowDetailModal(true); }} title="Ver detalhes">
                          <Eye size={14} />
                        </Button>
                        {proposal.status === 'inscrita' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => updateProposal(proposal.id, { status: 'habilitada' })} title="Habilitar">
                              <ThumbsUp size={14} className="text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateProposal(proposal.id, { status: 'inabilitada' })} title="Inabilitar">
                              <ThumbsDown size={14} className="text-red-600" />
                            </Button>
                          </>
                        )}
                        {proposal.status === 'habilitada' && (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedProposal(proposal); setShowEvalModal(true); }} title="Avaliar">
                            <Star size={14} className="text-purple-600" />
                          </Button>
                        )}
                        {proposal.status === 'avaliada' && (
                          <Button size="sm" variant="ghost" onClick={() => updateProposal(proposal.id, { status: 'selecionada' })} title="Selecionar">
                            <Trophy size={14} className="text-green-600" />
                          </Button>
                        )}
                        {proposal.status === 'selecionada' && (
                          <Button size="sm" variant="ghost" onClick={() => handleConvocar(proposal)} title="Convocar OSC">
                            <Mail size={14} className="text-indigo-600" />
                          </Button>
                        )}
                        {['inscrita', 'habilitada', 'avaliada'].includes(proposal.status) && (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedProposal(proposal); setShowDiligenciaModal(true); }} title="Solicitar Diligência">
                            <AlertCircle size={14} className="text-orange-600" />
                          </Button>
                        )}
                        {proposal.recurso_status === 'pendente' && (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedProposal(proposal); setRecursoData({ ...recursoData, texto: proposal.recurso_texto || '' }); setShowRecursoModal(true); }} title="Responder Recurso">
                            <Gavel size={14} className="text-amber-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} /> Detalhes da Proposta
            </DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedProposal.status} />
                {selectedProposal.ranking && <Badge>Ranking #{selectedProposal.ranking}</Badge>}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedProposal.titulo}</h3>
                <p className="text-sm text-muted-foreground">{selectedProposal.osc?.razao_social}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground">Valor Solicitado</p>
                  <p className="text-lg font-bold">{selectedProposal.valor_solicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground">Pontuação</p>
                  <p className="text-lg font-bold flex items-center gap-1"><Star size={16} className="text-yellow-500" /> {selectedProposal.pontuacao_total}</p>
                </div>
              </div>
              {selectedProposal.descricao && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">Descrição</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedProposal.descricao}</p>
                </div>
              )}
              {selectedProposal.parecer_tecnico && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">Parecer Técnico</p>
                  <p className="text-sm bg-purple-50 border border-purple-200 p-3 rounded-lg">{selectedProposal.parecer_tecnico}</p>
                </div>
              )}
              {selectedProposal.recurso_texto && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">Recurso Interposto</p>
                  <p className="text-sm bg-orange-50 border border-orange-200 p-3 rounded-lg">{selectedProposal.recurso_texto}</p>
                  {selectedProposal.recurso_resposta && (
                    <div className="mt-2">
                      <p className="text-xs font-bold text-muted-foreground mb-1">Resposta ao Recurso ({selectedProposal.recurso_status})</p>
                      <p className="text-sm bg-green-50 border border-green-200 p-3 rounded-lg">{selectedProposal.recurso_resposta}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Documentos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground">Documentos Anexados</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />}
                    Enviar
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {uploading && (
                  <div className="mb-3">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Enviando... {Math.round(uploadProgress)}%</p>
                  </div>
                )}
                
                {selectedProposal.documentos_urls && selectedProposal.documentos_urls.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProposal.documentos_urls.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <File size={14} className="text-primary shrink-0" />
                          <span className="truncate">{getFileNameFromUrl(url)}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} />
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteDocument(url)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic p-3 bg-muted rounded-lg text-center">
                    Nenhum documento anexado
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluation Modal */}
      <Dialog open={showEvalModal} onOpenChange={setShowEvalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-semibold">{selectedProposal?.titulo}</p>
              <p className="text-sm text-muted-foreground">{selectedProposal?.osc?.razao_social}</p>
            </div>
            <div>
              <label className="text-sm font-bold">Pontuação (0-100)</label>
              <Input 
                type="number" 
                min="0" 
                max="100"
                placeholder="Ex: 85" 
                value={evalData.pontuacao}
                onChange={e => setEvalData({ ...evalData, pontuacao: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-bold">Parecer Técnico</label>
              <Textarea 
                placeholder="Descreva a análise técnica da proposta..." 
                value={evalData.parecer}
                onChange={e => setEvalData({ ...evalData, parecer: e.target.value })}
                rows={4}
              />
            </div>
            <Button onClick={handleEvaluate} className="w-full">Registrar Avaliação</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurso Modal */}
      <Dialog open={showRecursoModal} onOpenChange={setShowRecursoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analisar Recurso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-semibold">{selectedProposal?.titulo}</p>
              <p className="text-sm text-muted-foreground">{selectedProposal?.osc?.razao_social}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Recurso da OSC:</p>
              <p className="text-sm bg-orange-50 border border-orange-200 p-3 rounded-lg">{recursoData.texto}</p>
            </div>
            <div>
              <label className="text-sm font-bold">Resposta ao Recurso</label>
              <Textarea 
                placeholder="Fundamente a decisão..." 
                value={recursoData.resposta}
                onChange={e => setRecursoData({ ...recursoData, resposta: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleRecursoResponse(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                <ThumbsUp size={16} className="mr-2" /> Deferir
              </Button>
              <Button onClick={() => handleRecursoResponse(false)} variant="destructive" className="flex-1">
                <ThumbsDown size={16} className="mr-2" /> Indeferir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diligência Modal */}
      <Dialog open={showDiligenciaModal} onOpenChange={setShowDiligenciaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Diligência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-semibold">{selectedProposal?.titulo}</p>
              <p className="text-sm text-muted-foreground">{selectedProposal?.osc?.razao_social}</p>
            </div>
            <div>
              <label className="text-sm font-bold">Descrição da Diligência</label>
              <Textarea 
                placeholder="Descreva os documentos ou esclarecimentos necessários..." 
                value={diligenciaText}
                onChange={e => setDiligenciaText(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleDiligencia} className="w-full bg-orange-600 hover:bg-orange-700">
              <AlertCircle size={16} className="mr-2" /> Registrar Diligência
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ata Modal */}
      <Dialog open={showAtaModal} onOpenChange={setShowAtaModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Ata da Comissão de Seleção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={callFilter} onValueChange={setCallFilter}>
              <SelectTrigger><SelectValue placeholder="Selecione o Chamamento" /></SelectTrigger>
              <SelectContent>
                {publicCalls.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.numero_edital} - {c.objeto?.substring(0, 40)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm font-bold">Deliberações e Observações</label>
              <Textarea 
                placeholder="Registre as deliberações da comissão..." 
                value={ataText}
                onChange={e => setAtaText(e.target.value)}
                rows={6}
              />
            </div>
            <Button onClick={generateAta} className="w-full">
              <FileDown size={16} className="mr-2" /> Gerar Ata em PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalSelectionModule;
