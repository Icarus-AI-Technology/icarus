import type { FinancialAccount, DREData } from '@/types/financial.types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * DRE Service - Demonstração de Resultados do Exercício
 * Calcula indicadores financeiros e gera relatórios
 */
export class DREService {
  /**
   * Calculate DRE for a given period
   */
  static calculateDRE(
    accounts: FinancialAccount[],
    startDate: string,
    endDate: string
  ): DREData {
    // Filter accounts by period
    const periodAccounts = accounts.filter((account) => {
      const accountDate = account.payment_date || account.due_date
      return accountDate >= startDate && accountDate <= endDate
    })

    // Calculate revenues (receivables paid)
    const revenueAccounts = periodAccounts.filter(
      (a) => a.type === 'receivable' && a.status === 'paid'
    )

    const salesRevenue = revenueAccounts
      .filter((a) => a.category === 'sale' || a.category === 'surgery')
      .reduce((sum, a) => sum + a.final_amount, 0)

    const servicesRevenue = revenueAccounts
      .filter((a) => a.category === 'service')
      .reduce((sum, a) => sum + a.final_amount, 0)

    const otherRevenue = revenueAccounts
      .filter((a) => a.category === 'other')
      .reduce((sum, a) => sum + a.final_amount, 0)

    const totalRevenue = salesRevenue + servicesRevenue + otherRevenue

    // Calculate costs (COGS - Cost of Goods Sold)
    const costAccounts = periodAccounts.filter(
      (a) =>
        a.type === 'payable' &&
        a.status === 'paid' &&
        (a.category === 'purchase' || a.category === 'salary')
    )

    const materialsCost = costAccounts
      .filter((a) => a.category === 'purchase')
      .reduce((sum, a) => sum + a.final_amount, 0)

    const laborCost = costAccounts
      .filter((a) => a.category === 'salary')
      .reduce((sum, a) => sum + a.final_amount, 0)

    const overheadCost = 0 // Could be calculated from specific categories
    const totalCosts = materialsCost + laborCost + overheadCost

    // Calculate operating expenses
    const expenseAccounts = periodAccounts.filter(
      (a) => a.type === 'payable' && a.status === 'paid' && a.category === 'expense'
    )

    const administrativeExpenses = expenseAccounts
      .filter((a) => a.description.toLowerCase().includes('admin'))
      .reduce((sum, a) => sum + a.final_amount, 0)

    const salesExpenses = expenseAccounts
      .filter((a) => a.description.toLowerCase().includes('vend'))
      .reduce((sum, a) => sum + a.final_amount, 0)

    const financialExpenses = periodAccounts
      .filter((a) => a.type === 'payable' && a.status === 'paid')
      .reduce((sum, a) => sum + a.interest, 0)

    const otherExpenses = expenseAccounts
      .filter(
        (a) =>
          !a.description.toLowerCase().includes('admin') &&
          !a.description.toLowerCase().includes('vend')
      )
      .reduce((sum, a) => sum + a.final_amount, 0)

    const totalExpenses =
      administrativeExpenses + salesExpenses + financialExpenses + otherExpenses

    // Calculate results
    const grossProfit = totalRevenue - totalCosts
    const operatingProfit = grossProfit - totalExpenses
    const netProfit = operatingProfit // Simplified (no taxes in this version)

    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      revenue: {
        sales: salesRevenue,
        services: servicesRevenue,
        other: otherRevenue,
        total: totalRevenue,
      },
      costs: {
        materials: materialsCost,
        labor: laborCost,
        overhead: overheadCost,
        total: totalCosts,
      },
      expenses: {
        administrative: administrativeExpenses,
        sales: salesExpenses,
        financial: financialExpenses,
        other: otherExpenses,
        total: totalExpenses,
      },
      result: {
        grossProfit,
        operatingProfit,
        netProfit,
        grossMargin,
        netMargin,
      },
    }
  }

  /**
   * Calculate DRE for current month
   */
  static calculateMonthlyDRE(accounts: FinancialAccount[]): DREData {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return this.calculateDRE(
      accounts,
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    )
  }

  /**
   * Calculate comparative DRE (current vs previous period)
   */
  static calculateComparativeDRE(accounts: FinancialAccount[]): {
    current: DREData
    previous: DREData
    comparison: {
      revenueGrowth: number
      profitGrowth: number
      marginChange: number
    }
  } {
    const now = new Date()

    // Current month
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Previous month
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const current = this.calculateDRE(
      accounts,
      currentStart.toISOString().split('T')[0],
      currentEnd.toISOString().split('T')[0]
    )

    const previous = this.calculateDRE(
      accounts,
      previousStart.toISOString().split('T')[0],
      previousEnd.toISOString().split('T')[0]
    )

    // Calculate growth rates
    const revenueGrowth =
      previous.revenue.total > 0
        ? ((current.revenue.total - previous.revenue.total) / previous.revenue.total) * 100
        : 0

    const profitGrowth =
      previous.result.netProfit > 0
        ? ((current.result.netProfit - previous.result.netProfit) / previous.result.netProfit) *
          100
        : 0

    const marginChange = current.result.netMargin - previous.result.netMargin

    return {
      current,
      previous,
      comparison: {
        revenueGrowth,
        profitGrowth,
        marginChange,
      },
    }
  }

  /**
   * Calculate financial indicators
   */
  static calculateIndicators(dre: DREData) {
    const { revenue, costs, expenses, result } = dre

    // ROI (Return on Investment)
    const totalInvestment = costs.total + expenses.total
    const roi = totalInvestment > 0 ? (result.netProfit / totalInvestment) * 100 : 0

    // EBITDA (Earnings Before Interest, Taxes, Depreciation, Amortization)
    // Simplified: Operating Profit + Financial Expenses
    const ebitda = result.operatingProfit + expenses.financial

    // Break Even Point (in revenue)
    const variableCosts = costs.total * 0.7 // Assume 70% variable
    const fixedCosts = costs.total * 0.3 + expenses.total // 30% fixed + expenses
    const contributionMargin = revenue.total - variableCosts
    const contributionMarginRatio =
      revenue.total > 0 ? contributionMargin / revenue.total : 0
    const breakEvenPoint = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0

    // Operational Margin
    const operationalMargin = revenue.total > 0 ? (result.operatingProfit / revenue.total) * 100 : 0

    return {
      roi,
      ebitda,
      breakEvenPoint,
      operationalMargin,
      contributionMargin,
      contributionMarginRatio: contributionMarginRatio * 100,
    }
  }

  /**
   * Get last N months DRE data
   */
  static getMonthlyDREHistory(accounts: FinancialAccount[], months: number = 6): DREData[] {
    const dreHistory: DREData[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const dre = this.calculateDRE(
        accounts,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      dreHistory.push(dre)
    }

    return dreHistory
  }

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
   * Format percentage for display
   */
  private static formatPercent(value: number): string {
    return `${value.toFixed(2)}%`
  }

  /**
   * Export DRE to PDF
   */
  static exportDREtoPDF(dre: DREData, indicators?: ReturnType<typeof this.calculateIndicators>): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('ICARUS v5.0 - DRE', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 7
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text('Demonstração de Resultados do Exercício', pageWidth / 2, yPosition, {
      align: 'center',
    })

    yPosition += 10
    doc.setFontSize(10)
    doc.text(
      `Período: ${new Date(dre.period.start).toLocaleDateString('pt-BR')} até ${new Date(dre.period.end).toLocaleDateString('pt-BR')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    )

    yPosition += 15

    // DRE Table
    const dreData = [
      // Revenues
      [{ content: 'RECEITAS OPERACIONAIS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [99, 102, 241] } }],
      ['  Vendas e Cirurgias', this.formatCurrency(dre.revenue.sales)],
      ['  Serviços', this.formatCurrency(dre.revenue.services)],
      ['  Outras Receitas', this.formatCurrency(dre.revenue.other)],
      [{ content: 'Total de Receitas', styles: { fontStyle: 'bold' } }, { content: this.formatCurrency(dre.revenue.total), styles: { fontStyle: 'bold' } }],
      ['', ''],
      // Costs
      [{ content: 'CUSTOS OPERACIONAIS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [239, 68, 68] } }],
      ['  Materiais', this.formatCurrency(dre.costs.materials)],
      ['  Mão de Obra', this.formatCurrency(dre.costs.labor)],
      ['  Custos Indiretos', this.formatCurrency(dre.costs.overhead)],
      [{ content: 'Total de Custos', styles: { fontStyle: 'bold' } }, { content: this.formatCurrency(dre.costs.total), styles: { fontStyle: 'bold' } }],
      ['', ''],
      // Gross Profit
      [{ content: 'LUCRO BRUTO', styles: { fontStyle: 'bold', fillColor: [16, 185, 129] } }, { content: this.formatCurrency(dre.result.grossProfit), styles: { fontStyle: 'bold', fillColor: [16, 185, 129] } }],
      [{ content: `Margem Bruta: ${this.formatPercent(dre.result.grossMargin)}`, colSpan: 2, styles: { fontSize: 9, textColor: [100, 100, 100] } }],
      ['', ''],
      // Expenses
      [{ content: 'DESPESAS OPERACIONAIS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [239, 68, 68] } }],
      ['  Despesas Administrativas', this.formatCurrency(dre.expenses.administrative)],
      ['  Despesas de Vendas', this.formatCurrency(dre.expenses.sales)],
      ['  Despesas Financeiras', this.formatCurrency(dre.expenses.financial)],
      ['  Outras Despesas', this.formatCurrency(dre.expenses.other)],
      [{ content: 'Total de Despesas', styles: { fontStyle: 'bold' } }, { content: this.formatCurrency(dre.expenses.total), styles: { fontStyle: 'bold' } }],
      ['', ''],
      // Results
      [{ content: 'RESULTADO OPERACIONAL', styles: { fontStyle: 'bold', fillColor: [99, 102, 241] } }, { content: this.formatCurrency(dre.result.operatingProfit), styles: { fontStyle: 'bold', fillColor: [99, 102, 241] } }],
      ['', ''],
      [{ content: 'RESULTADO LÍQUIDO', styles: { fontStyle: 'bold', fontSize: 12, fillColor: [16, 185, 129] } }, { content: this.formatCurrency(dre.result.netProfit), styles: { fontStyle: 'bold', fontSize: 12, fillColor: [16, 185, 129] } }],
      [{ content: `Margem Líquida: ${this.formatPercent(dre.result.netMargin)}`, colSpan: 2, styles: { fontSize: 9, textColor: [100, 100, 100] } }],
    ]

    autoTable(doc, {
      startY: yPosition,
      body: dreData,
      theme: 'grid',
      styles: { fontSize: 10, textColor: [40, 40, 40] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 'auto', halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Indicators section
    if (indicators) {
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text('Indicadores Financeiros', 14, yPosition)
      yPosition += 10

      const indicatorsData = [
        ['ROI (Return on Investment)', this.formatPercent(indicators.roi)],
        ['EBITDA', this.formatCurrency(indicators.ebitda)],
        ['Margem Operacional', this.formatPercent(indicators.operationalMargin)],
        ['Margem de Contribuição', this.formatPercent(indicators.contributionMarginRatio)],
        ['Ponto de Equilíbrio', this.formatCurrency(indicators.breakEvenPoint)],
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [['Indicador', 'Valor']],
        body: indicatorsData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        margin: { left: 14, right: 14 },
      })
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    // Save
    const fileName = `dre-${dre.period.start}-a-${dre.period.end}.pdf`
    doc.save(fileName)
  }
}
