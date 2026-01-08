import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportTicketRequest {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  userName?: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { titulo, descricao, categoria, prioridade, userName, userEmail }: SupportTicketRequest = await req.json();

    // Send WhatsApp notification via WhatsApp Business API (placeholder)
    // In production, you would integrate with Twilio WhatsApp or WhatsApp Business API
    const whatsappNumber = "5581994096516";
    const whatsappMessage = encodeURIComponent(
      `🎫 *Novo Ticket de Suporte*\n\n` +
      `*Título:* ${titulo}\n` +
      `*Categoria:* ${categoria}\n` +
      `*Prioridade:* ${prioridade}\n` +
      `*Usuário:* ${userName || 'Não informado'}\n` +
      `*E-mail:* ${userEmail || 'Não informado'}\n\n` +
      `*Descrição:*\n${descricao}`
    );

    // Generate WhatsApp link (for manual notification or webhook integration)
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    // For email, we would use Resend or another email service
    // This is a placeholder that logs the notification
    console.log("Support ticket notification:", {
      to: "suporte@floxhub.com.br",
      subject: `[Ticket] ${titulo}`,
      body: descricao,
      whatsappLink,
    });

    // Return success with the WhatsApp link for client-side fallback
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notificação enviada",
        whatsappLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-support-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
