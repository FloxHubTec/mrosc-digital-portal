export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      amendments: {
        Row: {
          ano: number
          autor: string
          created_at: string
          descricao: string | null
          id: string
          numero: string
          osc_beneficiaria_id: string | null
          partnership_id: string | null
          prazo_legal: string | null
          status: string | null
          tipo: string | null
          tipo_indicacao: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          ano: number
          autor: string
          created_at?: string
          descricao?: string | null
          id?: string
          numero: string
          osc_beneficiaria_id?: string | null
          partnership_id?: string | null
          prazo_legal?: string | null
          status?: string | null
          tipo?: string | null
          tipo_indicacao?: string | null
          updated_at?: string | null
          valor?: number
        }
        Update: {
          ano?: number
          autor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          numero?: string
          osc_beneficiaria_id?: string | null
          partnership_id?: string | null
          prazo_legal?: string | null
          status?: string | null
          tipo?: string | null
          tipo_indicacao?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "amendments_osc_beneficiaria_id_fkey"
            columns: ["osc_beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "oscs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amendments_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string
          details: Json | null
          id: string
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          created_at: string
          id: string
          message: string
          partnership_id: string | null
          recipient_id: string | null
          recipient_osc_id: string | null
          send_email: boolean | null
          sender_id: string
          status: string | null
          subject: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          partnership_id?: string | null
          recipient_id?: string | null
          recipient_osc_id?: string | null
          send_email?: boolean | null
          sender_id: string
          status?: string | null
          subject: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          partnership_id?: string | null
          recipient_id?: string | null
          recipient_osc_id?: string | null
          send_email?: boolean | null
          sender_id?: string
          status?: string | null
          subject?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_recipient_osc_id_fkey"
            columns: ["recipient_osc_id"]
            isOneToOne: false
            referencedRelation: "oscs"
            referencedColumns: ["id"]
          },
        ]
      }
      legislation: {
        Row: {
          arquivo_url: string | null
          ativo: boolean | null
          conteudo: string | null
          created_at: string
          data_publicacao: string | null
          ementa: string | null
          id: string
          numero: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string | null
          ementa?: string | null
          id?: string
          numero?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          data_publicacao?: string | null
          ementa?: string | null
          id?: string
          numero?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      oscs: {
        Row: {
          cnpj: string
          created_at: string
          id: string
          logo_url: string | null
          razao_social: string
          status_cnd: string | null
          validade_cnd: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string
          id?: string
          logo_url?: string | null
          razao_social: string
          status_cnd?: string | null
          validade_cnd?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          razao_social?: string
          status_cnd?: string | null
          validade_cnd?: string | null
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          created_at: string
          id: string
          numero_termo: string | null
          osc_id: string
          public_call_id: string | null
          status: string | null
          tipo_origem: string | null
          valor_repassado: number | null
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          numero_termo?: string | null
          osc_id: string
          public_call_id?: string | null
          status?: string | null
          tipo_origem?: string | null
          valor_repassado?: number | null
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          numero_termo?: string | null
          osc_id?: string
          public_call_id?: string | null
          status?: string | null
          tipo_origem?: string | null
          valor_repassado?: number | null
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_osc_id_fkey"
            columns: ["osc_id"]
            isOneToOne: false
            referencedRelation: "oscs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_public_call_id_fkey"
            columns: ["public_call_id"]
            isOneToOne: false
            referencedRelation: "public_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      pmis: {
        Row: {
          area_atuacao: string | null
          created_at: string
          descricao: string | null
          id: string
          justificativa: string | null
          objetivo: string | null
          osc_proponente_id: string | null
          parecer: string | null
          protocolo: string
          publico_alvo: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          area_atuacao?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          justificativa?: string | null
          objetivo?: string | null
          osc_proponente_id?: string | null
          parecer?: string | null
          protocolo: string
          publico_alvo?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          area_atuacao?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          justificativa?: string | null
          objetivo?: string | null
          osc_proponente_id?: string | null
          parecer?: string | null
          protocolo?: string
          publico_alvo?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pmis_osc_proponente_id_fkey"
            columns: ["osc_proponente_id"]
            isOneToOne: false
            referencedRelation: "oscs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          osc_id: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          osc_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          osc_id?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_calls: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          numero_edital: string
          objeto: string
          pdf_url: string | null
          status: string | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          numero_edital: string
          objeto: string
          pdf_url?: string | null
          status?: string | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          numero_edital?: string
          objeto?: string
          pdf_url?: string | null
          status?: string | null
          valor_total?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          categoria: string | null
          created_at: string
          data_transacao: string
          fornecedor: string | null
          id: string
          justificativa_glosa: string | null
          partnership_id: string
          status_conciliacao: string | null
          tipo: string | null
          url_comprovante: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_transacao: string
          fornecedor?: string | null
          id?: string
          justificativa_glosa?: string | null
          partnership_id: string
          status_conciliacao?: string | null
          tipo?: string | null
          url_comprovante: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_transacao?: string
          fornecedor?: string | null
          id?: string
          justificativa_glosa?: string | null
          partnership_id?: string
          status_conciliacao?: string | null
          tipo?: string | null
          url_comprovante?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      work_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          cronograma: Json | null
          equipe: Json | null
          id: string
          justificativa: string | null
          metas: Json | null
          objetivos: string | null
          observacoes: string | null
          orcamento: Json | null
          partnership_id: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          cronograma?: Json | null
          equipe?: Json | null
          id?: string
          justificativa?: string | null
          metas?: Json | null
          objetivos?: string | null
          observacoes?: string | null
          orcamento?: Json | null
          partnership_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          cronograma?: Json | null
          equipe?: Json | null
          id?: string
          justificativa?: string | null
          metas?: Json | null
          objetivos?: string | null
          observacoes?: string | null
          orcamento?: Json | null
          partnership_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_plans_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
