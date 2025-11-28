/**
 * Schema de Validação - Perfis de Usuários
 * 
 * ICARUS v5.1 - Conformidade LGPD
 */

import { z } from 'zod'

// ============================================
// ENUMS
// ============================================

export const CargoUsuario = ['admin', 'gerente', 'vendedor', 'usuario', 'visualizador'] as const
export type CargoUsuarioType = typeof CargoUsuario[number]

// ============================================
// SCHEMAS ZOD
// ============================================

export const insertPerfilSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  empresa_id: z
    .string()
    .uuid('ID da empresa inválido')
    .nullable()
    .optional(),
  
  nome_completo: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  cargo: z
    .enum(CargoUsuario, {
      required_error: 'Cargo é obrigatório',
    })
    .default('usuario'),
  
  avatar_url: z
    .string()
    .url('URL do avatar inválida')
    .nullable()
    .optional(),
  
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  celular: z
    .string()
    .regex(/^\d{11}$/, 'Celular deve ter 11 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  departamento: z
    .string()
    .max(100, 'Departamento deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  
  permissoes: z
    .record(z.boolean())
    .default({}),
  
  ativo: z.boolean().default(true),
  
  ultimo_acesso: z
    .string()
    .datetime()
    .nullable()
    .optional(),
})

export const selectPerfilSchema = insertPerfilSchema.extend({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const updatePerfilSchema = insertPerfilSchema.partial().omit({ id: true })

// ============================================
// TYPES
// ============================================

export type Perfil = z.infer<typeof selectPerfilSchema>
export type NovoPerfil = z.infer<typeof insertPerfilSchema>
export type UpdatePerfil = z.infer<typeof updatePerfilSchema>

// ============================================
// HELPERS
// ============================================

export function hasPermission(perfil: Perfil, permissao: string): boolean {
  if (perfil.cargo === 'admin') return true
  return perfil.permissoes?.[permissao] === true
}

export function isManager(cargo: CargoUsuarioType): boolean {
  return cargo === 'admin' || cargo === 'gerente'
}

