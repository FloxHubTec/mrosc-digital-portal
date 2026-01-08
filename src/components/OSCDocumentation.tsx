import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileText, AlertTriangle, CheckCircle, Clock, 
  Building2, CreditCard, MapPin, FileCheck, Trash2, 
  Eye, Download, Calendar, RefreshCw, AlertCircle
} from 'lucide-react';
import { format, differenceInDays, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Document types configuration
const DOCUMENT_TYPES = [
  { 
    id: 'estatuto', 
    label: 'Estatuto Social', 
    hasValidity: false, 
    icon: FileText,
    description: 'Estatuto social da organização atualizado'
  },
  { 
    id: 'contrato_social', 
    label: 'Contrato Social', 
    hasValidity: false, 
    icon: FileText,
    description: 'Contrato social ou ata de constituição'
  },
  { 
    id: 'cnpj', 
    label: 'Cartão CNPJ', 
    hasValidity: false, 
    icon: Building2,
    description: 'Comprovante de inscrição e situação cadastral'
  },
  { 
    id: 'dados_bancarios', 
    label: 'Dados Bancários', 
    hasValidity: false, 
    icon: CreditCard,
    description: 'Comprovante de conta bancária da instituição'
  },
  { 
    id: 'comprovante_endereco', 
    label: 'Comprovante de Endereço', 
    hasValidity: true, 
    validityMonths: 3,
    icon: MapPin,
    description: 'Comprovante de endereço recente (máx. 3 meses)'
  },
  { 
    id: 'cnd_federal', 
    label: 'CND Federal (Receita)', 
    hasValidity: true, 
    validityMonths: 6,
    icon: FileCheck,
    description: 'Certidão Negativa de Débitos Federais'
  },
  { 
    id: 'cnd_fgts', 
    label: 'CRF (FGTS)', 
    hasValidity: true, 
    validityMonths: 1,
    icon: FileCheck,
    description: 'Certificado de Regularidade do FGTS'
  },
  { 
    id: 'cnd_trabalhista', 
    label: 'CNDT (Trabalhista)', 
    hasValidity: true, 
    validityMonths: 6,
    icon: FileCheck,
    description: 'Certidão Negativa de Débitos Trabalhistas'
  },
  { 
    id: 'cnd_estadual', 
    label: 'CND Estadual', 
    hasValidity: true, 
    validityMonths: 3,
    icon: FileCheck,
    description: 'Certidão Negativa de Débitos Estaduais'
  },
  { 
    id: 'cnd_municipal', 
    label: 'CND Municipal', 
    hasValidity: true, 
    validityMonths: 3,
    icon: FileCheck,
    description: 'Certidão Negativa de Débitos Municipais'
  },
  { 
    id: 'ata_eleicao', 
    label: 'Ata de Eleição/Posse', 
    hasValidity: true, 
    validityMonths: 48,
    icon: FileText,
    description: 'Ata de eleição e posse da diretoria atual'
  },
  { 
    id: 'rg_cpf_representante', 
    label: 'RG/CPF Representante', 
    hasValidity: false, 
    icon: FileText,
    description: 'Documentos pessoais do representante legal'
  },
];

interface OSCDocument {
  id: string;
  osc_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  issue_date: string | null;
  expiry_date: string | null;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  uploaded_at: string;
  uploaded_by: string;
}

interface BankData {
  bank_name: string;
  bank_code: string;
  agency: string;
  account: string;
  account_type: string;
  holder_name: string;
  holder_document: string;
}

// Mock data for demonstration
const mockDocuments: OSCDocument[] = [
  {
    id: '1',
    osc_id: 'osc-1',
    document_type: 'estatuto',
    file_name: 'Estatuto_Social_2024.pdf',
    file_url: '#',
    issue_date: '2024-01-15',
    expiry_date: null,
    status: 'valid',
    uploaded_at: '2024-01-15T10:00:00Z',
    uploaded_by: 'Maria Silva'
  },
  {
    id: '2',
    osc_id: 'osc-1',
    document_type: 'cnpj',
    file_name: 'Cartao_CNPJ.pdf',
    file_url: '#',
    issue_date: '2024-06-01',
    expiry_date: null,
    status: 'valid',
    uploaded_at: '2024-06-01T14:30:00Z',
    uploaded_by: 'Maria Silva'
  },
  {
    id: '3',
    osc_id: 'osc-1',
    document_type: 'cnd_federal',
    file_name: 'CND_Federal_2024.pdf',
    file_url: '#',
    issue_date: '2024-10-01',
    expiry_date: '2025-04-01',
    status: 'valid',
    uploaded_at: '2024-10-01T09:00:00Z',
    uploaded_by: 'João Santos'
  },
  {
    id: '4',
    osc_id: 'osc-1',
    document_type: 'cnd_fgts',
    file_name: 'CRF_FGTS.pdf',
    file_url: '#',
    issue_date: '2024-12-15',
    expiry_date: '2025-01-15',
    status: 'expiring',
    uploaded_at: '2024-12-15T11:00:00Z',
    uploaded_by: 'João Santos'
  },
  {
    id: '5',
    osc_id: 'osc-1',
    document_type: 'cnd_trabalhista',
    file_name: 'CNDT_2024.pdf',
    file_url: '#',
    issue_date: '2024-06-01',
    expiry_date: '2024-12-01',
    status: 'expired',
    uploaded_at: '2024-06-01T08:00:00Z',
    uploaded_by: 'Maria Silva'
  },
  {
    id: '6',
    osc_id: 'osc-1',
    document_type: 'dados_bancarios',
    file_name: 'Comprovante_Conta_BB.pdf',
    file_url: '#',
    issue_date: '2024-03-10',
    expiry_date: null,
    status: 'valid',
    uploaded_at: '2024-03-10T16:00:00Z',
    uploaded_by: 'Maria Silva'
  },
  {
    id: '7',
    osc_id: 'osc-1',
    document_type: 'comprovante_endereco',
    file_name: 'Conta_Energia_Nov2024.pdf',
    file_url: '#',
    issue_date: '2024-11-05',
    expiry_date: '2025-02-05',
    status: 'valid',
    uploaded_at: '2024-11-10T10:00:00Z',
    uploaded_by: 'João Santos'
  },
  {
    id: '8',
    osc_id: 'osc-1',
    document_type: 'ata_eleicao',
    file_name: 'Ata_Eleicao_Diretoria_2023.pdf',
    file_url: '#',
    issue_date: '2023-03-15',
    expiry_date: '2027-03-15',
    status: 'valid',
    uploaded_at: '2023-03-20T14:00:00Z',
    uploaded_by: 'Maria Silva'
  },
];

const mockBankData: BankData = {
  bank_name: 'Banco do Brasil',
  bank_code: '001',
  agency: '1234-5',
  account: '12345-6',
  account_type: 'Conta Corrente',
  holder_name: 'Associação Comunitária Esperança',
  holder_document: '12.345.678/0001-90'
};

const OSCDocumentation: React.FC = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<OSCDocument[]>(mockDocuments);
  const [bankData, setBankData] = useState<BankData>(mockBankData);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Calculate document status based on expiry date
  const getDocumentStatus = (doc: OSCDocument): 'valid' | 'expiring' | 'expired' | 'pending' => {
    if (!doc.expiry_date) return 'valid';
    
    const today = new Date();
    const expiry = parseISO(doc.expiry_date);
    const daysUntilExpiry = differenceInDays(expiry, today);
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
  };

  // Update document statuses on load
  useEffect(() => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      status: getDocumentStatus(doc)
    })));
  }, []);

  // Get document type config
  const getDocTypeConfig = (typeId: string) => {
    return DOCUMENT_TYPES.find(t => t.id === typeId);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      valid: { label: 'Válido', variant: 'default', icon: CheckCircle },
      expiring: { label: 'Vencendo', variant: 'secondary', icon: Clock },
      expired: { label: 'Vencido', variant: 'destructive', icon: AlertTriangle },
      pending: { label: 'Pendente', variant: 'outline', icon: AlertCircle }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  // Calculate expiry date based on document type
  const calculateExpiryDate = (docType: string, issueDate: string): string | null => {
    const config = getDocTypeConfig(docType);
    if (!config?.hasValidity || !config.validityMonths) return null;
    
    const issue = parseISO(issueDate);
    const expiry = addDays(issue, config.validityMonths * 30);
    return format(expiry, 'yyyy-MM-dd');
  };

  // Handle document upload
  const handleUpload = async () => {
    if (!uploadFile || !selectedDocType) {
      toast.error('Selecione o tipo de documento e o arquivo');
      return;
    }

    const docConfig = getDocTypeConfig(selectedDocType);
    if (docConfig?.hasValidity && !issueDate) {
      toast.error('Informe a data de emissão do documento');
      return;
    }

    setUploading(true);

    try {
      // Calculate expiry if document has validity
      let calculatedExpiry = null;
      if (docConfig?.hasValidity && issueDate) {
        calculatedExpiry = expiryDate || calculateExpiryDate(selectedDocType, issueDate);
      }

      // Mock upload - in production, upload to Supabase Storage
      const newDoc: OSCDocument = {
        id: `doc-${Date.now()}`,
        osc_id: profile?.osc_id || 'osc-1',
        document_type: selectedDocType,
        file_name: uploadFile.name,
        file_url: '#',
        issue_date: issueDate || format(new Date(), 'yyyy-MM-dd'),
        expiry_date: calculatedExpiry,
        status: 'valid',
        uploaded_at: new Date().toISOString(),
        uploaded_by: profile?.full_name || 'Usuário'
      };

      // Update status based on expiry
      newDoc.status = getDocumentStatus(newDoc);

      setDocuments(prev => {
        // Remove existing document of same type if exists
        const filtered = prev.filter(d => d.document_type !== selectedDocType);
        return [...filtered, newDoc];
      });

      toast.success('Documento enviado com sucesso!');
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error) {
      toast.error('Erro ao enviar documento');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedDocType('');
    setUploadFile(null);
    setIssueDate('');
    setExpiryDate('');
  };

  // Handle bank data save
  const handleSaveBankData = () => {
    toast.success('Dados bancários salvos com sucesso!');
    setShowBankModal(false);
  };

  // Filter documents by tab
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    if (activeTab === 'valid') return doc.status === 'valid';
    if (activeTab === 'expiring') return doc.status === 'expiring';
    if (activeTab === 'expired') return doc.status === 'expired';
    if (activeTab === 'certidoes') return getDocTypeConfig(doc.document_type)?.hasValidity;
    return true;
  });

  // Count documents by status
  const countByStatus = {
    all: documents.length,
    valid: documents.filter(d => d.status === 'valid').length,
    expiring: documents.filter(d => d.status === 'expiring').length,
    expired: documents.filter(d => d.status === 'expired').length,
  };

  // Missing documents
  const uploadedTypes = documents.map(d => d.document_type);
  const missingDocuments = DOCUMENT_TYPES.filter(t => !uploadedTypes.includes(t.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Minha Documentação</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os documentos da sua organização. O sistema monitora automaticamente os vencimentos.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CreditCard size={16} />
                Dados Bancários
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Dados Bancários da Instituição</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Banco</Label>
                    <Input 
                      value={bankData.bank_name} 
                      onChange={e => setBankData({...bankData, bank_name: e.target.value})}
                      placeholder="Nome do banco"
                    />
                  </div>
                  <div>
                    <Label>Código</Label>
                    <Input 
                      value={bankData.bank_code} 
                      onChange={e => setBankData({...bankData, bank_code: e.target.value})}
                      placeholder="Ex: 001"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Agência</Label>
                    <Input 
                      value={bankData.agency} 
                      onChange={e => setBankData({...bankData, agency: e.target.value})}
                      placeholder="Ex: 1234-5"
                    />
                  </div>
                  <div>
                    <Label>Conta</Label>
                    <Input 
                      value={bankData.account} 
                      onChange={e => setBankData({...bankData, account: e.target.value})}
                      placeholder="Ex: 12345-6"
                    />
                  </div>
                </div>
                <div>
                  <Label>Tipo de Conta</Label>
                  <Select 
                    value={bankData.account_type} 
                    onValueChange={v => setBankData({...bankData, account_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                      <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Titular da Conta</Label>
                  <Input 
                    value={bankData.holder_name} 
                    onChange={e => setBankData({...bankData, holder_name: e.target.value})}
                    placeholder="Razão social"
                  />
                </div>
                <div>
                  <Label>CNPJ do Titular</Label>
                  <Input 
                    value={bankData.holder_document} 
                    onChange={e => setBankData({...bankData, holder_document: e.target.value})}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <Button onClick={handleSaveBankData} className="w-full">
                  Salvar Dados Bancários
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload size={16} />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Tipo de Documento *</Label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon size={14} />
                            {type.label}
                            {type.hasValidity && (
                              <Badge variant="outline" className="text-[10px] ml-2">
                                Com validade
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDocType && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getDocTypeConfig(selectedDocType)?.description}
                    </p>
                  )}
                </div>

                {selectedDocType && getDocTypeConfig(selectedDocType)?.hasValidity && (
                  <>
                    <div>
                      <Label>Data de Emissão *</Label>
                      <Input 
                        type="date" 
                        value={issueDate}
                        onChange={e => {
                          setIssueDate(e.target.value);
                          // Auto-calculate expiry
                          const expiry = calculateExpiryDate(selectedDocType, e.target.value);
                          if (expiry) setExpiryDate(expiry);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Data de Validade (calculada automaticamente)</Label>
                      <Input 
                        type="date" 
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        O sistema calcula automaticamente com base no tipo de documento. Você pode ajustar se necessário.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <Label>Arquivo (PDF, JPG, PNG) *</Label>
                  <Input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>

                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !uploadFile || !selectedDocType}
                  className="w-full"
                >
                  {uploading ? 'Enviando...' : 'Enviar Documento'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts for expiring/expired documents */}
      {countByStatus.expired > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você possui <strong>{countByStatus.expired} documento(s) vencido(s)</strong>. 
            Atualize-os para manter a regularidade da sua organização.
          </AlertDescription>
        </Alert>
      )}

      {countByStatus.expiring > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>{countByStatus.expiring} documento(s)</strong> vencem nos próximos 30 dias. 
            Providencie a renovação com antecedência.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Total Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CheckCircle className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black">{countByStatus.valid}</p>
                <p className="text-xs text-muted-foreground">Válidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Clock className="text-amber-500" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black">{countByStatus.expiring}</p>
                <p className="text-xs text-muted-foreground">Vencendo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <AlertTriangle className="text-destructive" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black">{countByStatus.expired}</p>
                <p className="text-xs text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Documents */}
      {missingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              Documentos Pendentes de Envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingDocuments.map(doc => (
                <Badge key={doc.id} variant="outline" className="gap-1 py-1">
                  <doc.icon size={12} />
                  {doc.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({countByStatus.all})</TabsTrigger>
              <TabsTrigger value="valid">Válidos ({countByStatus.valid})</TabsTrigger>
              <TabsTrigger value="expiring">Vencendo ({countByStatus.expiring})</TabsTrigger>
              <TabsTrigger value="expired">Vencidos ({countByStatus.expired})</TabsTrigger>
              <TabsTrigger value="certidoes">Certidões</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum documento encontrado nesta categoria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map(doc => {
                        const config = getDocTypeConfig(doc.document_type);
                        const Icon = config?.icon || FileText;
                        
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon size={16} className="text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{config?.label || doc.document_type}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Enviado por {doc.uploaded_by}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{doc.file_name}</span>
                            </TableCell>
                            <TableCell>
                              {doc.issue_date ? (
                                format(parseISO(doc.issue_date), 'dd/MM/yyyy', { locale: ptBR })
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {doc.expiry_date ? (
                                <div className="flex items-center gap-2">
                                  <span>{format(parseISO(doc.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                  {doc.status === 'expiring' && (
                                    <span className="text-xs text-amber-500">
                                      ({differenceInDays(parseISO(doc.expiry_date), new Date())} dias)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sem validade</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={doc.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" title="Visualizar">
                                  <Eye size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" title="Download">
                                  <Download size={16} />
                                </Button>
                                {(doc.status === 'expired' || doc.status === 'expiring') && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    title="Atualizar"
                                    onClick={() => {
                                      setSelectedDocType(doc.document_type);
                                      setShowUploadModal(true);
                                    }}
                                  >
                                    <RefreshCw size={16} className="text-amber-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bank Data Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={18} />
            Dados Bancários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Banco</p>
              <p className="font-medium">{bankData.bank_name} ({bankData.bank_code})</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agência</p>
              <p className="font-medium">{bankData.agency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conta</p>
              <p className="font-medium">{bankData.account} ({bankData.account_type})</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Titular</p>
              <p className="font-medium">{bankData.holder_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSCDocumentation;
