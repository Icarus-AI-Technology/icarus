import { z } from 'zod'

export const productSchema = z.object({
  code: z.string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),

  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),

  category_id: z.string()
    .uuid('Categoria inválida')
    .optional(),

  price: z.number()
    .min(0, 'Preço deve ser maior ou igual a zero')
    .positive('Preço deve ser positivo'),

  cost: z.number()
    .min(0, 'Custo deve ser maior ou igual a zero'),

  stock: z.number()
    .int('Estoque deve ser um número inteiro')
    .min(0, 'Estoque deve ser maior ou igual a zero'),

  min_stock: z.number()
    .int('Estoque mínimo deve ser um número inteiro')
    .min(0, 'Estoque mínimo deve ser maior ou igual a zero'),

  unit: z.string()
    .min(1, 'Unidade é obrigatória')
    .max(10, 'Unidade deve ter no máximo 10 caracteres'),

  active: z.boolean()
    .default(true)
})

export type ProductFormData = z.infer<typeof productSchema>
