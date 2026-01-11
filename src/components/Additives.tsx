import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdditives, Additive } from '@/hooks/useAdditives';
import { usePartnerships } from '@/hooks/usePartnerships';
import { useAuth } from '@/hooks/useAuth';
import ExportDropdown from '@/components/ui/ExportDropdown';
import { exportData } from '@/utils/exportUtils';
import { generatePDFHeader, addPDFFooter } from '@/utils/pdfHeaderUtils';
import { useTheme } from '@/contexts/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FilePlus2, FileEdit, Check, X, Search, Plus, Clock, 
  CheckCircle, XCircle, TrendingUp, TrendingDown, FileDown, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    pendente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente', icon: <Clock size={12} /> },
    aprovado: { color: 'bg-green-100 text-green-800', label: 'Aprovado', icon: <CheckCircle size={12} /> },
    rejeitado: { color: 'bg-red-100 text-red-800', label: 'Rejeitado', icon: <XCircle size={12} /> },
  };
  const { color, label, icon } = config[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: null };
  return (
    <Badge className={`${color} font-semibold flex items-center gap-1`}>
      {icon} {label}
    </Badge>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const isAditivo = tipo === 'aditivo';
  return (
    <Badge variant={isAditivo ? 'default' : 'secondary'}>
      {isAditivo ? <FilePlus2 size={12} className="mr-1" /> : <FileEdit size={12} className="mr-1" />}
      {isAditivo ? 'Aditivo' : 'Apostilamento'}
    </Badge>
  );
};

