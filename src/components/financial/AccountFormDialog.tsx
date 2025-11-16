import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  type FinancialAccount,
  type FinancialAccountFormData,
  type AccountType,
  type PaymentMethod,
  type BankAccount,
} from '@/types/financial.types'

const accountFormSchema = z.object({
  type: z.enum(['receivable', 'payable']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  discount: z.number().min(0).optional(),
  interest: z.number().min(0).optional(),
  issue_date: z.string().min(1, 'Data de emissão é obrigatória'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  payment_date: z.string().optional(),
  payment_method: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'pix', 'boleto', 'check']).optional(),
  bank_account_id: z.string().optional(),
  notes: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: FinancialAccount
  defaultType?: AccountType
  bankAccounts: BankAccount[]
  onSubmit: (data: FinancialAccountFormData) => Promise<void>
}

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
  defaultType = 'receivable',
  bankAccounts,
  onSubmit,
}: AccountFormDialogProps) {
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      type: defaultType,
      category: '',
      description: '',
      amount: 0,
      discount: 0,
      interest: 0,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      payment_date: undefined,
      payment_method: undefined,
      bank_account_id: undefined,
      notes: '',
    },
  })

  const accountType = watch('type')

  // Reset form when dialog opens/closes or account changes
  useEffect(() => {
    if (open) {
      if (account) {
        reset({
          type: account.type,
          category: account.category,
          description: account.description,
          amount: account.amount,
          discount: account.discount,
          interest: account.interest,
          issue_date: account.issue_date,
          due_date: account.due_date,
          payment_date: account.payment_date || undefined,
          payment_method: account.payment_method || undefined,
          bank_account_id: account.bank_account_id || undefined,
          notes: account.notes || '',
        })
      } else {
        reset({
          type: defaultType,
          category: '',
          description: '',
          amount: 0,
          discount: 0,
          interest: 0,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: '',
          payment_date: undefined,
          payment_method: undefined,
          bank_account_id: undefined,
          notes: '',
        })
      }
    }
  }, [open, account, defaultType, reset])

  const handleFormSubmit = async (data: AccountFormValues) => {
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting account:', error)
    }
  }

  const categoryOptions = {
    receivable: [
      { value: 'sale', label: 'Venda' },
      { value: 'service', label: 'Serviço' },
      { value: 'surgery', label: 'Cirurgia' },
      { value: 'other', label: 'Outros' },
    ],
    payable: [
      { value: 'purchase', label: 'Compra' },
      { value: 'expense', label: 'Despesa' },
      { value: 'salary', label: 'Salário' },
      { value: 'rent', label: 'Aluguel' },
      { value: 'tax', label: 'Imposto' },
      { value: 'other', label: 'Outros' },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1f2e] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-300">
              Tipo
            </Label>
            <Select
              value={accountType}
              onValueChange={(value) => setValue('type', value as AccountType)}
              disabled={isEditing}
            >
              <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-gray-700">
                <SelectItem value="receivable" className="text-white">
                  Conta a Receber
                </SelectItem>
                <SelectItem value="payable" className="text-white">
                  Conta a Pagar
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-400">{errors.type.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">
              Categoria
            </Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-gray-700">
                {categoryOptions[accountType].map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-400">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Descrição
            </Label>
            <Input
              id="description"
              {...register('description')}
              className="bg-[#0f1419] border-gray-700 text-white"
              placeholder="Ex: Faturamento Cirurgia #12345"
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Financial Data - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="bg-[#0f1419] border-gray-700 text-white"
              />
              {errors.amount && (
                <p className="text-sm text-red-400">{errors.amount.message}</p>
              )}
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-gray-300">
                Desconto (R$)
              </Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                {...register('discount', { valueAsNumber: true })}
                className="bg-[#0f1419] border-gray-700 text-white"
              />
              {errors.discount && (
                <p className="text-sm text-red-400">{errors.discount.message}</p>
              )}
            </div>

            {/* Interest */}
            <div className="space-y-2">
              <Label htmlFor="interest" className="text-gray-300">
                Juros (R$)
              </Label>
              <Input
                id="interest"
                type="number"
                step="0.01"
                {...register('interest', { valueAsNumber: true })}
                className="bg-[#0f1419] border-gray-700 text-white"
              />
              {errors.interest && (
                <p className="text-sm text-red-400">{errors.interest.message}</p>
              )}
            </div>
          </div>

          {/* Dates - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issue_date" className="text-gray-300">
                Data de Emissão
              </Label>
              <Input
                id="issue_date"
                type="date"
                {...register('issue_date')}
                className="bg-[#0f1419] border-gray-700 text-white"
              />
              {errors.issue_date && (
                <p className="text-sm text-red-400">{errors.issue_date.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-gray-300">
                Data de Vencimento
              </Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
                className="bg-[#0f1419] border-gray-700 text-white"
              />
              {errors.due_date && (
                <p className="text-sm text-red-400">{errors.due_date.message}</p>
              )}
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="payment_date" className="text-gray-300">
                Data de Pagamento
              </Label>
              <Input
                id="payment_date"
                type="date"
                {...register('payment_date')}
                className="bg-[#0f1419] border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Payment Info - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="text-gray-300">
                Forma de Pagamento
              </Label>
              <Select
                value={watch('payment_method') || ''}
                onValueChange={(value) => setValue('payment_method', value as PaymentMethod)}
              >
                <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-gray-700">
                  <SelectItem value="cash" className="text-white">Dinheiro</SelectItem>
                  <SelectItem value="bank_transfer" className="text-white">Transferência</SelectItem>
                  <SelectItem value="credit_card" className="text-white">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card" className="text-white">Cartão de Débito</SelectItem>
                  <SelectItem value="pix" className="text-white">PIX</SelectItem>
                  <SelectItem value="boleto" className="text-white">Boleto</SelectItem>
                  <SelectItem value="check" className="text-white">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bank_account_id" className="text-gray-300">
                Conta Bancária
              </Label>
              <Select
                value={watch('bank_account_id') || ''}
                onValueChange={(value) => setValue('bank_account_id', value)}
              >
                <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-gray-700">
                  {bankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id} className="text-white">
                      {bank.bank_name} - {bank.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">
              Observações
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              className="bg-[#0f1419] border-gray-700 text-white min-h-[100px]"
              placeholder="Adicione observações sobre esta conta..."
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
