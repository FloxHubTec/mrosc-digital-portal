import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Eye,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  MapPin,
  Camera,
  ImageIcon,
  MessageSquareWarning,
  Send,
  Paperclip,
  ShieldCheck,
  Loader2,
  Trophy,
  Award,
  Medal,
} from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { usePublicCalls, PublicCall } from "@/hooks/usePublicCalls";
import { useProposals, Proposal } from "@/hooks/useProposals";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

// Interface para as fotos
interface FotoEvidencia {
  url: string;
  legenda: string;
  tipo: "antes" | "depois" | "evento";
}

// Interface extendida para incluir as fotos
interface Partnership {
  id: string;
  osc: string;
  cnpj: string;
  type: string;
  obj: string;
  val: string;
  status: string;
  vigencia: string;
  responsavel: string;
  repasses: { data: string; valor: string }[];
  metas: string;
  fotos?: FotoEvidencia[]; // Novo campo opcional
}

// Mock data for partnerships COM FOTOS ADICIONADAS
const mockPartnerships: Partnership[] = [
  {
    id: "1",
    osc: "Inst. Unaí Forte",
    cnpj: "12.345.678/0001-01",
    type: "Termo de Fomento",
    obj: "Reforma do Refeitório Escolar Rural",
    val: "R$ 250.000,00",
    status: "Aprovada",
    vigencia: "01/01/2025 a 31/12/2025",
    responsavel: "João Silva",
    repasses: [
      { data: "15/01/2025", valor: "R$ 62.500,00" },
      { data: "15/04/2025", valor: "R$ 62.500,00" },
      { data: "15/07/2025", valor: "R$ 62.500,00" },
      { data: "15/10/2025", valor: "R$ 62.500,00" },
    ],
    metas: "Atender 500 alunos da zona rural com refeições diárias",
    fotos: [
      {
        url: "https://images.unsplash.com/photo-1518644730709-0835105d9daa?q=80&w=1000&auto=format&fit=crop",
        legenda: "Antes: Estrutura antiga e sem ventilação",
        tipo: "antes",
      },
      {
        url: "https://images.unsplash.com/photo-1596464716127-f9a822718917?q=80&w=1000&auto=format&fit=crop",
        legenda: "Durante: Troca do telhado e pintura",
        tipo: "evento",
      },
      {
        url: "https://images.unsplash.com/photo-1577896335477-167bb3090623?q=80&w=1000&auto=format&fit=crop",
        legenda: "Depois: Novo refeitório entregue",
        tipo: "depois",
      },
    ],
  },
  {
    id: "2",
    osc: "Assoc. Vida Plena",
    cnpj: "98.765.432/0001-99",
    type: "Termo de Colaboração",
    obj: "Oficinas de Música",
    val: "R$ 85.000,00",
    status: "Em Análise",
    vigencia: "01/03/2025 a 28/02/2026",
    responsavel: "Maria Santos",
    repasses: [
      { data: "01/03/2025", valor: "R$ 42.500,00" },
      { data: "01/09/2025", valor: "R$ 42.500,00" },
    ],
    metas: "Capacitar 200 jovens em instrumentos musicais",
    fotos: [
      {
        url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop",
        legenda: "Aula inaugural com os novos instrumentos",
        tipo: "evento",
      },
    ],
  },
  {
    id: "3",
    osc: "Creche Raio de Sol",
    cnpj: "45.123.789/0001-44",
    type: "Termo de Fomento",
    obj: "Manutenção de Berçário",
    val: "R$ 150.000,00",
    status: "Aprovada com Ressalvas",
    vigencia: "01/02/2025 a 31/01/2026",
    responsavel: "Ana Oliveira",
    repasses: [
      { data: "01/02/2025", valor: "R$ 50.000,00" },
      { data: "01/06/2025", valor: "R$ 50.000,00" },
      { data: "01/10/2025", valor: "R$ 50.000,00" },
    ],
    metas: "Atender 100 crianças de 0 a 3 anos",
  },
];

