import React from 'react';
import { CheckCircle2, Circle, Clock, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Requirement {
  id: string;
  name: string;
  status: 'done' | 'partial' | 'pending' | 'blocked';
  notes?: string;
}

interface Module {
  id: number;
  name: string;
  requirements: Requirement[];
}

const modules: Module[] = [
  {
    id: 1,
    name: 'Infraestrutura e Ambiente',
    requirements: [
      { id: '1.1', name: 'Ambiente de produção configurado', status: 'done', notes: 'Supabase + Lovable' },
      { id: '1.2', name: 'Ambiente de homologação', status: 'pending' },
      { id: '1.3', name: 'Banco de dados PostgreSQL', status: 'done', notes: 'Supabase PostgreSQL' },
      { id: '1.4', name: 'Backup automático diário', status: 'done', notes: 'Supabase gerencia' },
      { id: '1.5', name: 'CDN para assets estáticos', status: 'done' },
      { id: '1.6', name: 'Certificado SSL/HTTPS', status: 'done' },
      { id: '1.7', name: 'Domínio personalizado', status: 'pending' },
      { id: '1.8', name: 'Monitoramento de uptime', status: 'done' },
      { id: '1.9', name: 'Logs de sistema', status: 'done' },
      { id: '1.10', name: 'Escalabilidade automática', status: 'done' },
      { id: '1.11', name: 'API REST documentada', status: 'done' },
      { id: '1.12', name: 'Rate limiting', status: 'done' },
      { id: '1.13', name: 'Compressão de dados', status: 'done' },
      { id: '1.14', name: 'Cache de consultas', status: 'pending' },
      { id: '1.15', name: 'Versionamento de API', status: 'pending' },
      { id: '1.16', name: 'Ambiente de desenvolvimento local', status: 'done' },
    ],
  },
  {
    id: 2,
    name: 'Segurança e Controle de Acesso',
    requirements: [
      { id: '2.1', name: 'Autenticação por email/senha', status: 'done' },
      { id: '2.2', name: 'Recuperação de senha', status: 'done' },
      { id: '2.3', name: 'Confirmação de email', status: 'done' },
      { id: '2.4', name: 'Sessões seguras com JWT', status: 'done' },
      { id: '2.5', name: 'Row Level Security (RLS)', status: 'done' },
      { id: '2.6', name: 'Proteção contra CSRF', status: 'done' },
      { id: '2.7', name: 'Proteção contra XSS', status: 'done' },
      { id: '2.8', name: 'Logs de auditoria', status: 'done' },
      { id: '2.9', name: 'Bloqueio após tentativas', status: 'pending' },
      { id: '2.10', name: 'Autenticação 2FA', status: 'pending' },
    ],
  },
  {
    id: 3,
    name: 'Gestão de Usuários e Perfis',
    requirements: [
      { id: '3.1', name: 'Cadastro de usuários', status: 'done' },
      { id: '3.2', name: 'Edição de perfil', status: 'done' },
      { id: '3.3', name: 'Upload de avatar', status: 'pending' },
      { id: '3.4', name: 'Listagem de usuários', status: 'pending' },
      { id: '3.5', name: 'Ativação/desativação', status: 'pending' },
      { id: '3.6', name: 'Perfil Administrador Master', status: 'done' },
      { id: '3.7', name: 'Perfil Gestor da Parceria', status: 'done' },
      { id: '3.8', name: 'Perfil Técnico', status: 'done' },
      { id: '3.9', name: 'Perfil Usuário OSC', status: 'done' },
      { id: '3.10', name: 'Perfil Controle Interno', status: 'pending' },
      { id: '3.11', name: 'Perfil Comissão de Seleção', status: 'pending' },
      { id: '3.12', name: 'Perfil Comissão de Monitoramento', status: 'pending' },
      { id: '3.13', name: 'Perfil Conselhos Municipais', status: 'pending' },
      { id: '3.14', name: 'Perfil Procuradoria Jurídica', status: 'pending' },
      { id: '3.15', name: 'Perfil Representante Legal OSC', status: 'pending' },
      { id: '3.16', name: 'Controle de permissões por módulo', status: 'done' },
      { id: '3.17', name: 'Vinculação usuário-OSC', status: 'done' },
      { id: '3.18', name: 'Histórico de ações do usuário', status: 'done' },
    ],
  },
  {
    id: 4,
    name: 'Cadastro e Credenciamento de OSCs',
    requirements: [
      { id: '4.1', name: 'Cadastro de OSC', status: 'done' },
      { id: '4.2', name: 'CNPJ com validação', status: 'done' },
      { id: '4.3', name: 'Razão Social', status: 'done' },
      { id: '4.4', name: 'Status CND', status: 'done' },
      { id: '4.5', name: 'Validade CND', status: 'done' },
      { id: '4.6', name: 'Logo da OSC', status: 'pending' },
      { id: '4.7', name: 'Endereço completo', status: 'pending' },
      { id: '4.8', name: 'Contatos (telefone, email)', status: 'pending' },
      { id: '4.9', name: 'Representante legal', status: 'pending' },
      { id: '4.10', name: 'Upload de estatuto', status: 'pending' },
      { id: '4.11', name: 'Upload de ata de eleição', status: 'pending' },
      { id: '4.12', name: 'Upload de certidões', status: 'pending' },
      { id: '4.13', name: 'Consulta automática CNDs', status: 'blocked', notes: 'Requer API ReceitaWS' },
      { id: '4.14', name: 'Alerta de vencimento', status: 'done' },
      { id: '4.15', name: 'Histórico de documentos', status: 'pending' },
      { id: '4.16', name: 'Busca e filtros', status: 'done' },
      { id: '4.17', name: 'Exportação de dados', status: 'pending' },
    ],
  },
  {
    id: 5,
    name: 'Emendas Parlamentares',
    requirements: [
      { id: '5.1', name: 'Cadastro de emendas', status: 'done' },
      { id: '5.2', name: 'Número da emenda', status: 'done' },
      { id: '5.3', name: 'Autor/parlamentar', status: 'done' },
      { id: '5.4', name: 'Valor da emenda', status: 'done' },
      { id: '5.5', name: 'Ano de referência', status: 'done' },
      { id: '5.6', name: 'Tipo (impositiva/não impositiva)', status: 'done' },
      { id: '5.7', name: 'Status da emenda', status: 'done' },
      { id: '5.8', name: 'Vinculação com OSC', status: 'done' },
      { id: '5.9', name: 'Vinculação com parceria', status: 'done' },
      { id: '5.10', name: 'Prazo legal', status: 'done' },
      { id: '5.11', name: 'Relatórios de emendas', status: 'pending' },
    ],
  },
  {
    id: 6,
    name: 'PMIS',
    requirements: [
      { id: '6.1', name: 'Cadastro de PMIS', status: 'done' },
      { id: '6.2', name: 'Fluxo de análise', status: 'done' },
      { id: '6.3', name: 'Conversão para chamamento', status: 'pending' },
    ],
  },
  {
    id: 7,
    name: 'Chamamento Público',
    requirements: [
      { id: '7.1', name: 'Cadastro de edital', status: 'done' },
      { id: '7.2', name: 'Número do edital', status: 'done' },
      { id: '7.3', name: 'Objeto da seleção', status: 'done' },
      { id: '7.4', name: 'Valor total', status: 'done' },
      { id: '7.5', name: 'Data início/fim', status: 'done' },
      { id: '7.6', name: 'Status do chamamento', status: 'done' },
      { id: '7.7', name: 'Upload de PDF do edital', status: 'pending' },
      { id: '7.8', name: 'Publicação automática', status: 'pending' },
      { id: '7.9', name: 'Cronograma do processo', status: 'pending' },
      { id: '7.10', name: 'Critérios de seleção', status: 'pending' },
      { id: '7.11', name: 'Documentação exigida', status: 'pending' },
      { id: '7.12', name: 'Perguntas e respostas', status: 'pending' },
      { id: '7.13', name: 'Impugnações', status: 'pending' },
      { id: '7.14', name: 'Recursos', status: 'pending' },
    ],
  },
  {
    id: 8,
    name: 'Seleção de Propostas',
    requirements: [
      { id: '8.1', name: 'Inscrição de propostas', status: 'pending' },
      { id: '8.2', name: 'Upload de documentos', status: 'pending' },
      { id: '8.3', name: 'Validação de habilitação', status: 'pending' },
      { id: '8.4', name: 'Análise técnica', status: 'pending' },
      { id: '8.5', name: 'Pontuação de critérios', status: 'pending' },
      { id: '8.6', name: 'Ranking de propostas', status: 'pending' },
      { id: '8.7', name: 'Atas da comissão', status: 'pending' },
      { id: '8.8', name: 'Publicação de resultados', status: 'pending' },
      { id: '8.9', name: 'Prazo para recursos', status: 'pending' },
      { id: '8.10', name: 'Análise de recursos', status: 'pending' },
      { id: '8.11', name: 'Resultado final', status: 'pending' },
      { id: '8.12', name: 'Convocação do selecionado', status: 'pending' },
      { id: '8.13', name: 'Diligências', status: 'pending' },
      { id: '8.14', name: 'Desclassificação', status: 'pending' },
    ],
  },
  {
    id: 9,
    name: 'Plano de Trabalho',
    requirements: [
      { id: '9.1', name: 'Editor de plano de trabalho', status: 'partial' },
      { id: '9.2', name: 'Objetivos e justificativa', status: 'done' },
      { id: '9.3', name: 'Metas e indicadores', status: 'done' },
      { id: '9.4', name: 'Cronograma de execução', status: 'done' },
      { id: '9.5', name: 'Orçamento detalhado', status: 'done' },
      { id: '9.6', name: 'Equipe de trabalho', status: 'done' },
      { id: '9.7', name: 'Versionamento', status: 'done' },
      { id: '9.8', name: 'Aprovação/reprovação', status: 'done' },
      { id: '9.9', name: 'Histórico de versões', status: 'pending' },
      { id: '9.10', name: 'Comparativo entre versões', status: 'pending' },
      { id: '9.11', name: 'Exportação PDF', status: 'pending' },
      { id: '9.12', name: 'Assinatura digital', status: 'blocked' },
      { id: '9.13', name: 'Anexos ao plano', status: 'pending' },
    ],
  },
  {
    id: 10,
    name: 'Notificações e Ajustes',
    requirements: [
      { id: '10.1', name: 'Sistema de notificações', status: 'partial' },
      { id: '10.2', name: 'Notificação por email', status: 'pending' },
      { id: '10.3', name: 'Notificação in-app', status: 'pending' },
      { id: '10.4', name: 'Solicitação de ajustes', status: 'pending' },
      { id: '10.5', name: 'Prazo para resposta', status: 'pending' },
      { id: '10.6', name: 'Histórico de notificações', status: 'done' },
      { id: '10.7', name: 'Status lido/não lido', status: 'done' },
      { id: '10.8', name: 'Notificação de vencimentos', status: 'pending' },
      { id: '10.9', name: 'Notificação de pendências', status: 'pending' },
      { id: '10.10', name: 'Templates de mensagem', status: 'pending' },
      { id: '10.11', name: 'Agendamento de envio', status: 'pending' },
    ],
  },
  {
    id: 11,
    name: 'Instrumento de Parceria',
    requirements: [
      { id: '11.1', name: 'Cadastro de parceria', status: 'done' },
      { id: '11.2', name: 'Número do termo', status: 'done' },
      { id: '11.3', name: 'Tipo de origem', status: 'done' },
      { id: '11.4', name: 'Vinculação com OSC', status: 'done' },
      { id: '11.5', name: 'Valor repassado', status: 'done' },
      { id: '11.6', name: 'Vigência início/fim', status: 'done' },
      { id: '11.7', name: 'Status da parceria', status: 'done' },
      { id: '11.8', name: 'Vinculação com chamamento', status: 'done' },
      { id: '11.9', name: 'Geração automática de termo', status: 'pending' },
      { id: '11.10', name: 'Assinatura digital', status: 'blocked' },
      { id: '11.11', name: 'Publicação no DOE', status: 'pending' },
    ],
  },
  {
    id: 12,
    name: 'Aditivos e Apostilamentos',
    requirements: [
      { id: '12.1', name: 'Cadastro de aditivo', status: 'pending' },
      { id: '12.2', name: 'Tipo de aditivo', status: 'pending' },
      { id: '12.3', name: 'Justificativa', status: 'pending' },
      { id: '12.4', name: 'Novo valor/prazo', status: 'pending' },
      { id: '12.5', name: 'Vinculação com parceria', status: 'pending' },
      { id: '12.6', name: 'Aprovação de aditivo', status: 'pending' },
      { id: '12.7', name: 'Apostilamento', status: 'pending' },
      { id: '12.8', name: 'Histórico de alterações', status: 'pending' },
      { id: '12.9', name: 'Documento consolidado', status: 'pending' },
    ],
  },
  {
    id: 13,
    name: 'Prestação de Contas',
    requirements: [
      { id: '13.1', name: 'Registro de transações', status: 'done' },
      { id: '13.2', name: 'Data da transação', status: 'done' },
      { id: '13.3', name: 'Valor', status: 'done' },
      { id: '13.4', name: 'Tipo (receita/despesa)', status: 'done' },
      { id: '13.5', name: 'Categoria', status: 'done' },
      { id: '13.6', name: 'Fornecedor', status: 'done' },
      { id: '13.7', name: 'Upload de comprovante', status: 'done' },
      { id: '13.8', name: 'Status de conciliação', status: 'done' },
      { id: '13.9', name: 'Aprovação de despesa', status: 'done' },
      { id: '13.10', name: 'Glosa de despesa', status: 'done' },
      { id: '13.11', name: 'Seletor de parceria', status: 'done' },
      { id: '13.12', name: 'Totais (receita/despesa/saldo)', status: 'done' },
      { id: '13.13', name: 'REO - Execução de Objeto', status: 'partial' },
      { id: '13.14', name: 'REFF - Execução Financeira', status: 'done' },
      { id: '13.15', name: 'Evidências fotográficas', status: 'pending' },
      { id: '13.16', name: 'Listas de presença', status: 'pending' },
      { id: '13.17', name: 'Relatórios de atividades', status: 'pending' },
      { id: '13.18', name: 'Cronograma físico', status: 'pending' },
      { id: '13.19', name: 'Indicadores de resultado', status: 'pending' },
      { id: '13.20', name: 'Parecer técnico', status: 'pending' },
      { id: '13.21', name: 'Parecer financeiro', status: 'pending' },
      { id: '13.22', name: 'Devolução de recursos', status: 'pending' },
      { id: '13.23', name: 'Impugnação de glosa', status: 'pending' },
      { id: '13.24', name: 'Prestação parcial', status: 'pending' },
      { id: '13.25', name: 'Prestação final', status: 'pending' },
      { id: '13.26', name: 'Aprovação de contas', status: 'pending' },
      { id: '13.27', name: 'Reprovação de contas', status: 'pending' },
      { id: '13.28', name: 'TCE - Tomada de Contas', status: 'pending' },
      { id: '13.29', name: 'Conciliação bancária', status: 'pending' },
      { id: '13.30', name: 'Extrato bancário', status: 'pending' },
      { id: '13.31', name: 'Rendimentos de aplicação', status: 'pending' },
      { id: '13.32', name: 'Contrapartida', status: 'pending' },
      { id: '13.33', name: 'Relatório de execução', status: 'pending' },
      { id: '13.34', name: 'Checklist de documentos', status: 'pending' },
      { id: '13.35', name: 'Assinatura do gestor', status: 'blocked' },
      { id: '13.36', name: 'Assinatura do OSC', status: 'blocked' },
    ],
  },
  {
    id: 14,
    name: 'Monitoramento e Avaliação',
    requirements: [
      { id: '14.1', name: 'Painel de monitoramento', status: 'partial' },
      { id: '14.2', name: 'Visitas de campo', status: 'pending' },
      { id: '14.3', name: 'Relatório de visita', status: 'pending' },
      { id: '14.4', name: 'Fotos de monitoramento', status: 'pending' },
      { id: '14.5', name: 'Checklist de verificação', status: 'pending' },
      { id: '14.6', name: 'Parecer de monitoramento', status: 'pending' },
      { id: '14.7', name: 'Indicadores de desempenho', status: 'pending' },
      { id: '14.8', name: 'Alertas de irregularidade', status: 'pending' },
      { id: '14.9', name: 'Recomendações', status: 'pending' },
      { id: '14.10', name: 'Acompanhamento de metas', status: 'pending' },
      { id: '14.11', name: 'Cronograma de visitas', status: 'pending' },
      { id: '14.12', name: 'Designação de fiscal', status: 'pending' },
      { id: '14.13', name: 'Relatório trimestral', status: 'pending' },
      { id: '14.14', name: 'Relatório anual', status: 'pending' },
      { id: '14.15', name: 'Avaliação de impacto', status: 'pending' },
      { id: '14.16', name: 'Satisfação do público', status: 'pending' },
      { id: '14.17', name: 'Comparativo de resultados', status: 'pending' },
    ],
  },
  {
    id: 15,
    name: 'Comunicação',
    requirements: [
      { id: '15.1', name: 'Envio de mensagens', status: 'done' },
      { id: '15.2', name: 'Caixa de entrada', status: 'partial' },
      { id: '15.3', name: 'Mensagens enviadas', status: 'pending' },
      { id: '15.4', name: 'Anexos em mensagens', status: 'pending' },
      { id: '15.5', name: 'Resposta a mensagens', status: 'pending' },
      { id: '15.6', name: 'Notificação push', status: 'pending' },
      { id: '15.7', name: 'Notificação por email', status: 'pending' },
      { id: '15.8', name: 'Templates de comunicação', status: 'pending' },
      { id: '15.9', name: 'Comunicação em massa', status: 'pending' },
      { id: '15.10', name: 'Filtro por parceria', status: 'pending' },
      { id: '15.11', name: 'Filtro por OSC', status: 'pending' },
      { id: '15.12', name: 'Histórico de conversas', status: 'pending' },
      { id: '15.13', name: 'Status de leitura', status: 'done' },
      { id: '15.14', name: 'Urgência/prioridade', status: 'pending' },
      { id: '15.15', name: 'Agendamento', status: 'pending' },
      { id: '15.16', name: 'Relatório de comunicações', status: 'pending' },
    ],
  },
  {
    id: 16,
    name: 'Legislação e Documentação',
    requirements: [
      { id: '16.1', name: 'Cadastro de legislação', status: 'done' },
      { id: '16.2', name: 'Tipo de documento', status: 'done' },
      { id: '16.3', name: 'Número e data', status: 'done' },
      { id: '16.4', name: 'Ementa', status: 'done' },
      { id: '16.5', name: 'Conteúdo/texto integral', status: 'done' },
      { id: '16.6', name: 'Upload de arquivo', status: 'done' },
      { id: '16.7', name: 'Status ativo/inativo', status: 'done' },
      { id: '16.8', name: 'Busca por texto', status: 'pending' },
      { id: '16.9', name: 'Versionamento', status: 'pending' },
      { id: '16.10', name: 'Vinculação com parceria', status: 'pending' },
    ],
  },
  {
    id: 17,
    name: 'Manual do Sistema',
    requirements: [
      { id: '17.1', name: 'Documentação de uso', status: 'partial' },
      { id: '17.2', name: 'FAQ', status: 'pending' },
      { id: '17.3', name: 'Vídeos tutoriais', status: 'pending' },
      { id: '17.4', name: 'Busca no manual', status: 'pending' },
      { id: '17.5', name: 'Contextual help', status: 'pending' },
    ],
  },
  {
    id: 18,
    name: 'Relatórios e Exportação',
    requirements: [
      { id: '18.1', name: 'Relatório de parcerias', status: 'partial' },
      { id: '18.2', name: 'Relatório de OSCs', status: 'pending' },
      { id: '18.3', name: 'Relatório financeiro', status: 'pending' },
      { id: '18.4', name: 'Relatório de metas', status: 'pending' },
      { id: '18.5', name: 'Exportação CSV', status: 'pending' },
      { id: '18.6', name: 'Exportação PDF', status: 'pending' },
      { id: '18.7', name: 'Exportação Excel', status: 'pending' },
      { id: '18.8', name: 'Relatório personalizado', status: 'pending' },
      { id: '18.9', name: 'Agendamento de relatórios', status: 'pending' },
      { id: '18.10', name: 'Envio automático', status: 'pending' },
      { id: '18.11', name: 'Dashboard analítico', status: 'partial' },
    ],
  },
  {
    id: 19,
    name: 'Transparência',
    requirements: [
      { id: '19.1', name: 'Portal de transparência', status: 'done' },
      { id: '19.2', name: 'Dados abertos', status: 'pending' },
      { id: '19.3', name: 'Consulta pública', status: 'pending' },
      { id: '19.4', name: 'Filtros de busca', status: 'pending' },
      { id: '19.5', name: 'Download de dados', status: 'pending' },
      { id: '19.6', name: 'API pública', status: 'pending' },
    ],
  },
  {
    id: 20,
    name: 'Pesquisa e Busca',
    requirements: [
      { id: '20.1', name: 'Busca global', status: 'pending' },
      { id: '20.2', name: 'Busca por OSC', status: 'done' },
      { id: '20.3', name: 'Busca por parceria', status: 'pending' },
      { id: '20.4', name: 'Busca por documento', status: 'pending' },
      { id: '20.5', name: 'Filtros avançados', status: 'pending' },
    ],
  },
  {
    id: 21,
    name: 'Suporte e Capacitação',
    requirements: [
      { id: '21.1', name: 'Sistema de tickets', status: 'pending' },
      { id: '21.2', name: 'Chat de suporte', status: 'pending' },
      { id: '21.3', name: 'Base de conhecimento', status: 'pending' },
      { id: '21.4', name: 'Treinamentos online', status: 'pending' },
      { id: '21.5', name: 'Certificados', status: 'pending' },
      { id: '21.6', name: 'Avaliação de treinamento', status: 'pending' },
      { id: '21.7', name: 'Calendário de eventos', status: 'pending' },
      { id: '21.8', name: 'Inscrição em eventos', status: 'pending' },
      { id: '21.9', name: 'Material didático', status: 'pending' },
      { id: '21.10', name: 'Webinars', status: 'pending' },
      { id: '21.11', name: 'Fórum de discussão', status: 'pending' },
      { id: '21.12', name: 'Gamificação', status: 'pending' },
      { id: '21.13', name: 'Trilhas de aprendizado', status: 'pending' },
    ],
  },
  {
    id: 22,
    name: 'Customização e Parametrização',
    requirements: [
      { id: '22.1', name: 'Identidade visual', status: 'done' },
      { id: '22.2', name: 'Logo do município', status: 'pending' },
      { id: '22.3', name: 'Cores institucionais', status: 'done' },
      { id: '22.4', name: 'Parâmetros do sistema', status: 'pending' },
      { id: '22.5', name: 'Textos customizáveis', status: 'pending' },
      { id: '22.6', name: 'Workflows configuráveis', status: 'pending' },
    ],
  },
  {
    id: 23,
    name: 'Integrações',
    requirements: [
      { id: '23.1', name: 'API ReceitaWS (CNDs)', status: 'blocked', notes: 'Requer contrato' },
      { id: '23.2', name: 'Integração bancária', status: 'blocked', notes: 'Requer contrato' },
      { id: '23.3', name: 'Diário Oficial', status: 'blocked', notes: 'Requer API' },
      { id: '23.4', name: 'Assinatura digital', status: 'blocked', notes: 'Requer certificado' },
    ],
  },
  {
    id: 24,
    name: 'Migração de Dados',
    requirements: [
      { id: '24.1', name: 'Importação de OSCs', status: 'pending' },
      { id: '24.2', name: 'Importação de parcerias', status: 'pending' },
      { id: '24.3', name: 'Validação de dados', status: 'pending' },
    ],
  },
];

const getStatusIcon = (status: Requirement['status']) => {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="text-success" size={16} />;
    case 'partial':
      return <Clock className="text-warning" size={16} />;
    case 'blocked':
      return <Lock className="text-muted-foreground" size={16} />;
    default:
      return <Circle className="text-muted-foreground/50" size={16} />;
  }
};

