import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupport, SupportTicket, KnowledgeArticle, TrainingEvent } from '@/hooks/useSupport';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { 
  HelpCircle, BookOpen, Calendar, Search, Plus, MessageCircle, 
  CheckCircle, Clock, XCircle, Eye, Send, Video, FileText,
  Users, Phone, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockKnowledgeBase, mockTrainingEvents, mockTickets, openWhatsApp } from '@/data/mockData';
import { Label } from '@/components/ui/label';

const TicketStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    aberto: { color: 'bg-blue-100 text-blue-800', label: 'Aberto', icon: <Clock size={12} /> },
    respondido: { color: 'bg-green-100 text-green-800', label: 'Respondido', icon: <CheckCircle size={12} /> },
    fechado: { color: 'bg-gray-100 text-gray-800', label: 'Fechado', icon: <XCircle size={12} /> },
  };
  const { color, label, icon } = config[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: null };
  return <Badge className={`${color} font-semibold flex items-center gap-1`}>{icon} {label}</Badge>;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config: Record<string, string> = {
    baixa: 'bg-gray-100 text-gray-700',
    media: 'bg-yellow-100 text-yellow-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700',
  };
  return <Badge className={config[priority] || 'bg-gray-100 text-gray-700'}>{priority}</Badge>;
};