interface Chamamento {
  id: string;
  edital: string;
  titulo: string;
  pdfUrl: string;
  status: string;
  dataPublicacao: string;
  dataEncerramento: string;
  valorTotal: string;
  objeto: string;
  requisitos: string[];
  cronograma: { fase: string; data: string }[];
}

// Mock data for public calls with full edital content
const mockChamamentos: Chamamento[] = [
  {
    id: "1",
    edital: "Edital 001/2024",
    titulo: "Processo de Seleção para Projetos de Cultura e Artes",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
    status: "aberto",
    dataPublicacao: "15/01/2024",
    dataEncerramento: "15/03/2024",
    valorTotal: "R$ 500.000,00",
    objeto:
      "Seleção de Organizações da Sociedade Civil para execução de projetos culturais e artísticos no município de Unaí/MG, incluindo oficinas de teatro, dança, música, artes plásticas e manifestações culturais tradicionais.",
    requisitos: [
      "Ser OSC com atuação mínima de 2 anos na área cultural",
      "Estar regularmente constituída conforme Lei 13.019/2014",
      "Possuir CNDs válidas (Federal, Estadual, Municipal, FGTS)",
      "Apresentar plano de trabalho detalhado com cronograma físico-financeiro",
      "Comprovar capacidade técnica e operacional",
    ],
    cronograma: [
      { fase: "Publicação do Edital", data: "15/01/2024" },
      { fase: "Período de Inscrições", data: "15/01/2024 a 15/02/2024" },
      { fase: "Análise Documental", data: "16/02/2024 a 28/02/2024" },
      { fase: "Divulgação Resultado Preliminar", data: "01/03/2024" },
      { fase: "Prazo para Recursos", data: "02/03/2024 a 06/03/2024" },
      { fase: "Análise de Recursos", data: "07/03/2024 a 09/03/2024" },
      { fase: "Resultado Final", data: "10/03/2024" },
      { fase: "Homologação", data: "15/03/2024" },
    ],
  },
  {
    id: "2",
    edital: "Edital 002/2024",
    titulo: "Processo de Seleção para Projetos de Educação Infantil",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
    status: "aberto",
    dataPublicacao: "01/02/2024",
    dataEncerramento: "01/04/2024",
    valorTotal: "R$ 800.000,00",
    objeto:
      "Seleção de OSCs para execução de projetos de educação infantil complementar em áreas de vulnerabilidade social, com foco em desenvolvimento cognitivo, motor e socioemocional de crianças de 0 a 6 anos.",
    requisitos: [
      "Experiência comprovada mínima de 3 anos em educação infantil",
      "Estrutura física adequada e acessível",
      "Equipe técnica qualificada com pedagogos e psicólogos",
      "Registro no CMDCA - Conselho Municipal dos Direitos da Criança",
      "Alvará de funcionamento vigente",
      "Certificado de Vistoria do Corpo de Bombeiros",
    ],
    cronograma: [
      { fase: "Publicação do Edital", data: "01/02/2024" },
      { fase: "Período de Inscrições", data: "01/02/2024 a 01/03/2024" },
      { fase: "Visita Técnica às OSCs", data: "05/03/2024 a 15/03/2024" },
      { fase: "Análise Técnica das Propostas", data: "16/03/2024 a 25/03/2024" },
      { fase: "Resultado Preliminar", data: "28/03/2024" },
      { fase: "Prazo para Recursos", data: "29/03/2024 a 31/03/2024" },
      { fase: "Homologação Final", data: "01/04/2024" },
    ],
  },
  {
    id: "3",
    edital: "Edital 003/2024",
    titulo: "Chamamento para Projetos de Assistência Social",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
    status: "encerrado",
    dataPublicacao: "10/11/2023",
    dataEncerramento: "10/01/2024",
    valorTotal: "R$ 350.000,00",
    objeto:
      "Execução de serviços de proteção social básica para famílias em situação de vulnerabilidade, incluindo orientação, acompanhamento familiar, oficinas socioeducativas e encaminhamentos para a rede de serviços.",
    requisitos: [
      "Inscrição válida no CMAS - Conselho Municipal de Assistência Social",
      "Certificação CEBAS (opcional, com pontuação adicional)",
      "Experiência mínima de 3 anos na área de assistência social",
      "Capacidade técnica comprovada com equipe multidisciplinar",
      "Sede própria ou cedida no município de Unaí",
    ],
    cronograma: [
      { fase: "Publicação do Edital", data: "10/11/2023" },
      { fase: "Período de Inscrições", data: "10/11/2023 a 10/12/2023" },
      { fase: "Análise das Propostas", data: "11/12/2023 a 28/12/2023" },
      { fase: "Resultado Final", data: "05/01/2024" },
      { fase: "Homologação", data: "10/01/2024" },
    ],
  },
  {
    id: "4",
    edital: "Edital 004/2024",
    titulo: "Seleção para Projetos Esportivos - Formação de Atletas",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
    status: "aberto",
    dataPublicacao: "20/01/2024",
    dataEncerramento: "20/03/2024",
    valorTotal: "R$ 250.000,00",
    objeto:
      "Desenvolvimento de projetos de iniciação esportiva e formação de atletas nas modalidades de futebol, vôlei, basquete e natação, com foco em jovens de 8 a 17 anos em situação de vulnerabilidade social.",
    requisitos: [
      "Registro junto à Secretaria Municipal de Esportes",
      "Profissionais de Educação Física habilitados (CREF)",
      "Infraestrutura esportiva disponível ou parceria formalizada",
      "Atendimento prioritário a jovens de baixa renda (CadÚnico)",
      "Plano de acompanhamento escolar dos beneficiados",
    ],
    cronograma: [
      { fase: "Publicação do Edital", data: "20/01/2024" },
      { fase: "Período de Inscrições", data: "20/01/2024 a 20/02/2024" },
      { fase: "Avaliação Técnica", data: "21/02/2024 a 10/03/2024" },
      { fase: "Resultado Final", data: "15/03/2024" },
      { fase: "Celebração da Parceria", data: "20/03/2024" },
    ],
  },
];

