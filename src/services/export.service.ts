import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type {
  FinancialAccount,
  FinancialSummary,
  MonthlyFinancialData,
} from '@/types/financial.types'

/**
 * Export Service - Handle PDF, Excel, and CSV exports
 */
export class ExportService {
  /**
   * Format currency for display
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  /**
   * Format date for display
   */
  private static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  /**
   * Export Financial Report to PDF
   */
  static exportFinancialReportPDF(
    summary: FinancialSummary,
    receivableAccounts: FinancialAccount[],
    payableAccounts: FinancialAccount[],
    monthlyData: MonthlyFinancialData[]
  ): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('ICARUS v5.0 - Relatório Financeiro', pageWidth / 2, yPosition, {
      align: 'center',
    })

    yPosition += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPosition, {
      align: 'center',
    })

    yPosition += 15

    // Summary Section
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text('Resumo Financeiro', 14, yPosition)
    yPosition += 10

    const summaryData = [
      ['Contas a Receber (Pendente)', this.formatCurrency(summary.receivables.pending)],
      ['Contas a Receber (Vencido)', this.formatCurrency(summary.receivables.overdue)],
      ['Contas a Receber (Pago)', this.formatCurrency(summary.receivables.paid)],
      ['Contas a Pagar (Pendente)', this.formatCurrency(summary.payables.pending)],
      ['Contas a Pagar (Vencido)', this.formatCurrency(summary.payables.overdue)],
      ['Contas a Pagar (Pago)', this.formatCurrency(summary.payables.paid)],
      ['Saldo Bancário', this.formatCurrency(summary.bankAccounts.totalBalance)],
      ['Fluxo Líquido Mensal', this.formatCurrency(summary.cashFlow.netFlow)],
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Indicador', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Receivables Section
    if (receivableAccounts.length > 0) {
      doc.setFontSize(14)
      doc.text('Contas a Receber', 14, yPosition)
      yPosition += 10

      const receivablesData = receivableAccounts.slice(0, 20).map((account) => [
        account.description,
        this.formatCurrency(account.final_amount),
        this.formatDate(account.due_date),
        account.status === 'paid' ? 'Pago' : account.status === 'overdue' ? 'Vencido' : 'Pendente',
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Descrição', 'Valor', 'Vencimento', 'Status']],
        body: receivablesData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15
    }

    // Add new page if needed
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // Payables Section
    if (payableAccounts.length > 0) {
      doc.setFontSize(14)
      doc.text('Contas a Pagar', 14, yPosition)
      yPosition += 10

      const payablesData = payableAccounts.slice(0, 20).map((account) => [
        account.description,
        this.formatCurrency(account.final_amount),
        this.formatDate(account.due_date),
        account.status === 'paid' ? 'Pago' : account.status === 'overdue' ? 'Vencido' : 'Pendente',
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Descrição', 'Valor', 'Vencimento', 'Status']],
        body: payablesData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14, right: 14 },
      })
    }

    // Save PDF
    const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  /**
   * Export Accounts to Excel
   */
  static exportAccountsExcel(
    receivableAccounts: FinancialAccount[],
    payableAccounts: FinancialAccount[]
  ): void {
    const workbook = XLSX.utils.book_new()

    // Receivables Sheet
    if (receivableAccounts.length > 0) {
      const receivablesData = receivableAccounts.map((account) => ({
        Descrição: account.description,
        Categoria: account.category,
        'Valor Original': account.amount,
        Desconto: account.discount,
        Juros: account.interest,
        'Valor Final': account.final_amount,
        'Valor Pago': account.paid_amount,
        'Data Emissão': this.formatDate(account.issue_date),
        'Data Vencimento': this.formatDate(account.due_date),
        'Data Pagamento': account.payment_date ? this.formatDate(account.payment_date) : '',
        Status: account.status === 'paid' ? 'Pago' : account.status === 'overdue' ? 'Vencido' : 'Pendente',
        Observações: account.notes || '',
      }))

      const receivablesSheet = XLSX.utils.json_to_sheet(receivablesData)
      XLSX.utils.book_append_sheet(workbook, receivablesSheet, 'Contas a Receber')
    }

    // Payables Sheet
    if (payableAccounts.length > 0) {
      const payablesData = payableAccounts.map((account) => ({
        Descrição: account.description,
        Categoria: account.category,
        'Valor Original': account.amount,
        Desconto: account.discount,
        Juros: account.interest,
        'Valor Final': account.final_amount,
        'Valor Pago': account.paid_amount,
        'Data Emissão': this.formatDate(account.issue_date),
        'Data Vencimento': this.formatDate(account.due_date),
        'Data Pagamento': account.payment_date ? this.formatDate(account.payment_date) : '',
        Status: account.status === 'paid' ? 'Pago' : account.status === 'overdue' ? 'Vencido' : 'Pendente',
        Observações: account.notes || '',
      }))

      const payablesSheet = XLSX.utils.json_to_sheet(payablesData)
      XLSX.utils.book_append_sheet(workbook, payablesSheet, 'Contas a Pagar')
    }

    // Save Excel
    const fileName = `contas-financeiras-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  /**
   * Export Cash Flow to CSV
   */
  static exportCashFlowCSV(monthlyData: MonthlyFinancialData[]): void {
    // CSV Header
    const header = 'Mês,Receitas,Despesas,Fluxo Líquido\n'

    // CSV Rows
    const rows = monthlyData
      .map((data) => {
        return `${data.month},${data.income},${data.expense},${data.netFlow}`
      })
      .join('\n')

    // Combine
    const csv = header + rows

    // Create Blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `fluxo-caixa-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Export Detailed Cash Flow to Excel (with more details)
   */
  static exportCashFlowExcel(monthlyData: MonthlyFinancialData[]): void {
    const workbook = XLSX.utils.book_new()

    const cashFlowData = monthlyData.map((data) => ({
      Mês: data.month,
      Receitas: data.income,
      Despesas: data.expense,
      'Fluxo Líquido': data.netFlow,
      Status: data.netFlow >= 0 ? 'Positivo' : 'Negativo',
    }))

    const sheet = XLSX.utils.json_to_sheet(cashFlowData)
    XLSX.utils.book_append_sheet(workbook, sheet, 'Fluxo de Caixa')

    const fileName = `fluxo-caixa-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  /**
   * Export single account details to PDF
   */
  static exportAccountDetailPDF(account: FinancialAccount): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPosition = 20

    // Header
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text('Detalhes da Conta', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15

    // Account Type Badge
    doc.setFontSize(12)
    const typeColor = account.type === 'receivable' ? [16, 185, 129] : [239, 68, 68]
    doc.setFillColor(typeColor[0], typeColor[1], typeColor[2])
    doc.setTextColor(255, 255, 255)
    const typeText = account.type === 'receivable' ? 'A RECEBER' : 'A PAGAR'
    doc.rect(14, yPosition - 5, 40, 8, 'F')
    doc.text(typeText, 34, yPosition, { align: 'center' })

    yPosition += 15
    doc.setTextColor(40, 40, 40)

    // Details
    const details = [
      ['Descrição', account.description],
      ['Categoria', account.category],
      ['Valor Original', this.formatCurrency(account.amount)],
      ['Desconto', this.formatCurrency(account.discount)],
      ['Juros', this.formatCurrency(account.interest)],
      ['Valor Final', this.formatCurrency(account.final_amount)],
      ['Valor Pago', this.formatCurrency(account.paid_amount)],
      ['Valor Pendente', this.formatCurrency(account.final_amount - account.paid_amount)],
      ['Data de Emissão', this.formatDate(account.issue_date)],
      ['Data de Vencimento', this.formatDate(account.due_date)],
      [
        'Data de Pagamento',
        account.payment_date ? this.formatDate(account.payment_date) : 'Não pago',
      ],
      [
        'Status',
        account.status === 'paid' ? 'Pago' : account.status === 'overdue' ? 'Vencido' : 'Pendente',
      ],
      ['Forma de Pagamento', account.payment_method || 'N/A'],
      ['Observações', account.notes || 'Nenhuma'],
    ]

    autoTable(doc, {
      startY: yPosition,
      body: details,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    })

    // Save
    const fileName = `conta-${account.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }
}
