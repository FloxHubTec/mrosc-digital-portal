import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, Lock, FileCheck, Building2, FileSignature, Newspaper,
  ExternalLink, AlertTriangle, CheckCircle, Settings
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'requires_contract' | 'coming_soon';
  icon: React.ReactNode;
  features: string[];
  provider?: string;
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
              Entre em contato com a equipe de TI para solicitar a ativação.
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
                    disabled={integration.status === 'requires_contract'}
                  >
                    <Settings size={16} className="mr-2" />
                    Configurar
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

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Link2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Precisa de uma integração específica?</h3>
              <p className="text-sm text-muted-foreground">
                Entre em contato com a equipe de desenvolvimento para solicitar novas integrações 
                ou personalizar as existentes para sua necessidade.
              </p>
            </div>
            <Button>
              Solicitar Integração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsModule;