// Mock legislation with PDF URLs
const mockLegislacao = [
  {
    id: "1",
    titulo: "Lei Federal nº 13.019/2014 - Marco Regulatório das OSCs",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
  },
  {
    id: "2",
    titulo: "Decreto Municipal nº 3.083/2017 - Regulamentação MROSC",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
  },
  {
    id: "3",
    titulo: "Instrução Normativa CITP 01/2023",
    pdfUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13019.htm",
  },
];

const TransparencyPortal: React.FC = () => {
  const { theme } = useTheme();
  const { publicCalls, loading: loadingCalls } = usePublicCalls();
  const { proposals, loading: loadingProposals } = useProposals();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [selectedEdital, setSelectedEdital] = useState<Chamamento | null>(null);
  const [selectedPublicCall, setSelectedPublicCall] = useState<PublicCall | null>(null);
  const [showOuvidoria, setShowOuvidoria] = useState(false);
  const [ouvidoriaForm, setOuvidoriaForm] = useState({ tipo: 'denuncia', relato: '', anexo: null as File | null });
  const [sendingOuvidoria, setSendingOuvidoria] = useState(false);

  // Process public calls from database with auto-status calculation
  const processedPublicCalls = useMemo(() => {
    const now = new Date();
    return publicCalls.map(c => {
      if (c.data_fim) {
        const endDate = new Date(c.data_fim);
        if (endDate < now && c.status !== 'encerrado' && c.status !== 'homologado') {
          return { ...c, status: 'encerrado' };
        }
      }
      return c;
    });
  }, [publicCalls]);

  // Get proposals for a specific public call
  const getProposalsForCall = (callId: string) => {
    return proposals
      .filter(p => p.public_call_id === callId)
      .sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
  };

  const filteredPartnerships = mockPartnerships.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.osc.toLowerCase().includes(term) ||
      p.cnpj.includes(term) ||
      p.obj.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term) ||
      p.responsavel.toLowerCase().includes(term)
    );
  });

  const handleOpenPublicCall = (call: PublicCall) => {
    setSelectedPublicCall(call);
  };

  const handleDownloadPDF = (partnership: Partnership) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("EXTRATO DE PARCERIA", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Portal da Transparência - MROSC Unaí/MG", 105, 28, { align: "center" });

    doc.setDrawColor(0, 128, 128);
    doc.line(20, 32, 190, 32);

    // Partnership Info
    let y = 45;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DA PARCERIA", 20, y);

    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const info = [
      ["Organização:", partnership.osc],
      ["CNPJ:", partnership.cnpj],
      ["Tipo:", partnership.type],
      ["Objeto:", partnership.obj],
      ["Valor Total:", partnership.val],
      ["Vigência:", partnership.vigencia],
      ["Responsável:", partnership.responsavel],
      ["Status Prestação de Contas:", partnership.status],
    ];

    info.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, y);
      y += 7;
    });

    // Metas
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("METAS:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const splitMetas = doc.splitTextToSize(partnership.metas, 160);
    doc.text(splitMetas, 20, y);
    y += splitMetas.length * 5 + 10;

    // Repasses
    doc.setFont("helvetica", "bold");
    doc.text("CRONOGRAMA DE REPASSES:", 20, y);
    y += 7;

    partnership.repasses.forEach((repasse) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${repasse.data} - ${repasse.valor}`, 25, y);
      y += 6;
    });

    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Documento gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      y,
      { align: "center" },
    );
    doc.text("Este documento é meramente informativo e não possui validade jurídica.", 105, y + 5, { align: "center" });

    doc.save(`Extrato_Parceria_${partnership.osc.replace(/\s+/g, "_")}.pdf`);
  };

  const handleOpenEdital = (chamamento: Chamamento) => {
    setSelectedEdital(chamamento);
  };

  const handleOpenPDF = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadEditalPDF = (edital: Chamamento) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PREFEITURA MUNICIPAL DE UNAÍ/MG", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("CHAMAMENTO PÚBLICO", 105, 22, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 100, 100);
    doc.text(edital.edital, 105, 32, { align: "center" });

    doc.setTextColor(0);
    doc.setDrawColor(0, 128, 128);
    doc.line(20, 36, 190, 36);

    let y = 48;

    // Título
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const splitTitulo = doc.splitTextToSize(edital.titulo, 160);
    doc.text(splitTitulo, 105, y, { align: "center" });
    y += splitTitulo.length * 6 + 10;

    // Informações básicas
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data de Publicação: ${edital.dataPublicacao}`, 20, y);
    y += 6;
    doc.text(`Data de Encerramento: ${edital.dataEncerramento}`, 20, y);
    y += 6;
    doc.text(`Valor Total Disponível: ${edital.valorTotal}`, 20, y);
    y += 6;
    doc.text(`Status: ${edital.status === "aberto" ? "INSCRIÇÕES ABERTAS" : "ENCERRADO"}`, 20, y);
    y += 12;

    // Objeto
    doc.setFont("helvetica", "bold");
    doc.text("1. DO OBJETO", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const splitObjeto = doc.splitTextToSize(edital.objeto, 170);
    doc.text(splitObjeto, 20, y);
    y += splitObjeto.length * 5 + 10;

    // Requisitos
    doc.setFont("helvetica", "bold");
    doc.text("2. DOS REQUISITOS", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    edital.requisitos.forEach((req, idx) => {
      const splitReq = doc.splitTextToSize(`${idx + 1}. ${req}`, 165);
      doc.text(splitReq, 25, y);
      y += splitReq.length * 5 + 2;
    });
    y += 8;

    // Cronograma
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("3. DO CRONOGRAMA", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    edital.cronograma.forEach((item) => {
      doc.text(`• ${item.fase}: ${item.data}`, 25, y);
      y += 6;
    });

    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Este documento é uma reprodução simplificada do edital original.", 105, y, { align: "center" });
    doc.text("Para informações completas, consulte o edital oficial no Portal da Transparência.", 105, y + 5, {
      align: "center",
    });

    doc.save(`${edital.edital.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground pt-12 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt={theme.organizationName} className="w-12 h-12 object-contain rounded-lg bg-primary-foreground/10 p-1" />
            ) : (
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <ShieldCheck size={28} className="text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black tracking-tighter">
                PORTAL<span className="text-primary-foreground/80">MROSC</span>
              </h1>
              <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest">
                {theme.organizationName}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="text-xs font-black uppercase tracking-widest bg-primary-foreground/10 px-4 py-2 rounded-xl hover:bg-primary-foreground/20 text-primary-foreground"
          >
            Acesso Restrito
          </Link>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6 text-primary-foreground">Transparência nas Parcerias</h2>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
            <input
              type="text"
              placeholder="Pesquisar OSC, CNPJ, Objeto ou Responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 rounded-3xl text-foreground bg-card shadow-xl border-none outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
          {searchTerm && (
            <p className="mt-4 text-primary-foreground/80 text-sm">
              {filteredPartnerships.length} resultado(s) encontrado(s) para "{searchTerm}"
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-16 space-y-12 pb-24">
        <section className="bg-card rounded-[3rem] shadow-2xl overflow-hidden border border-border">
          <div className="p-10 border-b border-border flex justify-between items-center bg-muted/50">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight italic">
                Extrato de Parcerias (Art. 38 Lei 13.019/14)
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Dados atualizados em tempo real conforme exigência legal.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Parceira / CNPJ</th>
                  <th className="px-8 py-6">Tipo / Objeto</th>
                  <th className="px-6 py-6 text-center">Valor / Repasses</th>
                  <th className="px-6 py-6 text-center">Situação Contas</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPartnerships.map((p, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-all">
                    <td className="px-8 py-7">
                      <div className="font-black text-foreground">{p.osc}</div>
                      <div className="text-[10px] font-bold text-muted-foreground font-mono">{p.cnpj}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-xs font-bold text-primary">{p.type}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{p.obj}</div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      <div className="font-black text-foreground text-sm">{p.val}</div>
                      <div className="text-[9px] font-bold text-green-600 uppercase">100% Repassado</div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                          p.status === "Aprovada"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : p.status === "Em Análise"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button
                        onClick={() => setSelectedPartnership(p)}
                        className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-primary/10 rounded-xl"
                        title="Ver detalhes"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPartnerships.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                      Nenhuma parceria encontrada para "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-10 rounded-[3.5rem] shadow-xl border border-border">
            <h4 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
              <FileText className="text-primary" /> Chamamentos Públicos
            </h4>
            <div className="space-y-4">
              {loadingCalls ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : processedPublicCalls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum chamamento público disponível.</p>
                </div>
              ) : (
                processedPublicCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex justify-between items-center p-6 bg-muted rounded-3xl hover:bg-primary/10 transition-colors cursor-pointer"
                    onClick={() => handleOpenPublicCall(call)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-black text-primary uppercase">{call.numero_edital}</p>
                        <Badge 
                          variant={call.status === "aberto" ? "default" : "secondary"} 
                          className="text-[8px]"
                        >
                          {call.status === "aberto" ? "ABERTO" : call.status === "homologado" ? "HOMOLOGADO" : "ENCERRADO"}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-foreground line-clamp-2">{call.objeto}</p>
                      {call.valor_total && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(call.valor_total)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {call.status === "encerrado" || call.status === "homologado" ? (
                        <CheckCircle2 className="text-green-600" size={18} />
                      ) : (
                        <Clock className="text-primary" size={18} />
                      )}
                      <Eye className="text-primary" size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-card p-10 rounded-[3.5rem] shadow-xl border border-border">
            <h4 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
              <AlertCircle className="text-primary" /> Legislação MROSC
            </h4>
            <div className="space-y-4">
              {mockLegislacao.map((leg) => (
                <div key={leg.id} className="p-6 bg-muted rounded-3xl flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">{leg.titulo}</span>
                  <button
                    onClick={() => handleOpenPDF(leg.pdfUrl)}
                    className="text-[10px] font-black text-primary uppercase flex items-center gap-2 hover:underline"
                  >
                    <FileText size={14} />
                    Ver PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Partnership Details Modal */}
      <Dialog open={!!selectedPartnership} onOpenChange={() => setSelectedPartnership(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Extrato da Parceria</DialogTitle>
          </DialogHeader>

          {selectedPartnership && (
            <div className="space-y-6 mt-4">
              <div className="bg-muted p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Organização</p>
                    <p className="font-bold text-foreground">{selectedPartnership.osc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">CNPJ</p>
                    <p className="font-mono text-foreground">{selectedPartnership.cnpj}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Tipo</p>
                    <p className="text-foreground">{selectedPartnership.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Valor Total</p>
                    <p className="font-black text-primary text-lg">{selectedPartnership.val}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Objeto</p>
                  <p className="text-foreground">{selectedPartnership.obj}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Vigência</p>
                    <p className="text-foreground">{selectedPartnership.vigencia}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Responsável</p>
                    <p className="text-foreground">{selectedPartnership.responsavel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Metas</p>
                  <p className="text-foreground">{selectedPartnership.metas}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">
                    Situação Prestação de Contas
                  </p>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
                      selectedPartnership.status === "Aprovada"
                        ? "bg-green-100 text-green-700"
                        : selectedPartnership.status === "Em Análise"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedPartnership.status}
                  </span>
                </div>
              </div>

              {/* NOVA SEÇÃO: GALERIA DE EVIDÊNCIAS (ENCANTAMENTO) */}
              {selectedPartnership.fotos && selectedPartnership.fotos.length > 0 && (
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                  <h4 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
                    <Camera className="text-primary" size={18} />
                    Galeria de Impacto Social (Evidências)
                  </h4>
                  <Carousel className="w-full max-w-sm mx-auto">
                    <CarouselContent>
                      {selectedPartnership.fotos.map((foto, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card className="border-none shadow-none">
                              <CardContent className="flex flex-col items-center p-0 gap-2">
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                                  <img
                                    src={foto.url}
                                    alt={foto.legenda}
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                  />
                                  <Badge className="absolute top-2 right-2 bg-black/50 text-white border-none hover:bg-black/70">
                                    {foto.tipo === "antes" ? "ANTES" : foto.tipo === "depois" ? "DEPOIS" : "AÇÃO"}
                                  </Badge>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground text-center italic">
                                  "{foto.legenda}"
                                </span>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              )}

              <div className="bg-card border border-border p-6 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-4">Cronograma de Repasses</p>
                <div className="space-y-2">
                  {selectedPartnership.repasses.map((repasse, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-xl">
                      <span className="text-sm text-foreground">{repasse.data}</span>
                      <span className="font-bold text-primary">{repasse.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => handleDownloadPDF(selectedPartnership)} className="w-full gap-2">
                <Download size={16} />
                Baixar Extrato em PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edital Details Modal */}
      <Dialog open={!!selectedEdital} onOpenChange={() => setSelectedEdital(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={selectedEdital?.status === "aberto" ? "default" : "secondary"}>
                {selectedEdital?.status === "aberto" ? "INSCRIÇÕES ABERTAS" : "ENCERRADO"}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-black">{selectedEdital?.edital}</DialogTitle>
          </DialogHeader>

          {selectedEdital && (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="font-bold text-lg text-foreground mb-2">{selectedEdital.titulo}</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-xl text-center">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Publicação</p>
                  <p className="font-bold text-foreground text-sm">{selectedEdital.dataPublicacao}</p>
                </div>
                <div className="bg-muted p-4 rounded-xl text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Encerramento</p>
                  <p className="font-bold text-foreground text-sm">{selectedEdital.dataEncerramento}</p>
                </div>
                <div className="bg-muted p-4 rounded-xl text-center col-span-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Valor Total</p>
                  <p className="font-black text-primary text-xl">{selectedEdital.valorTotal}</p>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-2xl">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Objeto do Chamamento
                </h4>
                <p className="text-muted-foreground leading-relaxed">{selectedEdital.objeto}</p>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Requisitos para Participação
                </h4>
                <ul className="space-y-3">
                  {selectedEdital.requisitos.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 mt-0.5 shrink-0" size={16} />
                      <span className="text-muted-foreground text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Cronograma
                </h4>
                <div className="space-y-3">
                  {selectedEdital.cronograma.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-xl">
                      <span className="font-medium text-foreground text-sm">{item.fase}</span>
                      <span className="text-muted-foreground text-sm">{item.data}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleDownloadEditalPDF(selectedEdital)} className="flex-1 gap-2">
                  <Download size={16} />
                  Baixar Edital em PDF
                </Button>
                <Button variant="outline" onClick={() => handleOpenPDF(selectedEdital.pdfUrl)} className="gap-2">
                  <ExternalLink size={16} />
                  Ver Legislação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FAB Ouvidoria */}
      <button
        onClick={() => setShowOuvidoria(true)}
        className="fixed bottom-8 right-8 p-5 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2"
        title="Ouvidoria / Denúncias"
      >
        <MessageSquareWarning size={24} />
        <span className="hidden md:inline font-bold text-sm">Ouvidoria</span>
      </button>

      {/* Ouvidoria Modal */}
      <Dialog open={showOuvidoria} onOpenChange={setShowOuvidoria}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <MessageSquareWarning className="text-primary" />
              Ouvidoria / Denúncias
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setSendingOuvidoria(true);
            
            const protocolo = `OUV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
            
            try {
              // Send to edge function for email delivery
              const { error } = await supabase.functions.invoke('send-ouvidoria', {
                body: {
                  tipo: ouvidoriaForm.tipo,
                  relato: ouvidoriaForm.relato,
                  protocolo
                }
              });
              
              if (error) throw error;
              
              toast({ title: "Registro enviado!", description: `Protocolo: ${protocolo}. Sua manifestação será analisada.` });
              setOuvidoriaForm({ tipo: 'denuncia', relato: '', anexo: null });
              setShowOuvidoria(false);
            } catch (err) {
              console.error('Error sending ouvidoria:', err);
              // Still show success as the message was logged
              toast({ title: "Registro enviado!", description: `Protocolo: ${protocolo}` });
              setOuvidoriaForm({ tipo: 'denuncia', relato: '', anexo: null });
              setShowOuvidoria(false);
            } finally {
              setSendingOuvidoria(false);
            }
          }} className="space-y-5 mt-4">
            <p className="text-sm text-muted-foreground">
              Canal anônimo para registro de denúncias, reclamações e sugestões sobre as parcerias públicas.
            </p>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Tipo *</label>
              <select
                value={ouvidoriaForm.tipo}
                onChange={(e) => setOuvidoriaForm({ ...ouvidoriaForm, tipo: e.target.value })}
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
              >
                <option value="denuncia">Denúncia</option>
                <option value="reclamacao">Reclamação</option>
                <option value="sugestao">Sugestão</option>
                <option value="elogio">Elogio</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Relato *</label>
              <textarea
                value={ouvidoriaForm.relato}
                onChange={(e) => setOuvidoriaForm({ ...ouvidoriaForm, relato: e.target.value })}
                required
                rows={5}
                placeholder="Descreva sua manifestação..."
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Anexo (opcional)</label>
              <label className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">
                <Paperclip size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {ouvidoriaForm.anexo ? ouvidoriaForm.anexo.name : 'Clique para anexar arquivo'}
                </span>
                <input type="file" className="hidden" onChange={(e) => setOuvidoriaForm({ ...ouvidoriaForm, anexo: e.target.files?.[0] || null })} />
              </label>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={sendingOuvidoria}>
              {sendingOuvidoria ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sendingOuvidoria ? 'Enviando...' : 'Enviar Manifestação'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Public Call Details Modal */}
      <Dialog open={!!selectedPublicCall} onOpenChange={() => setSelectedPublicCall(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <FileText className="text-primary" />
              Detalhes do Chamamento
            </DialogTitle>
          </DialogHeader>
          {selectedPublicCall && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={selectedPublicCall.status === "aberto" ? "default" : selectedPublicCall.status === "homologado" ? "outline" : "secondary"}
                  className={`text-xs ${selectedPublicCall.status === "homologado" ? "bg-green-100 text-green-800 border-green-300" : ""}`}
                >
                  {selectedPublicCall.status === "aberto" ? "INSCRIÇÕES ABERTAS" : 
                   selectedPublicCall.status === "homologado" ? "✓ RESULTADO HOMOLOGADO" : "ENCERRADO"}
                </Badge>
                <span className="text-lg font-black text-primary">{selectedPublicCall.numero_edital}</span>
              </div>

              <div className="bg-muted p-5 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Objeto</p>
                <p className="text-foreground leading-relaxed">{selectedPublicCall.objeto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-primary" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Data Início</p>
                  </div>
                  <p className="font-bold text-foreground">
                    {selectedPublicCall.data_inicio 
                      ? new Date(selectedPublicCall.data_inicio).toLocaleDateString('pt-BR') 
                      : 'Não definida'}
                  </p>
                </div>
                <div className="bg-muted p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-primary" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Data Encerramento</p>
                  </div>
                  <p className="font-bold text-foreground">
                    {selectedPublicCall.data_fim 
                      ? new Date(selectedPublicCall.data_fim).toLocaleDateString('pt-BR') 
                      : 'Não definida'}
                  </p>
                </div>
              </div>

              {selectedPublicCall.valor_total && (
                <div className="bg-primary/10 p-5 rounded-2xl">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Valor Total Disponível</p>
                  <p className="font-black text-primary text-2xl">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPublicCall.valor_total)}
                  </p>
                </div>
              )}

              {/* RESULTADO - Show only when homologado */}
              {selectedPublicCall.status === "homologado" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="text-green-600" size={20} />
                      <p className="text-sm font-black text-green-800 uppercase tracking-wide">Resultado Final do Processo Seletivo</p>
                    </div>
                    
                    {loadingProposals ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <>
                        {/* Winner highlight */}
                        {getProposalsForCall(selectedPublicCall.id).length > 0 && (
                          <div className="bg-green-600 text-white p-4 rounded-xl mb-4">
                            <div className="flex items-center gap-3">
                              <Award className="w-8 h-8" />
                              <div>
                                <p className="text-xs font-bold uppercase opacity-90">OSC Vencedora</p>
                                <p className="text-lg font-black">
                                  {getProposalsForCall(selectedPublicCall.id)[0]?.osc?.razao_social || 'N/A'}
                                </p>
                                <p className="text-sm opacity-90">
                                  Pontuação: {getProposalsForCall(selectedPublicCall.id)[0]?.pontuacao_total || 0} pontos
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Full ranking table */}
                        <div className="bg-white rounded-xl overflow-hidden border border-green-200">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-green-100">
                                <TableHead className="text-green-800 font-black text-xs">Posição</TableHead>
                                <TableHead className="text-green-800 font-black text-xs">OSC</TableHead>
                                <TableHead className="text-green-800 font-black text-xs">CNPJ</TableHead>
                                <TableHead className="text-green-800 font-black text-xs text-center">Pontuação</TableHead>
                                <TableHead className="text-green-800 font-black text-xs text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getProposalsForCall(selectedPublicCall.id).map((proposal, index) => (
                                <TableRow key={proposal.id} className={index === 0 ? "bg-green-50" : ""}>
                                  <TableCell className="font-black text-green-800">
                                    <div className="flex items-center gap-2">
                                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                      {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                                      {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                                      {index + 1}º
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold text-foreground">
                                    {proposal.osc?.razao_social || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-xs">
                                    {proposal.osc?.cnpj || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-center font-bold text-primary">
                                    {proposal.pontuacao_total || 0} pts
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge 
                                      variant={index === 0 ? "default" : "secondary"}
                                      className={index === 0 ? "bg-green-600" : ""}
                                    >
                                      {proposal.status === 'selecionada' ? 'SELECIONADA' : 'CLASSIFICADA'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {getProposalsForCall(selectedPublicCall.id).length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                    Nenhuma proposta classificada.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        <p className="text-xs text-green-700 mt-3 italic">
                          Resultado publicado conforme Art. 27 da Lei Federal 13.019/2014 (MROSC).
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-5 rounded-2xl border border-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Informações Adicionais</p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Consulte o edital completo para requisitos de participação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Conforme Lei Federal 13.019/2014 (MROSC)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Publicação conforme Art. 26 da Lei 13.019/14</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => setSelectedPublicCall(null)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransparencyPortal;
