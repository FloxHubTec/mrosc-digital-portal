import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Link2, Lock, FileCheck, Building2, FileSignature, Newspaper,
  ExternalLink, AlertTriangle, CheckCircle, Settings, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'requires_contract' | 'coming_soon';
  icon: React.ReactNode;
  features: string[];
  provider?: string;
  requirements?: string[];
}

const integrations: Integration[] = [
  {
    id: 'receita_cnd',
    name: 'API ReceitaWS (CNDs)',
    description: 'Consulta automática de Certidões Negativas de Débitos junto à Receita Federal, FGTS, Trabalhistas e Estaduais.',
    status: 'requires_contract',
    icon: <FileCheck className="w-8 h-8" />,
    features: [
      'Consulta CND Federal',
      'Consulta FGTS',
      'Certidão Trabalhista',
      'Alertas de vencimento',
    ],
    provider: 'ReceitaWS',
    requirements: [
      'Contrato com ReceitaWS',
      'Token de acesso API',
      'Certificado Digital A1',
    ],
  },
  {
    id: 'banking',
    name: 'Integração Bancária',
    description: 'Conciliação automática de extratos bancários e monitoramento de movimentações financeiras das parcerias.',
    status: 'requires_contract',
    icon: <Building2 className="w-8 h-8" />,
    features: [
      'Importação de extratos OFX',
      'Conciliação automática',
      'Alertas de saldo',
      'Relatórios financeiros',
    ],
    provider: 'Open Banking / Banco do Brasil',
    requirements: [
      'Convênio com instituição bancária',
      'Autorização de acesso à conta',
      'Certificado de segurança',
    ],
  },
  {
    id: 'diario_oficial',
    name: 'Diário Oficial',
    description: 'Publicação automática de termos, aditivos e resultados de chamamentos no Diário Oficial do Município.',
    status: 'requires_contract',
    icon: <Newspaper className="w-8 h-8" />,
    features: [
      'Publicação automática',
      'Modelos pré-formatados',
      'Comprovante digital',
      'Histórico de publicações',
    ],
    provider: 'Imprensa Oficial / DOM',
    requirements: [
      'Contrato com Imprensa Oficial',
      'Credenciais de acesso ao sistema',
      'Assinatura digital autorizada',
    ],
  },
  {
    id: 'assinatura_digital',
    name: 'Assinatura Digital',
    description: 'Assinatura digital de termos de parceria, planos de trabalho e demais documentos com validade jurídica.',
    status: 'requires_contract',
    icon: <FileSignature className="w-8 h-8" />,
    features: [
      'Assinatura ICP-Brasil',
      'Múltiplos signatários',
      'Carimbo de tempo',
      'Validação automática',
    ],
    provider: 'Certisign / DocuSign',
    requirements: [
      'Licença do serviço de assinatura',
      'Certificado Digital ICP-Brasil',
      'Configuração de fluxo de aprovação',
    ],
  },
];

const StatusBadge = ({ status }: { status: Integration['status'] }) => {
  const config = {
    available: { color: 'bg-green-100 text-green-800', label: 'Disponível', icon: <CheckCircle size={12} /> },
    requires_contract: { color: 'bg-yellow-100 text-yellow-800', label: 'Requer Contrato', icon: <Lock size={12} /> },
    coming_soon: { color: 'bg-blue-100 text-blue-800', label: 'Em Breve', icon: <Settings size={12} /> },
  };
  const { color, label, icon } = config[status];
  return (
    <Badge className={`${color} font-semibold flex items-center gap-1`}>
      {icon} {label}
    </Badge>
  );
};

const IntegrationsModule: React.FC = () => {
  const { user, profile } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    integrationName: '',
    description: '',
  });
  const [sending, setSending] = useState(false);

  // Check if user is master (admin)
  const isMaster = profile?.role === UserRole.MASTER || profile?.role === UserRole.ADMIN;

  const handleOpenRequirements = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowRequirementsModal(true);
  };

  const handleOpenRequestModal = () => {
    setRequestForm({ integrationName: '', description: '' });
    setShowRequestModal(true);
  };

  const handleSendRequest = async () => {
    if (!requestForm.integrationName || !requestForm.description) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-integration-request', {
        body: {
          integrationName: requestForm.integrationName,
          description: requestForm.description,
          userName: profile?.full_name || user?.email,
          userEmail: user?.email,
        },
      });

      if (error) throw error;

      // Open WhatsApp as fallback
      if (data?.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
      }

      toast.success('Solicitação de integração enviada!');
      setShowRequestModal(false);
    } catch (err) {
      console.error('Error sending request:', err);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">Integrações Externas</h1>
        <p className="text-muted-foreground text-sm">Conecte o sistema com serviços externos para automação</p>
      </div>

      {/* Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">Integrações requerem contratos externos</p>
            <p className="text-sm text-yellow-700">
              As integrações listadas abaixo dependem de contratos ou convênios com os provedores de serviço. 
              {isMaster ? ' Clique em "Ver Requisitos" para mais detalhes.' : ' Entre em contato com o administrador do sistema.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {integrations.map(integration => (
          <Card key={integration.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  {integration.icon}
                </div>
                <StatusBadge status={integration.status} />
              </div>
              <CardTitle className="text-lg mt-3">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Funcionalidades</p>
                  <ul className="space-y-1">
                    {integration.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <CheckCircle size={14} className="text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {integration.provider && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Provedor: <span className="font-semibold">{integration.provider}</span>
                    </p>
                  </div>
                )}

                <div className="pt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleOpenRequirements(integration)}
                  >
                    <Settings size={16} className="mr-2" />
                    Ver Requisitos
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    title="Documentação"
                  >
                    <ExternalLink size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Integration Card - Only for Master */}
      {isMaster && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Precisa de uma integração específica?</h3>
                <p className="text-sm text-muted-foreground">
                  Solicite novas integrações ou personalizações para sua necessidade.
                  A equipe de desenvolvimento entrará em contato.
                </p>
              </div>
              <Button onClick={handleOpenRequestModal}>
                Solicitar Integração
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Modal */}
      <Dialog open={showRequirementsModal} onOpenChange={setShowRequirementsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={18} /> Requisitos para Integração
            </DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  {selectedIntegration.icon}
                </div>
                <div>
                  <h3 className="font-bold">{selectedIntegration.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIntegration.provider}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Requisitos necessários:</p>
                <ul className="space-y-2">
                  {selectedIntegration.requirements?.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm p-3 bg-muted rounded-lg">
                      <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm text-info">
                  <strong>Como proceder:</strong> Entre em contato com o provedor do serviço para obter os requisitos 
                  necessários. Após obtê-los, envie para suporte@floxhub.com.br que a equipe técnica fará a configuração.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Integration Modal - Only for Master */}
      {isMaster && (
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 size={18} /> Solicitar Nova Integração
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Nome da Integração *
                </label>
                <Input
                  value={requestForm.integrationName}
                  onChange={e => setRequestForm({ ...requestForm, integrationName: e.target.value })}
                  placeholder="Ex: API de Geolocalização, Sistema de Backup..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Descrição da Necessidade *
                </label>
                <Textarea
                  value={requestForm.description}
                  onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Descreva o que você precisa integrar e qual o objetivo..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSendRequest} disabled={sending} className="w-full gap-2">
                <Send size={16} />
                {sending ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                A solicitação será enviada para suporte@floxhub.com.br e WhatsApp (81) 98259-6969
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IntegrationsModule;
