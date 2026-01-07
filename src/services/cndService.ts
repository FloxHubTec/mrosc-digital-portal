
import { CNDRecord } from '../types';
import { GeminiService } from './gemini';

export class CNDService {
  /**
   * Simula a chamada para APIs governamentais (Receita, Caixa, TCU)
   * Em produção, aqui seriam chamadas via axios para os endpoints oficiais ou hubs de CND.
   */
  static async fetchLatestCNDs(cnpj: string): Promise<CNDRecord[]> {
    console.log(`Consultando bases para CNPJ: ${cnpj}...`);
    
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    return [
      {
        provider: 'Receita Federal',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: threeMonthsLater.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `RFB-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      },
      {
        provider: 'Caixa (FGTS)',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: nextMonth.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `CRF-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      },
      {
        provider: 'TCU',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: threeMonthsLater.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `TCU-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      }
    ];
  }

  static async analyzeRisk(cnds: CNDRecord[]) {
    const context = cnds.map(c => `${c.provider}: expira em ${c.expiryDate}`).join(', ');
    return await GeminiService.analyzeComplianceRisk(context);
  }
}
