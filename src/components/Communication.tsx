import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Bell, Mail, Plus, X, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserRole } from '@/types';
import { mockCommunications } from '@/data/mockData';

interface Message {
  id: string;
  sender: string;
  sender_id: string;
  recipient: string;
  subject: string;
  message: string;
  snippet: string;
  date: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  read: boolean;
  thread: { sender: string; message: string; time: string }[];
}

const CommunicationModule: React.FC = () => {
  const { user, profile } = useAuth();
  
  // Check if user is admin_master
  const isAdminMaster = profile?.role === UserRole.MASTER || profile?.role === UserRole.SUPERADMIN;
  
  const [messages, setMessages] = useState<Message[]>([
    ...mockCommunications.map(c => ({
      ...c,
      snippet: c.message.substring(0, 60) + '...',
    })),
    { 
      id: '4', 
      sender: 'Controle Interno', 
      sender_id: '1',
      recipient: 'OSC Futuro Melhor',
      subject: 'Ajuste REFF - Outubro', 
      message: 'Prezados, notamos que na prestação de contas do mês de Outubro, o anexo referente ao FGTS está ilegível. Poderiam realizar o re-upload do documento até amanhã às 17h para que possamos liberar a próxima parcela?',
      snippet: 'Favor anexar comprovante de pagamento do FGTS referente à parcela...', 
      date: 'Hoje, 10:45', 
      priority: 'Alta', 
      read: false,
      thread: [
        { sender: 'Controle Interno', message: 'Prezados, notamos que na prestação de contas do mês de Outubro, o anexo referente ao FGTS está ilegível. Poderiam realizar o re-upload do documento até amanhã às 17h para que possamos liberar a próxima parcela?', time: '10:45' },
        { sender: 'OSC Futuro Melhor', message: 'Compreendido. Iremos providenciar a digitalização em alta resolução agora mesmo. O protocolo será atualizado.', time: '11:02' },
      ]
    },
    { 
      id: '5', 
      sender: 'OSC Futuro Melhor', 
      sender_id: '2',
      recipient: 'Gestor da Parceria',
      subject: 'Dúvida sobre Edital 001/2023', 
      message: 'Gostaríamos de esclarecer o item 4.2 do edital no que tange à documentação complementar exigida.',
      snippet: 'Gostaríamos de esclarecer o item 4.2 do edital no que tange...', 
      date: 'Ontem, 16:20', 
      priority: 'Média', 
      read: true,
      thread: [
        { sender: 'OSC Futuro Melhor', message: 'Gostaríamos de esclarecer o item 4.2 do edital no que tange à documentação complementar exigida.', time: '16:20' },
      ]
    },
    { 
      id: '6', 
      sender: 'Sistema (Alerta)', 
      sender_id: 'system',
      recipient: 'Todos',
      subject: 'Vencimento de CND Próximo', 
      message: 'A certidão da Receita Federal vence em 5 dias. Favor atualizar no sistema.',
      snippet: 'A certidão da Receita Federal vence em 5 dias. Favor atualizar.', 
      date: '18/10/2023', 
      priority: 'Alta', 
      read: true,
      thread: [
        { sender: 'Sistema', message: 'A certidão da Receita Federal vence em 5 dias. Favor atualizar no sistema.', time: '08:00' },
      ]
    },
  ]);
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'Média' as 'Alta' | 'Média' | 'Baixa',
  });

  const notifications = [
    { id: '1', title: 'Nova mensagem recebida', desc: 'Controle Interno enviou uma mensagem', time: 'Há 5 min', read: false },
    { id: '2', title: 'CND próxima do vencimento', desc: 'Receita Federal vence em 5 dias', time: 'Há 1 hora', read: false },
    { id: '3', title: 'Resposta ao ticket #1234', desc: 'Suporte respondeu seu ticket', time: 'Há 2 horas', read: true },
  ];

  const filteredMessages = messages.filter(msg => 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.message) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: profile?.full_name || 'Você',
      sender_id: user?.id || '',
      recipient: newMessage.recipient,
      subject: newMessage.subject,
      message: newMessage.message,
      snippet: newMessage.message.substring(0, 60) + '...',
      date: format(new Date(), "dd/MM/yyyy, HH:mm"),
      priority: newMessage.priority,
      read: true,
      thread: [
        { sender: profile?.full_name || 'Você', message: newMessage.message, time: format(new Date(), "HH:mm") }
      ]
    };
    
    setMessages([newMsg, ...messages]);
    setShowNewModal(false);
    setNewMessage({ recipient: '', subject: '', message: '', priority: 'Média' });
    toast.success('Comunicado enviado com sucesso!');
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    const updatedMessages = messages.map(msg => {
      if (msg.id === selectedMessage.id) {
        return {
          ...msg,
          thread: [
            ...msg.thread,
            { sender: profile?.full_name || 'Você', message: replyText, time: format(new Date(), "HH:mm") }
          ]
        };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    setSelectedMessage({
      ...selectedMessage,
      thread: [
        ...selectedMessage.thread,
        { sender: profile?.full_name || 'Você', message: replyText, time: format(new Date(), "HH:mm") }
      ]
    });
    setReplyText('');
    toast.success('Resposta enviada!');
  };

  const handleOpenEmail = async () => {
    if (!selectedMessage) return;
    
    const subject = encodeURIComponent(`Re: ${selectedMessage.subject}`);
    const body = encodeURIComponent(
      `\n\n---\nMensagem original:\nDe: ${selectedMessage.sender}\nAssunto: ${selectedMessage.subject}\n\n${selectedMessage.message}`
    );
    
    // Open email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    // Show toast confirmation
    toast.success('Email aberto no seu cliente de correio!');
  };

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <MessageSquare size={14} />
            <span>Mensageria e Notificações Oficiais</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Central de Comunicados</h2>
          <p className="text-muted-foreground font-medium">Registro histórico de todas as interações entre Administração e parceiros.</p>
        </div>
        {/* Botão Novo Comunicado - APENAS para Admin Master */}
        {isAdminMaster && (
          <Button 
            onClick={() => setShowNewModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 flex items-center space-x-2 transition-all"
          >
            <Plus size={18} />
            <span>Novo Comunicado</span>
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <aside className="lg:col-span-4 bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Buscar conversa..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-muted border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-border">
            {filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-6 cursor-pointer hover:bg-primary/5 transition-all ${!msg.read ? 'bg-primary/5' : ''} ${selectedMessage?.id === msg.id ? 'bg-primary/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{msg.sender}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">{msg.date}</span>
                  </div>
                  <h4 className={`text-sm mb-1 ${!msg.read ? 'font-black text-foreground' : 'font-bold text-foreground/80'}`}>{msg.subject}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{msg.snippet}</p>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      msg.priority === 'Alta' ? 'bg-destructive/10 text-destructive' : msg.priority === 'Média' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
                    }`}>{msg.priority}</span>
                    {!msg.read && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="lg:col-span-8 bg-card rounded-[2.5rem] shadow-xl border border-border p-10 flex flex-col">
          {selectedMessage ? (
            <>
              <div className="flex items-center justify-between pb-8 border-b border-border mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black">
                    {selectedMessage.sender.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{selectedMessage.subject}</h3>
                    <p className="text-xs text-muted-foreground font-medium">Protocolo: #COM-{selectedMessage.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleOpenEmail}
                    className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    title="Enviar por Email"
                  >
                    <Mail size={18} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-all relative"
                      title="Notificações"
                    >
                      <Bell size={18} />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                          {notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                        <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-4 border-b border-border flex justify-between items-center">
                            <h4 className="font-bold">Notificações</h4>
                            <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                              <X size={14} />
                            </Button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {notifications.map(notif => (
                              <div key={notif.id} className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <p className="font-semibold text-sm">{notif.title}</p>
                                  <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{notif.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto mb-10 pr-4">
                {selectedMessage.thread.map((item, idx) => (
                  <div key={idx} className={`flex flex-col ${item.sender === (profile?.full_name || 'Você') || item.sender === 'OSC Futuro Melhor' ? 'items-end' : 'items-start'} max-w-lg ${item.sender === (profile?.full_name || 'Você') || item.sender === 'OSC Futuro Melhor' ? 'ml-auto' : ''}`}>
                    <div className={`p-6 rounded-3xl text-sm font-medium leading-relaxed ${
                      item.sender === (profile?.full_name || 'Você') || item.sender === 'OSC Futuro Melhor'
                        ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg'
                        : 'bg-muted text-foreground rounded-tl-none'
                    }`}>
                      {item.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold mt-2 mx-2">{item.time} • {item.sender}</span>
                  </div>
                ))}
              </div>

              <div className="relative group">
                <textarea 
                  placeholder="Digite sua resposta oficial..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full pl-6 pr-24 py-5 bg-muted border border-border rounded-[2rem] text-sm font-medium outline-none focus:ring-8 focus:ring-primary/10 focus:bg-card transition-all h-32 resize-none"
                ></textarea>
                <button 
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
                >
                  Enviar Agora
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para visualizar</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Message Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Comunicado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-bold mb-2 block">Destinatário *</label>
              <Select value={newMessage.recipient} onValueChange={(v) => setNewMessage({ ...newMessage, recipient: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o destinatário" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="controle_interno">Controle Interno</SelectItem>
                  <SelectItem value="gestor">Gestor da Parceria</SelectItem>
                  <SelectItem value="osc_futuro">OSC Futuro Melhor</SelectItem>
                  <SelectItem value="osc_vida">Associação Vida Plena</SelectItem>
                  <SelectItem value="todos">Todos os Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold mb-2 block">Assunto *</label>
              <Input 
                placeholder="Assunto do comunicado"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-2 block">Prioridade</label>
              <Select value={newMessage.priority} onValueChange={(v: 'Alta' | 'Média' | 'Baixa') => setNewMessage({ ...newMessage, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold mb-2 block">Mensagem *</label>
              <Textarea 
                placeholder="Digite sua mensagem..."
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
              <Button onClick={handleSendMessage}>Enviar Comunicado</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationModule;
