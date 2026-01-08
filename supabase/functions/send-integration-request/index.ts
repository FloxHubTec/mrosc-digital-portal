import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationRequest {
  integrationName: string;
  description: string;
  userName?: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integrationName, description, userName, userEmail }: IntegrationRequest = await req.json();

    // WhatsApp notification for integration requests
    const whatsappNumber = "5581982596969";
    const whatsappMessage = encodeURIComponent(
      `🔌 *Solicitação de Integração*\n\n` +
      `*Integração:* ${integrationName}\n` +
      `*Solicitante:* ${userName || 'Não informado'}\n` +
      `*E-mail:* ${userEmail || 'Não informado'}\n\n` +
      `*Descrição:*\n${description}`
    );

    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    // Log for email sending (would use Resend in production)
    console.log("Integration request notification:", {
      to: "suporte@floxhub.com.br",
      subject: `[Integração] Solicitação: ${integrationName}`,
      body: description,
      whatsappLink,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Solicitação de integração enviada",
        whatsappLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-integration-request:", error);
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