const SupportModule: React.FC = () => {
  const { 
    tickets, articles, events, loading, 
    createTicket, respondTicket, closeTicket,
    createArticle, incrementViews, createEvent, inscribeEvent,
    getTicketStats, searchArticles
  } = useSupport();
  const { user, profile } = useAuth();
  
  // Check if user is OSC
  const isOSC = profile?.role === 'osc_user' || profile?.role === 'Usuário OSC' || profile?.role === 'Representante Legal OSC';
  
  // Check if user is Admin Master
  const isAdminMaster = profile?.role === 'admin_master' || profile?.role === 'Administrador Master';
  
  // Check if user can create tickets (Admin Master, Técnico, Gestor, Controle)
  const canCreateTicket = profile?.role === 'admin_master' || 
                          profile?.role === 'Administrador Master' ||
                          profile?.role === 'tecnico' || 
                          profile?.role === 'Técnico - Execução Física' ||
                          profile?.role === 'Técnico - Execução Financeira' ||
                          profile?.role === 'gestor' || 
                          profile?.role === 'Gestor da Parceria' ||
                          profile?.role === 'controle' ||
                          profile?.role === 'Controle Interno';
  
  // Same permission for training request
  const canRequestTraining = canCreateTicket;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [responseText, setResponseText] = useState('');
  
  const [ticketForm, setTicketForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'geral',
    prioridade: 'media',
  });
  
  const [articleForm, setArticleForm] = useState({
    titulo: '',
    conteudo: '',
    categoria: 'geral',
    tags: '',
  });
  
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descricao: '',
    tipo: 'webinar',
    data_inicio: '',
    data_fim: '',
    link_inscricao: '',
    vagas: '',
  });

  const [showInscriptionModal, setShowInscriptionModal] = useState(false);
  const [selectedEventForInscription, setSelectedEventForInscription] = useState<any>(null);
  const [inscriptionForm, setInscriptionForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    setor: '',
    cargo: '',
  });

  // Training Request State
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    tema: '',
    dataPreferencial: '',
    publicoAlvo: 'gestores',
  });

  const handleTrainingRequest = () => {
    if (!trainingForm.tema || !trainingForm.dataPreferencial) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const protocolo = `TREINO-${Date.now().toString(36).toUpperCase()}`;
    toast.success(`Solicitação registrada! Protocolo: ${protocolo}`);
    setShowTrainingModal(false);
    setTrainingForm({ tema: '', dataPreferencial: '', publicoAlvo: 'gestores' });
  };

  const ticketStats = getTicketStats();
  const filteredArticles = searchArticles(searchTerm);
  
  // Filter tickets to show only user's own tickets
  const userTickets = tickets.filter(t => t.user_id === user?.id);
  
  // Use mock data for knowledge base if empty
  const displayArticles = filteredArticles.length > 0 ? filteredArticles : mockKnowledgeBase.filter(a => 
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Use mock data for events if empty
  const displayEvents = events.length > 0 ? events : mockTrainingEvents;
  
  // Use filtered user tickets or mock data
  const displayTickets = userTickets.length > 0 ? userTickets : (user ? [] : mockTickets.slice(0, 1));

  const handleCreateTicket = async () => {
    if (!user || !ticketForm.titulo || !ticketForm.descricao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const result = await createTicket({ ...ticketForm, user_id: user.id });
    if (result) {
      toast.success('Ticket aberto com sucesso!');
      setShowTicketModal(false);
      setTicketForm({ titulo: '', descricao: '', categoria: 'geral', prioridade: 'media' });
    }
  };

  const handleRespondTicket = async () => {
    if (!selectedTicket || !responseText || !user) return;
    const result = await respondTicket(selectedTicket.id, responseText, user.id);
    if (result) {
      toast.success('Resposta enviada!');
      setSelectedTicket(null);
      setResponseText('');
    }
  };

  const handleCreateArticle = async () => {
    if (!articleForm.titulo || !articleForm.conteudo) {
      toast.error('Preencha título e conteúdo');
      return;
    }
    const result = await createArticle({
      ...articleForm,
      tags: articleForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    if (result) {
      toast.success('Artigo publicado!');
      setShowArticleModal(false);
      setArticleForm({ titulo: '', conteudo: '', categoria: 'geral', tags: '' });
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.titulo) {
      toast.error('Informe o título do evento');
      return;
    }
    const result = await createEvent({
      ...eventForm,
      vagas: eventForm.vagas ? parseInt(eventForm.vagas) : undefined,
    });
    if (result) {
      toast.success('Evento criado!');
      setShowEventModal(false);
      setEventForm({ titulo: '', descricao: '', tipo: 'webinar', data_inicio: '', data_fim: '', link_inscricao: '', vagas: '' });
    }
  };

  const handleEventInscription = async () => {
    if (!inscriptionForm.nome || !inscriptionForm.email || !inscriptionForm.telefone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (selectedEventForInscription) {
      await inscribeEvent(selectedEventForInscription.id);
      toast.success(`Inscrição realizada com sucesso para ${selectedEventForInscription.titulo}!`);
      setShowInscriptionModal(false);
      setSelectedEventForInscription(null);
      setInscriptionForm({ nome: '', email: '', telefone: '', empresa: '', setor: '', cargo: '' });
    }
  };

  const openInscriptionForm = (event: any) => {
    setSelectedEventForInscription(event);
    setShowInscriptionModal(true);
  };

  const handleWhatsAppSupport = () => {
    openWhatsApp('Olá! Preciso de suporte no sistema MROSC Unaí.');
    toast.success('Redirecionando para WhatsApp...');
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
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Suporte e Capacitação</h1>
          <p className="text-muted-foreground text-sm">Central de ajuda, conhecimento e treinamentos</p>
        </div>
      </div>

      {/* Quick Stats - Hidden for OSC */}
      {!isOSC && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-blue-800">{ticketStats.aberto}</p>
              <p className="text-xs text-blue-600">Tickets Abertos</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-green-800">{ticketStats.respondido}</p>
              <p className="text-xs text-green-600">Respondidos</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-purple-800">{displayArticles.length}</p>
              <p className="text-xs text-purple-600">Artigos</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-orange-800">{displayEvents.length}</p>
              <p className="text-xs text-orange-600">Eventos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OSC: WhatsApp Contact Button */}
      {isOSC && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-black text-green-800 text-lg">Precisa de Ajuda?</h3>
                <p className="text-green-600 text-sm">Entre em contato com nossa central de suporte via WhatsApp</p>
              </div>
            </div>
            <Button 
              onClick={handleWhatsAppSupport}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6 py-3"
            >
              <MessageCircle size={18} />
              Enviar Mensagem
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Training Section - Only for Admin Master, Técnico, Gestor, Controle */}
      {canRequestTraining && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-600 rounded-2xl">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-purple-800 dark:text-purple-200">Treinamento e Capacitação</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Solicite treinamentos personalizados para sua equipe ou OSC
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowTrainingModal(true)}
                className="bg-purple-700 hover:bg-purple-800 text-white gap-2"
              >
                <GraduationCap size={16} />
                Solicitar Agendamento de Treinamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Request Modal */}
      <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <GraduationCap size={20} className="text-purple-600" />
              Solicitar Treinamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-bold mb-2 block">Tema do Treinamento *</Label>
              <Input 
                placeholder="Ex: Prestação de Contas MROSC" 
                value={trainingForm.tema}
                onChange={e => setTrainingForm({ ...trainingForm, tema: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-bold mb-2 block">Data Preferencial *</Label>
              <Input 
                type="date"
                value={trainingForm.dataPreferencial}
                onChange={e => setTrainingForm({ ...trainingForm, dataPreferencial: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-bold mb-2 block">Público Alvo *</Label>
              <Select value={trainingForm.publicoAlvo} onValueChange={v => setTrainingForm({ ...trainingForm, publicoAlvo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestores">Gestores Públicos</SelectItem>
                  <SelectItem value="osc">Representantes de OSC</SelectItem>
                  <SelectItem value="ambos">Gestores e OSC</SelectItem>
                  <SelectItem value="tecnicos">Técnicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTrainingRequest} className="w-full gap-2 bg-purple-700 hover:bg-purple-800">
              <Send size={16} />
              Enviar Solicitação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs - OSC sees only Conhecimento and Eventos */}
      <Tabs defaultValue={isOSC ? "knowledge" : "tickets"} className="space-y-4">
        <TabsList className={`grid w-full max-w-md ${isOSC ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {!isOSC && (
            <TabsTrigger value="tickets" className="gap-2">
              <HelpCircle size={16} /> Tickets
            </TabsTrigger>
          )}
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen size={16} /> Conhecimento
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar size={16} /> Eventos
          </TabsTrigger>
        </TabsList>

        {/* TICKETS TAB - Hidden for OSC */}
        {!isOSC && (
          <TabsContent value="tickets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Meus Tickets de Suporte</h2>
              {canCreateTicket && (
                <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus size={16} /> Novo Ticket</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Abrir Ticket de Suporte</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input 
                        placeholder="Título do problema *" 
                        value={ticketForm.titulo}
                        onChange={e => setTicketForm({ ...ticketForm, titulo: e.target.value })}
                      />
                      <Textarea 
                        placeholder="Descreva seu problema detalhadamente *" 
                        value={ticketForm.descricao}
                        onChange={e => setTicketForm({ ...ticketForm, descricao: e.target.value })}
                        rows={4}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Select value={ticketForm.categoria} onValueChange={v => setTicketForm({ ...ticketForm, categoria: v })}>
                          <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="geral">Geral</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="acesso">Acesso</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={ticketForm.prioridade} onValueChange={v => setTicketForm({ ...ticketForm, prioridade: v })}>
                          <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateTicket} className="w-full">Enviar Ticket</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-3">
              {displayTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Você não tem tickets de suporte</p>
                  </CardContent>
                </Card>
              ) : (
                displayTickets.map((ticket: any) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{ticket.titulo}</h3>
                            <TicketStatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.prioridade} />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.descricao}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Aberto em {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          {ticket.resposta && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-700 mb-1">Resposta:</p>
                              <p className="text-sm text-green-800">{ticket.resposta}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {ticket.status === 'aberto' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Send size={14} />
                            </Button>
                          )}
                          {ticket.status === 'respondido' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => closeTicket(ticket.id)}
                            >
                              Fechar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Response Modal */}
            <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
              <DialogContent>
                <DialogHeader><DialogTitle>Responder Ticket</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="bg-muted p-3 rounded">
                    <p className="font-semibold">{selectedTicket?.titulo}</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket?.descricao}</p>
                  </div>
                  <Textarea 
                    placeholder="Digite sua resposta..." 
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleRespondTicket} className="w-full">Enviar Resposta</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}

        {/* KNOWLEDGE BASE TAB */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Buscar artigos..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Botão Novo Artigo - Apenas Admin Master */}
            {isAdminMaster && (
              <Dialog open={showArticleModal} onOpenChange={setShowArticleModal}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus size={16} /> Novo Artigo</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Publicar Artigo</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input 
                      placeholder="Título do artigo *" 
                      value={articleForm.titulo}
                      onChange={e => setArticleForm({ ...articleForm, titulo: e.target.value })}
                    />
                    <Select value={articleForm.categoria} onValueChange={v => setArticleForm({ ...articleForm, categoria: v })}>
                      <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="mrosc">MROSC</SelectItem>
                        <SelectItem value="prestacao">Prestação de Contas</SelectItem>
                        <SelectItem value="sistema">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Conteúdo do artigo *" 
                      value={articleForm.conteudo}
                      onChange={e => setArticleForm({ ...articleForm, conteudo: e.target.value })}
                      rows={8}
                    />
                    <Input 
                      placeholder="Tags (separadas por vírgula)" 
                      value={articleForm.tags}
                      onChange={e => setArticleForm({ ...articleForm, tags: e.target.value })}
                    />
                    <Button onClick={handleCreateArticle} className="w-full">Publicar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayArticles.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum artigo encontrado</p>
                </CardContent>
              </Card>
            ) : (
              displayArticles.map((article: any) => (
                <Card 
                  key={article.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setSelectedArticle(article); incrementViews(article.id); }}
                >
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">{article.categoria}</Badge>
                    <h3 className="font-semibold mb-2 line-clamp-2">{article.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{article.conteudo}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {article.visualizacoes}
                      </span>
                      {article.tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Article View Modal */}
          <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <Badge variant="secondary" className="w-fit mb-2">{selectedArticle?.categoria}</Badge>
                <DialogTitle>{selectedArticle?.titulo}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{selectedArticle?.conteudo}</p>
              </div>
              {selectedArticle?.tags && selectedArticle.tags.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {selectedArticle.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Eventos e Treinamentos</h2>
            {/* Botão Novo Evento - Apenas Admin Master */}
            {isAdminMaster && (
              <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus size={16} /> Novo Evento</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Criar Evento</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input 
                      placeholder="Título do evento *" 
                      value={eventForm.titulo}
                      onChange={e => setEventForm({ ...eventForm, titulo: e.target.value })}
                    />
                    <Select value={eventForm.tipo} onValueChange={v => setEventForm({ ...eventForm, tipo: v })}>
                      <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="curso_online">Curso Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Descrição do evento" 
                      value={eventForm.descricao}
                      onChange={e => setEventForm({ ...eventForm, descricao: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground">Data/Hora Início</label>
                        <Input 
                          type="datetime-local" 
                          value={eventForm.data_inicio}
                          onChange={e => setEventForm({ ...eventForm, data_inicio: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground">Data/Hora Fim</label>
                        <Input 
                          type="datetime-local" 
                          value={eventForm.data_fim}
                          onChange={e => setEventForm({ ...eventForm, data_fim: e.target.value })}
                        />
                      </div>
                    </div>
                    <Input 
                      placeholder="Link de inscrição" 
                      value={eventForm.link_inscricao}
                      onChange={e => setEventForm({ ...eventForm, link_inscricao: e.target.value })}
                    />
                    <Input 
                      type="number" 
                      placeholder="Número de vagas" 
                      value={eventForm.vagas}
                      onChange={e => setEventForm({ ...eventForm, vagas: e.target.value })}
                    />
                    <Button onClick={handleCreateEvent} className="w-full">Criar Evento</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {displayEvents.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento agendado</p>
                </CardContent>
              </Card>
            ) : (
              displayEvents.map((event: any) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className={`h-2 ${
                    event.tipo === 'webinar' ? 'bg-blue-500' : 
                    event.tipo === 'presencial' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {event.tipo === 'webinar' && <Video size={16} className="text-blue-600" />}
                          {event.tipo === 'presencial' && <Users size={16} className="text-green-600" />}
                          {event.tipo === 'curso_online' && <FileText size={16} className="text-purple-600" />}
                          <Badge variant="secondary">{event.tipo}</Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{event.titulo}</h3>
                        {event.descricao && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.descricao}</p>
                        )}
                        {event.data_inicio && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(event.data_inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                        {event.vagas && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.inscritos}/{event.vagas} inscritos
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => openInscriptionForm(event)}
                        disabled={event.vagas !== null && event.inscritos >= event.vagas}
                      >
                        Inscrever-se
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Inscription Form Modal */}
          <Dialog open={showInscriptionModal} onOpenChange={setShowInscriptionModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Inscrição em Evento</DialogTitle>
                {selectedEventForInscription && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedEventForInscription.titulo}</p>
                )}
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Nome *</label>
                  <Input 
                    placeholder="Seu nome completo" 
                    value={inscriptionForm.nome}
                    onChange={e => setInscriptionForm({ ...inscriptionForm, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">E-mail *</label>
                  <Input 
                    type="email"
                    placeholder="seu@email.com" 
                    value={inscriptionForm.email}
                    onChange={e => setInscriptionForm({ ...inscriptionForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Telefone *</label>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    value={inscriptionForm.telefone}
                    onChange={e => setInscriptionForm({ ...inscriptionForm, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Empresa</label>
                  <Input 
                    placeholder="Nome da empresa ou organização" 
                    value={inscriptionForm.empresa}
                    onChange={e => setInscriptionForm({ ...inscriptionForm, empresa: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Setor</label>
                    <Input 
                      placeholder="Setor de atuação" 
                      value={inscriptionForm.setor}
                      onChange={e => setInscriptionForm({ ...inscriptionForm, setor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Cargo</label>
                    <Input 
                      placeholder="Seu cargo" 
                      value={inscriptionForm.cargo}
                      onChange={e => setInscriptionForm({ ...inscriptionForm, cargo: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleEventInscription} className="w-full">
                  Confirmar Inscrição
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportModule;
