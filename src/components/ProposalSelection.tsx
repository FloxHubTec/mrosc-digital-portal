import React, { useState } from 'react';
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
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { exportData } from '@/utils/exportUtils';
import { 
  ClipboardCheck, FileText, Users, Trophy, AlertCircle, Search, 
  Plus, Star, ThumbsUp, ThumbsDown, ArrowUpDown, Eye, CheckCircle,
  XCircle, Clock, Filter, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    inscrita: { color: 'bg-blue-100 text-blue-800', label: 'Inscrita' },
    habilitada: { color: 'bg-emerald-100 text-emerald-800', label: 'Habilitada' },
    inabilitada: { color: 'bg-red-100 text-red-800', label: 'Inabilitada' },
    avaliada: { color: 'bg-purple-100 text-purple-800', label: 'Avaliada' },
    selecionada: { color: 'bg-green-100 text-green-800', label: 'Selecionada' },
    desclassificada: { color: 'bg-gray-100 text-gray-800', label: 'Desclassificada' },
  };
  const { color, label } = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return <Badge className={`${color} font-semibold`}>{label}</Badge>;
};

const ProposalSelectionModule: React.FC = () => {
  const { proposals, loading, createProposal, updateProposal, evaluateProposal, submitRecurso, respondRecurso, calculateRankings, getStatsByStatus } = useProposals();
  const { publicCalls } = usePublicCalls();
  const { oscs } = useOSCs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [callFilter, setCallFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    public_call_id: '',
    osc_id: '',
    titulo: '',
    descricao: '',
    valor_solicitado: '',
  });
  const [evalData, setEvalData] = useState({ pontuacao: '', parecer: '' });
  const [recursoData, setRecursoData] = useState({ texto: '', resposta: '', deferido: false });

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

  const handleRecursoResponse = async () => {
    if (!selectedProposal) return;
    const result = await respondRecurso(selectedProposal.id, recursoData.resposta, recursoData.deferido);
    if (result) {
      toast.success('Recurso respondido!');
      setShowRecursoModal(false);
      setRecursoData({ texto: '', resposta: '', deferido: false });
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const headers = ['Título', 'OSC', 'Chamamento', 'Valor', 'Pontuação', 'Ranking', 'Status'];
    const data = filteredProposals.map(p => [
      p.titulo,
      p.osc?.razao_social || '-',
      p.public_call?.numero_edital || '-',
      p.valor_solicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      p.pontuacao_total.toString(),
      p.ranking?.toString() || '-',
      p.status,
    ]);
    exportData(format, { filename: 'propostas', title: 'Propostas - Seleção', headers, data });
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
          <p className="text-muted-foreground text-sm">Gerencie inscrições, avaliações e recursos</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown onExport={handleExport} />
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
                  <SelectTrigger><SelectValue placeholder="Selecione o Chamamento" /></SelectTrigger>
                  <SelectContent>
                    {publicCalls.filter(c => c.status === 'aberto').map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.numero_edital}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.osc_id} onValueChange={v => setFormData({ ...formData, osc_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a OSC" /></SelectTrigger>
                  <SelectContent>
                    {oscs.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.razao_social}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Título da Proposta *" 
                  value={formData.titulo} 
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })} 
                />
                <Textarea 
                  placeholder="Descrição" 
                  value={formData.descricao} 
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })} 
                />
                <Input 
                  type="number" 
                  placeholder="Valor Solicitado (R$)" 
                  value={formData.valor_solicitado} 
                  onChange={e => setFormData({ ...formData, valor_solicitado: e.target.value })} 
                />
                <Button onClick={handleCreate} className="w-full">Inscrever Proposta</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-blue-800">{stats.inscrita}</p>
            <p className="text-xs text-blue-600">Inscritas</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-emerald-800">{stats.habilitada}</p>
            <p className="text-xs text-emerald-600">Habilitadas</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-purple-800">{stats.avaliada}</p>
            <p className="text-xs text-purple-600">Avaliadas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-green-800">{stats.selecionada}</p>
            <p className="text-xs text-green-600">Selecionadas</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-red-800">{stats.inabilitada}</p>
            <p className="text-xs text-red-600">Inabilitadas</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 text-gray-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="inscrita">Inscrita</SelectItem>
                <SelectItem value="habilitada">Habilitada</SelectItem>
                <SelectItem value="inabilitada">Inabilitada</SelectItem>
                <SelectItem value="avaliada">Avaliada</SelectItem>
                <SelectItem value="selecionada">Selecionada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={callFilter} onValueChange={setCallFilter}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Chamamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Chamamentos</SelectItem>
                {publicCalls.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.numero_edital}</SelectItem>
                ))}
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
                <TableHead>Ranking</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>OSC</TableHead>
                <TableHead>Chamamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pontuação</TableHead>
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
                  <TableRow key={proposal.id}>
                    <TableCell>
                      {proposal.ranking ? (
                        <Badge variant={proposal.ranking === 1 ? 'default' : 'secondary'}>
                          #{proposal.ranking}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{proposal.titulo}</TableCell>
                    <TableCell>{proposal.osc?.razao_social || '-'}</TableCell>
                    <TableCell>{proposal.public_call?.numero_edital || '-'}</TableCell>
                    <TableCell>
                      {proposal.valor_solicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        {proposal.pontuacao_total}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={proposal.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {proposal.status === 'inscrita' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateProposal(proposal.id, { status: 'habilitada' })}
                              title="Habilitar"
                            >
                              <ThumbsUp size={14} className="text-green-600" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateProposal(proposal.id, { status: 'inabilitada' })}
                              title="Inabilitar"
                            >
                              <ThumbsDown size={14} className="text-red-600" />
                            </Button>
                          </>
                        )}
                        {proposal.status === 'habilitada' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => { setSelectedProposal(proposal); setShowEvalModal(true); }}
                            title="Avaliar"
                          >
                            <Star size={14} className="text-purple-600" />
                          </Button>
                        )}
                        {proposal.status === 'avaliada' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateProposal(proposal.id, { status: 'selecionada' })}
                            title="Selecionar"
                          >
                            <Trophy size={14} className="text-green-600" />
                          </Button>
                        )}
                        {proposal.recurso_status === 'pendente' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => { setSelectedProposal(proposal); setRecursoData({ ...recursoData, texto: proposal.recurso_texto || '' }); setShowRecursoModal(true); }}
                            title="Responder Recurso"
                          >
                            <AlertCircle size={14} className="text-orange-600" />
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

      {/* Evaluation Modal */}
      <Dialog open={showEvalModal} onOpenChange={setShowEvalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{selectedProposal?.titulo}</p>
            <Input 
              type="number" 
              placeholder="Pontuação (0-100)" 
              value={evalData.pontuacao}
              onChange={e => setEvalData({ ...evalData, pontuacao: e.target.value })}
            />
            <Textarea 
              placeholder="Parecer Técnico" 
              value={evalData.parecer}
              onChange={e => setEvalData({ ...evalData, parecer: e.target.value })}
            />
            <Button onClick={handleEvaluate} className="w-full">Registrar Avaliação</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurso Modal */}
      <Dialog open={showRecursoModal} onOpenChange={setShowRecursoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Recurso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Recurso da OSC:</p>
              <p className="text-sm bg-muted p-3 rounded">{recursoData.texto}</p>
            </div>
            <Textarea 
              placeholder="Resposta ao Recurso" 
              value={recursoData.resposta}
              onChange={e => setRecursoData({ ...recursoData, resposta: e.target.value })}
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => { setRecursoData({ ...recursoData, deferido: true }); handleRecursoResponse(); }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp size={16} className="mr-2" /> Deferir
              </Button>
              <Button 
                onClick={() => { setRecursoData({ ...recursoData, deferido: false }); handleRecursoResponse(); }}
                variant="destructive"
                className="flex-1"
              >
                <ThumbsDown size={16} className="mr-2" /> Indeferir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalSelectionModule;
