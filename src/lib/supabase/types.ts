export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    nome: string
                    email: string
                    avatar_url: string | null
                    perfil: 'admin' | 'criador'
                    status: 'ativo' | 'inativo'
                    cota_mensal: number
                    cota_usada: number
                    created_at: string
                    last_activity: string | null
                }
                Insert: {
                    id: string
                    nome: string
                    email: string
                    avatar_url?: string | null
                    perfil?: 'admin' | 'criador'
                    status?: 'ativo' | 'inativo'
                    cota_mensal?: number
                    cota_usada?: number
                    created_at?: string
                    last_activity?: string | null
                }
                Update: {
                    id?: string
                    nome?: string
                    email?: string
                    avatar_url?: string | null
                    perfil?: 'admin' | 'criador'
                    status?: 'ativo' | 'inativo'
                    cota_mensal?: number
                    cota_usada?: number
                    created_at?: string
                    last_activity?: string | null
                }
            }
            videos: {
                Row: {
                    id: string
                    user_id: string
                    nome_produto: string
                    descricao_produto: string
                    imagem_produto_url: string | null
                    logo_empresa_url: string | null
                    formato: string
                    linha_editorial: string
                    duracao: number
                    tom: string
                    status: 'processando' | 'concluido' | 'erro'
                    video_url: string | null
                    pasta_id: string | null
                    nano_banana_job_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    nome_produto: string
                    descricao_produto: string
                    imagem_produto_url?: string | null
                    logo_empresa_url?: string | null
                    formato: string
                    linha_editorial: string
                    duracao: number
                    tom: string
                    status?: 'processando' | 'concluido' | 'erro'
                    video_url?: string | null
                    pasta_id?: string | null
                    nano_banana_job_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    nome_produto?: string
                    descricao_produto?: string
                    imagem_produto_url?: string | null
                    logo_empresa_url?: string | null
                    formato?: string
                    linha_editorial?: string
                    duracao?: number
                    tom?: string
                    status?: 'processando' | 'concluido' | 'erro'
                    video_url?: string | null
                    pasta_id?: string | null
                    nano_banana_job_id?: string | null
                    created_at?: string
                }
            }
            pastas: {
                Row: {
                    id: string
                    user_id: string
                    nome: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    nome: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    nome?: string
                    created_at?: string
                }
            }
            integracoes: {
                Row: {
                    id: string
                    user_id: string
                    tipo: 'google_drive' | 'dropbox' | 'instagram' | 'facebook' | 'webhook' | 'notion'
                    token_acesso: string | null
                    configuracoes: Json | null
                    ativo: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tipo: 'google_drive' | 'dropbox' | 'instagram' | 'facebook' | 'webhook' | 'notion'
                    token_acesso?: string | null
                    configuracoes?: Json | null
                    ativo?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tipo?: 'google_drive' | 'dropbox' | 'instagram' | 'facebook' | 'webhook' | 'notion'
                    token_acesso?: string | null
                    configuracoes?: Json | null
                    ativo?: boolean
                    created_at?: string
                }
            }
            notificacoes: {
                Row: {
                    id: string
                    user_id: string
                    mensagem: string
                    lida: boolean
                    tipo: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    mensagem: string
                    lida?: boolean
                    tipo: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    mensagem?: string
                    lida?: boolean
                    tipo?: string
                    created_at?: string
                }
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
    }
}
