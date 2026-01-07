
// Serviço de IA - Placeholder para integração futura com Gemini
// Em produção, será necessário configurar a API key via Lovable Cloud

export class GeminiService {
  static async analyzeComplianceRisk(cndContext: string): Promise<string> {
    // Simulação de análise de compliance
    console.log(`Analisando contexto de compliance: ${cndContext}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `**Parecer Técnico de Compliance MROSC**

Com base na análise das certidões apresentadas (${cndContext}), verifica-se que:

1. **Situação Fiscal**: A OSC encontra-se em situação regular perante os órgãos de controle.
2. **Recomendação**: Apta para recebimento de novos repasses públicos.
3. **Alerta**: Monitorar vencimentos nos próximos 30 dias.

*Análise gerada automaticamente - sujeita a validação técnica.*`;
  }

  static async generateLegalMinute(partnershipType: string, oscName: string, goal: string): Promise<string> {
    console.log(`Gerando minuta para: ${partnershipType}, ${oscName}, ${goal}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `# ${partnershipType.toUpperCase()}

**CONCEDENTE:** PREFEITURA MUNICIPAL DE UNAÍ/MG
**CONVENIADA:** ${oscName}

---

## CLÁUSULA PRIMEIRA - DO OBJETO

O presente instrumento tem por objeto a execução do projeto "${goal}", conforme detalhado no Plano de Trabalho aprovado, que passa a fazer parte integrante deste termo.

## CLÁUSULA SEGUNDA - DAS METAS E RESULTADOS

A OSC compromete-se a atingir as metas estabelecidas no cronograma de execução física, sob pena de glosa de recursos conforme Art. 63 da Lei 13.019/2014.

## CLÁUSULA TERCEIRA - DA PRESTAÇÃO DE CONTAS

A prestação de contas deverá ser realizada eletronicamente através da plataforma MROSC Digital, contendo:
- REO (Relatório de Execução do Objeto)
- REFF (Relatório de Execução Físico-Financeira)

## CLÁUSULA QUARTA - DA VIGÊNCIA

Este termo terá vigência de 12 (doze) meses, podendo ser prorrogado conforme interesse público.

---

*Minuta gerada com base na Lei 13.019/2014 e Lei Municipal 3.083/2017*`;
  }

  static async analyzeWorkPlan(planContent: string): Promise<{
    complianceScore: number;
    risks: string[];
    recommendations: string[];
    isViable: boolean;
  } | null> {
    console.log(`Analisando plano de trabalho: ${planContent.substring(0, 100)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      complianceScore: 85,
      risks: [
        "Cronograma financeiro necessita detalhamento adicional",
        "Indicadores de meta 2 podem ser mais específicos"
      ],
      recommendations: [
        "Incluir metodologia de aferição das metas",
        "Detalhar equipe técnica responsável",
        "Adicionar plano de contingência"
      ],
      isViable: true
    };
  }
}
