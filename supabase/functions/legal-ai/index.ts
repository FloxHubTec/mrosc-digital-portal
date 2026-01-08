import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Legal AI request from user:", claimsData.claims.sub);

    const { prompt, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (type === "compliance") {
      systemPrompt = `Você é um especialista jurídico em MROSC (Lei 13.019/2014) e legislação municipal de Unaí/MG (Lei 3.083/2017).
Sua função é analisar certidões negativas de débitos (CNDs) e emitir pareceres técnicos sobre compliance.
Sempre responda em português brasileiro formal, com fundamentação legal.
Estruture sua resposta em:
1. Situação Fiscal
2. Recomendação
3. Alertas (se houver)
4. Fundamentação Legal`;
    } else if (type === "minute") {
      systemPrompt = `Você é um especialista jurídico em MROSC (Lei 13.019/2014) e elabora minutas de termos de parceria.
Gere minutas completas de Termos de Fomento, Termos de Colaboração e Acordos de Cooperação.
Inclua todas as cláusulas necessárias conforme a legislação vigente:
- Objeto
- Metas e Resultados
- Recursos Financeiros
- Prestação de Contas
- Vigência
- Responsabilidades
- Sanções
- Foro`;
    } else if (type === "analysis") {
      systemPrompt = `Você é um especialista em análise de planos de trabalho para parcerias MROSC.
Avalie o plano de trabalho quanto a:
1. Conformidade legal (Lei 13.019/2014)
2. Clareza dos objetivos
3. Exequibilidade das metas
4. Adequação do cronograma
5. Coerência orçamentária
6. Indicadores de resultado
Forneça uma pontuação de 0 a 100 e recomendações específicas.`;
    } else {
      systemPrompt = `Você é um assistente jurídico especializado em MROSC (Marco Regulatório das Organizações da Sociedade Civil - Lei 13.019/2014) e na legislação municipal de Unaí/MG.
Responda perguntas sobre parcerias entre o poder público e OSCs, prestação de contas, chamamentos públicos, e toda a legislação correlata.
Sempre cite a fundamentação legal quando aplicável.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context ? `Contexto: ${context}\n\nPergunta/Solicitação: ${prompt}` : prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar solicitação de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Legal AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
