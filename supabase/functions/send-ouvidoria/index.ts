import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OuvidoriaRequest {
  tipo: string;
  relato: string;
  protocolo: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, relato, protocolo }: OuvidoriaRequest = await req.json();

    // Email de destino configurável - pode ser alterado nas secrets
    const OUVIDORIA_EMAIL = Deno.env.get("OUVIDORIA_EMAIL") || "ouvidoria@prefeitura.gov.br";
    
    const tipoLabel: Record<string, string> = {
      denuncia: "Denúncia",
      reclamacao: "Reclamação",
      sugestao: "Sugestão",
      elogio: "Elogio"
    };

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      // Log the message even without email configured
      console.log("=== OUVIDORIA MESSAGE RECEIVED ===");
      console.log({
        protocolo,
        tipo: tipoLabel[tipo] || tipo,
        relato,
        destinatario: OUVIDORIA_EMAIL,
        data: new Date().toISOString()
      });
      console.log("=================================");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mensagem registrada com sucesso",
          protocolo,
          note: "Email não enviado - configure RESEND_API_KEY e OUVIDORIA_EMAIL para envio por email"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "MROSC Ouvidoria <onboarding@resend.dev>",
        to: [OUVIDORIA_EMAIL],
        subject: `[OUVIDORIA] ${tipoLabel[tipo] || tipo} - Protocolo ${protocolo}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f766e; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Portal de Transparência MROSC</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Ouvidoria Pública</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0f766e;">
                <h2 style="color: #0f766e; margin-top: 0;">Nova Manifestação Recebida</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Protocolo:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${protocolo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Tipo:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${tipoLabel[tipo] || tipo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Data:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleString('pt-BR')}</td>
                  </tr>
                </table>
                
                <h3 style="color: #374151; margin-top: 20px;">Relato:</h3>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; white-space: pre-wrap;">
                  ${relato}
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
                Esta mensagem foi enviada automaticamente pelo Portal de Transparência MROSC.
              </p>
            </div>
          </div>
        `,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email sent:", result);

    return new Response(
      JSON.stringify({ success: true, protocolo, emailResponse: result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-ouvidoria function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