const AdditivesModule: React.FC = () => {
  const { additives, loading, createAdditive, approveAdditive, rejectAdditive, getStatsByType, getValueImpact } = useAdditives();
  const { partnerships } = usePartnerships();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdditive, setSelectedAdditive] = useState<Additive | null>(null);
  
  const [formData, setFormData] = useState({
    partnership_id: '',
    tipo: 'aditivo',
    motivo: '',
    justificativa: '',
    valor_anterior: '',
    valor_novo: '',
    prazo_anterior: '',
    prazo_novo: '',
  });

  const stats = getStatsByType();
  const valueImpact = getValueImpact();

  const filteredAdditives = additives.filter(a => {
    const matchesSearch = a.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.partnership?.numero_termo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.partnership?.osc?.razao_social?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || a.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleCreate = async () => {
    if (!formData.partnership_id || !formData.motivo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const result = await createAdditive({
      partnership_id: formData.partnership_id,
      tipo: formData.tipo,
      motivo: formData.motivo,
      justificativa: formData.justificativa,
      valor_anterior: parseFloat(formData.valor_anterior) || 0,
      valor_novo: parseFloat(formData.valor_novo) || 0,
      prazo_anterior: formData.prazo_anterior || undefined,
      prazo_novo: formData.prazo_novo || undefined,
    });
    if (result) {
      toast.success(`${formData.tipo === 'aditivo' ? 'Aditivo' : 'Apostilamento'} criado com sucesso!`);
      setShowCreateModal(false);
      setFormData({
        partnership_id: '',
        tipo: 'aditivo',
        motivo: '',
        justificativa: '',
        valor_anterior: '',
        valor_novo: '',
        prazo_anterior: '',
        prazo_novo: '',
      });
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;
    const result = await approveAdditive(id, user.id);
    if (result) toast.success('Aprovado com sucesso!');
  };

  const handleReject = async (id: string) => {
    const result = await rejectAdditive(id);
    if (result) toast.success('Rejeitado');
  };

  const generateConsolidatedDocument = async (additive: Additive) => {
    const doc = new jsPDF();
    const partnership = partnerships.find(p => p.id === additive.partnership_id);
    
    // Generate header with logos
    const { startY } = await generatePDFHeader({
      doc,
      municipalLogoUrl: theme.logoUrl || null,
      oscLogoUrl: partnership?.osc?.logo_url || null,
      municipalName: theme.organizationName,
      municipalSubtitle: theme.organizationSubtitle,
      oscName: partnership?.osc?.razao_social,
      title: additive.tipo === 'aditivo' ? 'Termo Aditivo' : 'Apostilamento',
      subtitle: `Nº ${additive.numero}`,
    });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let yPos = startY + 4;
    
    doc.text(`TERMO DE PARCERIA: ${partnership?.numero_termo || '-'}`, 14, yPos);
    yPos += 8;
    doc.text(`OSC: ${additive.partnership?.osc?.razao_social || '-'}`, 14, yPos);
    yPos += 8;
    doc.text(`DATA: ${format(new Date(additive.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, yPos);
    yPos += 15;
    
    doc.setFont('helvetica', 'bold');
    doc.text('MOTIVO:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    const motivoLines = doc.splitTextToSize(additive.motivo, 180);
    doc.text(motivoLines, 14, yPos);
    yPos += motivoLines.length * 5 + 10;
    
    if (additive.justificativa) {
      doc.setFont('helvetica', 'bold');
      doc.text('JUSTIFICATIVA:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      const justLines = doc.splitTextToSize(additive.justificativa, 180);
      doc.text(justLines, 14, yPos);
      yPos += justLines.length * 5 + 10;
    }
    
    if (additive.valor_anterior > 0 || additive.valor_novo > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('ALTERAÇÃO DE VALOR:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      doc.text(`Valor anterior: ${additive.valor_anterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPos);
      yPos += 6;
      doc.text(`Novo valor: ${additive.valor_novo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, yPos);
      yPos += 6;
      const diff = additive.valor_novo - additive.valor_anterior;
      doc.text(`Diferença: ${diff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${diff >= 0 ? '+' : ''}${((diff / additive.valor_anterior) * 100).toFixed(1)}%)`, 14, yPos);
      yPos += 12;
    }
    
    if (additive.prazo_anterior || additive.prazo_novo) {
      doc.setFont('helvetica', 'bold');
      doc.text('ALTERAÇÃO DE PRAZO:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 7;
      if (additive.prazo_anterior) {
        doc.text(`Prazo anterior: ${new Date(additive.prazo_anterior).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 6;
      }
      if (additive.prazo_novo) {
        doc.text(`Novo prazo: ${new Date(additive.prazo_novo).toLocaleDateString('pt-BR')}`, 14, yPos);
        yPos += 12;
      }
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`STATUS: ${additive.status.toUpperCase()}`, 14, yPos);
    
    if (additive.status === 'aprovado' && additive.aprovado_em) {
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Aprovado em: ${format(new Date(additive.aprovado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, yPos);
    }
    
    yPos += 30;
    doc.setFont('helvetica', 'normal');
    doc.text('_______________________________', 30, yPos);
    doc.text('Gestor Municipal', 50, yPos + 7);
    
    doc.text('_______________________________', 120, yPos);
    doc.text('Representante OSC', 135, yPos + 7);
    
    // Footer
    addPDFFooter(doc, `Sistema MROSC Digital - ${theme.organizationName}`);
    
    doc.save(`${additive.tipo}-${additive.numero?.replace('/', '-')}.pdf`);
    toast.success('Documento consolidado gerado!');
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const headers = ['Número', 'Tipo', 'Parceria', 'OSC', 'Motivo', 'Valor Anterior', 'Valor Novo', 'Prazo Anterior', 'Prazo Novo', 'Status', 'Data'];
    const data = filteredAdditives.map(a => [
      a.numero || '-',
      a.tipo,
      a.partnership?.numero_termo || '-',
      a.partnership?.osc?.razao_social || '-',
      a.motivo,
      a.valor_anterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      a.valor_novo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      a.prazo_anterior ? new Date(a.prazo_anterior).toLocaleDateString('pt-BR') : '-',
      a.prazo_novo ? new Date(a.prazo_novo).toLocaleDateString('pt-BR') : '-',
      a.status,
      new Date(a.created_at).toLocaleDateString('pt-BR'),
    ]);
    exportData(format, { filename: 'aditivos-apostilamentos', title: 'Aditivos e Apostilamentos - MROSC Unaí/MG', headers, data });
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
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Aditivos e Apostilamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie alterações contratuais das parcerias</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown onExport={handleExport} />
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} /> Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Aditivo/Apostilamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Select value={formData.tipo} onValueChange={v => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aditivo">Aditivo (altera cláusulas do termo)</SelectItem>
                    <SelectItem value="apostilamento">Apostilamento (ajuste administrativo)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.partnership_id} onValueChange={v => setFormData({ ...formData, partnership_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a Parceria *" /></SelectTrigger>
                  <SelectContent>
                    {partnerships.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.numero_termo} - {p.osc?.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Motivo da alteração *" 
                  value={formData.motivo} 
                  onChange={e => setFormData({ ...formData, motivo: e.target.value })} 
                />
                <Textarea 
                  placeholder="Justificativa detalhada (fundamentação legal, técnica, etc.)" 
                  value={formData.justificativa} 
                  onChange={e => setFormData({ ...formData, justificativa: e.target.value })}
                  rows={3}
                />
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground mb-2">Alteração de Valor (se aplicável)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Valor Anterior</label>
                      <Input 
                        type="number" 
                        placeholder="R$ 0,00" 
                        value={formData.valor_anterior} 
                        onChange={e => setFormData({ ...formData, valor_anterior: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Novo Valor</label>
                      <Input 
                        type="number" 
                        placeholder="R$ 0,00" 
                        value={formData.valor_novo} 
                        onChange={e => setFormData({ ...formData, valor_novo: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground mb-2">Alteração de Prazo (se aplicável)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Prazo Anterior</label>
                      <Input 
                        type="date" 
                        value={formData.prazo_anterior} 
                        onChange={e => setFormData({ ...formData, prazo_anterior: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Novo Prazo</label>
                      <Input 
                        type="date" 
                        value={formData.prazo_novo} 
                        onChange={e => setFormData({ ...formData, prazo_novo: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleCreate} className="w-full">Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <FilePlus2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-blue-800">{stats.aditivo}</p>
            <p className="text-xs text-blue-600">Aditivos</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <FileEdit className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-purple-800">{stats.apostilamento}</p>
            <p className="text-xs text-purple-600">Apostilamentos</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-yellow-800">{stats.pendente}</p>
            <p className="text-xs text-yellow-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-green-800">{stats.aprovado}</p>
            <p className="text-xs text-green-600">Aprovados</p>
          </CardContent>
        </Card>
        <Card className={valueImpact >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-4 text-center">
            {valueImpact >= 0 ? (
              <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-1" />
            )}
            <p className={`text-lg font-black ${valueImpact >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {valueImpact.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className={`text-xs ${valueImpact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Impacto Total</p>
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
                placeholder="Buscar por motivo, parceria ou OSC..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="aditivo">Aditivos</SelectItem>
                <SelectItem value="apostilamento">Apostilamentos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="rejeitado">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus2 size={20} /> Registros ({filteredAdditives.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Parceria</TableHead>
                <TableHead>OSC</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Alteração de Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdditives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdditives.map(additive => (
                  <TableRow key={additive.id} className="group">
                    <TableCell className="font-mono text-sm">{additive.numero}</TableCell>
                    <TableCell><TipoBadge tipo={additive.tipo} /></TableCell>
                    <TableCell>{additive.partnership?.numero_termo || '-'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{additive.partnership?.osc?.razao_social || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{additive.motivo}</TableCell>
                    <TableCell>
                      {additive.valor_anterior > 0 || additive.valor_novo > 0 ? (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground line-through">
                            {additive.valor_anterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="mx-1">→</span>
                          <span className="font-semibold">
                            {additive.valor_novo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={additive.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => { setSelectedAdditive(additive); setShowDetailModal(true); }}
                          title="Ver detalhes"
                        >
                          <Eye size={14} />
                        </Button>
                        {additive.status === 'aprovado' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => generateConsolidatedDocument(additive)}
                            title="Gerar documento consolidado"
                          >
                            <FileDown size={14} className="text-blue-600" />
                          </Button>
                        )}
                        {additive.status === 'pendente' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleApprove(additive.id)}
                              title="Aprovar"
                            >
                              <Check size={14} className="text-green-600" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleReject(additive.id)}
                              title="Rejeitar"
                            >
                              <X size={14} className="text-red-600" />
                            </Button>
                          </>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAdditive?.tipo === 'aditivo' ? <FilePlus2 size={20} /> : <FileEdit size={20} />}
              {selectedAdditive?.tipo === 'aditivo' ? 'Termo Aditivo' : 'Apostilamento'} {selectedAdditive?.numero}
            </DialogTitle>
          </DialogHeader>
          {selectedAdditive && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedAdditive.status} />
                <TipoBadge tipo={selectedAdditive.tipo} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground">Parceria</p>
                  <p className="font-semibold">{selectedAdditive.partnership?.numero_termo}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-bold text-muted-foreground">OSC</p>
                  <p className="font-semibold">{selectedAdditive.partnership?.osc?.razao_social}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-1">Motivo</p>
                <p className="bg-muted p-3 rounded-lg">{selectedAdditive.motivo}</p>
              </div>
              
              {selectedAdditive.justificativa && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-1">Justificativa</p>
                  <p className="bg-muted p-3 rounded-lg">{selectedAdditive.justificativa}</p>
                </div>
              )}
              
              {(selectedAdditive.valor_anterior > 0 || selectedAdditive.valor_novo > 0) && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-xs font-bold text-red-600">Valor Anterior</p>
                    <p className="text-lg font-bold text-red-800">{selectedAdditive.valor_anterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-xs font-bold text-green-600">Novo Valor</p>
                    <p className="text-lg font-bold text-green-800">{selectedAdditive.valor_novo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-xs font-bold text-blue-600">Diferença</p>
                    <p className="text-lg font-bold text-blue-800">
                      {(selectedAdditive.valor_novo - selectedAdditive.valor_anterior).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              )}
              
              {(selectedAdditive.prazo_anterior || selectedAdditive.prazo_novo) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedAdditive.prazo_anterior && (
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-xs font-bold text-muted-foreground">Prazo Anterior</p>
                      <p className="font-semibold">{new Date(selectedAdditive.prazo_anterior).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  {selectedAdditive.prazo_novo && (
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-xs font-bold text-muted-foreground">Novo Prazo</p>
                      <p className="font-semibold">{new Date(selectedAdditive.prazo_novo).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedAdditive.status === 'aprovado' && (
                <Button onClick={() => generateConsolidatedDocument(selectedAdditive)} className="w-full">
                  <FileDown size={16} className="mr-2" /> Gerar Documento Consolidado (PDF)
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdditivesModule;
