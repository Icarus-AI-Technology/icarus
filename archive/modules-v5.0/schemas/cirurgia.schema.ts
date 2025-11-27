/**
 * Cirurgia (Surgery) Validation Schema
 * LGPD Compliant - No patient PII stored
 */
import { z } from 'zod'

/**
 * Schema for creating/updating a surgery
 * Validates all required fields and formats
 */
export const cirurgiaSchema = z.object({
  // Patient identification (LGPD compliant - initials only)
  paciente_iniciais: z
    .string()
    .min(2, 'Iniciais do paciente devem ter no mínimo 2 caracteres')
    .max(10, 'Iniciais do paciente devem ter no máximo 10 caracteres')
    .regex(
      /^[A-Z]\.([A-Z]\.)*[A-Z]?\.?$/i,
      'Formato inválido. Use iniciais como "J.S." ou "M.A.S."'
    )
    .transform((val) => val.toUpperCase()),

  // Hospital reference for patient (optional)
  paciente_ref_hospital: z
    .string()
    .max(50, 'Referência do hospital deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),

  // Required foreign keys
  doctor_id: z
    .string()
    .uuid('ID do médico inválido')
    .min(1, 'Médico é obrigatório'),

  hospital_id: z
    .string()
    .uuid('ID do hospital inválido')
    .min(1, 'Hospital é obrigatório'),

  // Surgery details
  surgery_type: z
    .string()
    .min(3, 'Tipo de cirurgia deve ter no mínimo 3 caracteres')
    .max(200, 'Tipo de cirurgia deve ter no máximo 200 caracteres'),

  // Scheduling
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine((date) => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, 'Data inválida'),

  scheduled_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM'),

  // Financial
  estimated_value: z
    .number()
    .min(0, 'Valor estimado deve ser maior ou igual a zero')
    .max(10000000, 'Valor estimado deve ser menor que R$ 10.000.000')
    .optional()
    .default(0),

  // Notes
  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
})

/**
 * Schema for updating surgery status
 */
export const cirurgiaStatusSchema = z.object({
  status: z.enum(
    ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    {
      errorMap: () => ({ message: 'Status inválido' }),
    }
  ),
})

/**
 * Type inference from schema
 */
export type CirurgiaFormData = z.infer<typeof cirurgiaSchema>
export type CirurgiaStatusUpdate = z.infer<typeof cirurgiaStatusSchema>

/**
 * Helper to convert patient name to initials (LGPD compliant)
 * @param fullName - Full patient name
 * @returns Patient initials (e.g., "J.S.")
 */
export function nameToInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return ''

  const names = fullName.trim().split(/\s+/)
  const initials = names
    .map((name) => name.charAt(0).toUpperCase())
    .join('.')

  return initials + '.'
}

/**
 * Validate a complete surgery object before submission
 */
export function validateCirurgia(data: unknown): {
  success: boolean
  data?: CirurgiaFormData
  errors?: z.ZodError
} {
  const result = cirurgiaSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}
