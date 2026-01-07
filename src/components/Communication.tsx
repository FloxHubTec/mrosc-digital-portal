
import React from 'react';
import { MessageSquare, Send, Search, Bell, Mail } from 'lucide-react';

const CommunicationModule: React.FC = () => {
  const messages = [
    { id: '1', sender: 'Controle Interno', subject: 'Ajuste REFF - Outubro', snippet: 'Favor anexar comprovante de pagamento do FGTS referente à parcela...', date: 'Hoje, 10:45', priority: 'Alta', read: false },
    { id: '2', sender: 'OSC Futuro Melhor', subject: 'Dúvida sobre Edital 001/2023', snippet: 'Gostaríamos de esclarecer o item 4.2 do edital no que tange...', date: 'Ontem, 16:20', priority: 'Média', read: true },
    { id: '3', sender: 'Sistema (Alerta)', subject: 'Vencimento de CND Próximo', snippet: 'A certidão da Receita Federal vence em 5 dias. Favor atualizar.', date: '18/10/2023', priority: 'Alta', read: true },
  ];

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
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 flex items-center space-x-2 transition-all">
          <Send size={18} />
          <span>Novo Comunicado</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <aside className="lg:col-span-4 bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Buscar conversa..." 
                className="pl-12 pr-6 py-3 bg-muted border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-border">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-6 cursor-pointer hover:bg-primary/5 transition-all ${!msg.read ? 'bg-primary/5' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{msg.sender}</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">{msg.date}</span>
                </div>
                <h4 className={`text-sm mb-1 ${!msg.read ? 'font-black text-foreground' : 'font-bold text-foreground/80'}`}>{msg.subject}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{msg.snippet}</p>
                <div className="flex items-center mt-3 space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    msg.priority === 'Alta' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'
                  }`}>{msg.priority}</span>
                  {!msg.read && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-8 bg-card rounded-[2.5rem] shadow-xl border border-border p-10 flex flex-col">
          <div className="flex items-center justify-between pb-8 border-b border-border mb-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black">CI</div>
              <div>
                <h3 className="text-xl font-black text-foreground">Ajuste REFF - Outubro</h3>
                <p className="text-xs text-muted-foreground font-medium">Protocolo: #COM-2023-9821</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-all"><Mail size={18} /></button>
              <button className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-all"><Bell size={18} /></button>
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto mb-10 pr-4">
            <div className="flex flex-col items-start max-w-lg">
              <div className="bg-muted p-6 rounded-3xl rounded-tl-none text-sm text-foreground font-medium leading-relaxed">
                Prezados, notamos que na prestação de contas do mês de Outubro, o anexo referente ao FGTS está ilegível. Poderiam realizar o re-upload do documento até amanhã às 17h para que possamos liberar a próxima parcela?
              </div>
              <span className="text-[10px] text-muted-foreground font-bold mt-2 ml-2">10:45 • Controle Interno</span>
            </div>

            <div className="flex flex-col items-end">
              <div className="bg-primary p-6 rounded-3xl rounded-tr-none text-sm text-primary-foreground font-medium leading-relaxed max-w-lg shadow-lg">
                Compreendido. Iremos providenciar a digitalização em alta resolução agora mesmo. O protocolo será atualizado.
              </div>
              <span className="text-[10px] text-muted-foreground font-bold mt-2 mr-2">11:02 • OSC Futuro Melhor (Lida)</span>
            </div>
          </div>

          <div className="relative group">
            <textarea 
              placeholder="Digite sua resposta oficial..." 
              className="w-full pl-6 pr-24 py-5 bg-muted border border-border rounded-[2rem] text-sm font-medium outline-none focus:ring-8 focus:ring-primary/10 focus:bg-card transition-all h-32 resize-none"
            ></textarea>
            <button className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-all shadow-xl">
              Enviar Agora
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunicationModule;
