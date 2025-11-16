import { useEffect, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import {
  type FinancialAccount,
  type PaymentData,
  type PaymentMethod,
  type BankAccount,
} from '@/types/financial.types'

const paymentFormSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  payment_date: z.string().min(1, 'Data de pagamento é obrigatória'),
  payment_method: z.enum(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'pix', 'boleto', 'check']),
  bank_account_id: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: FinancialAccount
  bankAccounts: BankAccount[]
  onSubmit: (data: PaymentData) => Promise<void>
}

export function PaymentDialog({
  open,
  onOpenChange,
  account,
  bankAccounts,
  onSubmit,
}: PaymentDialogProps) {
  const remainingAmount = account.final_amount - account.paid_amount
  const [calculatedRemaining, setCalculatedRemaining] = useState(remainingAmount)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'pix',
      bank_account_id: bankAccounts.find((b) => b.is_main)?.id || bankAccounts[0]?.id,
      notes: '',
    },
  })

  const paymentAmount = watch('amount')

  // Calculate remaining after payment
  useEffect(() => {
    const newRemaining = remainingAmount - (paymentAmount || 0)
    setCalculatedRemaining(newRemaining)
  }, [paymentAmount, remainingAmount])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const mainBankAccount = bankAccounts.find((b) => b.is_main)?.id || bankAccounts[0]?.id
      reset({
        amount: remainingAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'pix',
        bank_account_id: mainBankAccount,
        notes: '',
      })
    }
  }, [open, remainingAmount, bankAccounts, reset])

  const handleFormSubmit = async (data: PaymentFormValues) => {
    try {
      const paymentData: PaymentData = {
        financial_account_id: account.id,
        amount: data.amount,
        payment_date: data.payment_date,
        payment_method: data.payment_method,
        bank_account_id: data.bank_account_id,
        notes: data.notes,
      }
      await onSubmit(paymentData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting payment:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const isFullPayment = calculatedRemaining <= 0
  const isPartialPayment = calculatedRemaining > 0 && calculatedRemaining < remainingAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1a1f2e] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Registrar Pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Account Summary */}
        <div className="p-4 bg-[#0f1419] rounded-lg border border-gray-700 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{account.description}</h3>
              <p className="text-sm text-gray-400">{account.category}</p>
            </div>
            <Badge
              className={
                account.type === 'receivable'
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }
            >
              {account.type === 'receivable' ? 'A Receber' : 'A Pagar'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Valor Original</p>
              <p className="font-semibold text-white">{formatCurrency(account.amount)}</p>
            </div>
            <div>
              <p className="text-gray-400">Valor Final</p>
              <p className="font-semibold text-white">{formatCurrency(account.final_amount)}</p>
            </div>
            <div>
              <p className="text-gray-400">Já Pago</p>
              <p className="font-semibold text-green-400">{formatCurrency(account.paid_amount)}</p>
            </div>
            <div>
              <p className="text-gray-400">Restante</p>
              <p className="font-semibold text-yellow-400">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          {account.discount > 0 && (
            <p className="text-sm text-gray-400">
              Desconto: {formatCurrency(account.discount)}
            </p>
          )}
          {account.interest > 0 && (
            <p className="text-sm text-gray-400">
              Juros: {formatCurrency(account.interest)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Payment Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-gray-300">
                Valor do Pagamento (R$)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('amount', remainingAmount)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs"
              >
                Pagar Total
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="bg-[#0f1419] border-gray-700 text-white text-lg font-semibold"
            />
            {errors.amount && (
              <p className="text-sm text-red-400">{errors.amount.message}</p>
            )}

            {/* Payment Status Preview */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0f1419] border border-gray-700">
              {isFullPayment ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-semibold text-green-400">Pagamento Total</p>
                    <p className="text-xs text-gray-400">Conta será marcada como paga</p>
                  </div>
                </>
              ) : isPartialPayment ? (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">
                      Pagamento Parcial - Restará {formatCurrency(calculatedRemaining)}
                    </p>
                    <p className="text-xs text-gray-400">Conta ficará com status parcial</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Informe o valor do pagamento</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment_date" className="text-gray-300">
              Data do Pagamento
            </Label>
            <Input
              id="payment_date"
              type="date"
              {...register('payment_date')}
              className="bg-[#0f1419] border-gray-700 text-white"
            />
            {errors.payment_date && (
              <p className="text-sm text-red-400">{errors.payment_date.message}</p>
            )}
          </div>

          {/* Payment Info - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="text-gray-300">
                Forma de Pagamento
              </Label>
              <Select
                value={watch('payment_method')}
                onValueChange={(value) => setValue('payment_method', value as PaymentMethod)}
              >
                <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
                  <SelectValue />
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
              {errors.payment_method && (
                <p className="text-sm text-red-400">{errors.payment_method.message}</p>
              )}
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
                      {bank.is_main && (
                        <Badge className="ml-2 bg-blue-600/20 text-blue-400 text-xs">Principal</Badge>
                      )}
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
              className="bg-[#0f1419] border-gray-700 text-white min-h-[80px]"
              placeholder="Adicione observações sobre este pagamento..."
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
              disabled={isSubmitting || !paymentAmount || paymentAmount <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