const getStatusLabel = (status: Requirement['status']) => {
  switch (status) {
    case 'done': return 'Implementado';
    case 'partial': return 'Em desenvolvimento';
    case 'blocked': return 'Requer integração';
    default: return 'Pendente';
  }
};

const ModuleCard: React.FC<{ module: Module }> = ({ module }) => {
  const [expanded, setExpanded] = useState(false);
  
  const done = module.requirements.filter(r => r.status === 'done').length;
  const partial = module.requirements.filter(r => r.status === 'partial').length;
  const total = module.requirements.length;
  const progress = Math.round(((done + partial * 0.5) / total) * 100);
  
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm md:text-lg shrink-0">
            {module.id}
          </div>
          <div className="text-left min-w-0">
            <h4 className="font-bold text-foreground text-sm md:text-base truncate">{module.name}</h4>
            <p className="text-xs text-muted-foreground">{done}/{total} concluídos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div className="hidden sm:flex w-24 md:w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${progress >= 80 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`text-xs md:text-sm font-black min-w-[40px] text-right ${progress >= 80 ? 'text-success' : progress >= 50 ? 'text-warning' : 'text-primary'}`}>
            {progress}%
          </span>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>
      
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {module.requirements.map(req => (
            <div key={req.id} className="px-4 md:px-6 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
              {getStatusIcon(req.status)}
              <span className="text-xs font-mono text-muted-foreground shrink-0">{req.id}</span>
              <span className="text-xs md:text-sm text-foreground flex-1 min-w-0">{req.name}</span>
              {req.notes && (
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded hidden md:inline">
                  {req.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectProgress: React.FC = () => {
  const totalRequirements = modules.reduce((acc, m) => acc + m.requirements.length, 0);
  const doneRequirements = modules.reduce((acc, m) => acc + m.requirements.filter(r => r.status === 'done').length, 0);
  const partialRequirements = modules.reduce((acc, m) => acc + m.requirements.filter(r => r.status === 'partial').length, 0);
  const blockedRequirements = modules.reduce((acc, m) => acc + m.requirements.filter(r => r.status === 'blocked').length, 0);
  const pendingRequirements = totalRequirements - doneRequirements - partialRequirements - blockedRequirements;
  
  const overallProgress = Math.round(((doneRequirements + partialRequirements * 0.5) / totalRequirements) * 100);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
          <CheckCircle2 size={14} />
          <span>Acompanhamento de Desenvolvimento</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Checklist de Requisitos</h2>
        <p className="text-muted-foreground font-medium">279 requisitos em 24 módulos para o sistema MROSC completo.</p>
      </header>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-card p-4 md:p-6 rounded-2xl border border-border text-center">
          <div className="text-2xl md:text-3xl font-black text-foreground">{overallProgress}%</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase">Progresso Geral</div>
        </div>
        <div className="bg-success/10 p-4 md:p-6 rounded-2xl border border-success/20 text-center">
          <div className="text-2xl md:text-3xl font-black text-success">{doneRequirements}</div>
          <div className="text-[10px] font-bold text-success uppercase">Implementados</div>
        </div>
        <div className="bg-warning/10 p-4 md:p-6 rounded-2xl border border-warning/20 text-center">
          <div className="text-2xl md:text-3xl font-black text-warning">{partialRequirements}</div>
          <div className="text-[10px] font-bold text-warning uppercase">Em Desenvolvimento</div>
        </div>
        <div className="bg-muted p-4 md:p-6 rounded-2xl border border-border text-center">
          <div className="text-2xl md:text-3xl font-black text-muted-foreground">{pendingRequirements}</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase">Pendentes</div>
        </div>
        <div className="bg-muted p-4 md:p-6 rounded-2xl border border-border text-center col-span-2 md:col-span-1">
          <div className="text-2xl md:text-3xl font-black text-muted-foreground">{blockedRequirements}</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase">Requer Integração</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-card p-4 md:p-6 rounded-2xl border border-border">
        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-3">
          <span>Progresso Total</span>
          <span>{doneRequirements + partialRequirements} de {totalRequirements}</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          <div className="bg-success h-full transition-all" style={{ width: `${(doneRequirements / totalRequirements) * 100}%` }} />
          <div className="bg-warning h-full transition-all" style={{ width: `${(partialRequirements / totalRequirements) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Implementado</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> Em desenvolvimento</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Pendente</span>
        </div>
      </div>
      
      {/* Modules List */}
      <div className="space-y-3">
        {modules.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
};

export default ProjectProgress;
