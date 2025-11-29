/**
 * Sistema de Export de Gráficos
 * Formatos: PDF, Excel, PNG
 * Dark Glass Medical compatible
 */

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

export interface ChartExportOptions {
  filename?: string
  format: 'pdf' | 'excel' | 'png'
  quality?: number // 0.1 - 1.0
  orientation?: 'portrait' | 'landscape'
}

export interface ChartData {
  title: string
  subtitle?: string
  data: any[]
  dataKey: string
  xAxisKey: string
}

/**
 * Export gráfico para PDF
 */
export async function exportChartToPDF(
  chartElement: HTMLElement,
  options: ChartExportOptions
): Promise<void> {
  try {
    // Capturar elemento como canvas
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#0B0D16', // Dark Glass Medical background
      scale: 2, // 2x para melhor qualidade
      logging: false,
    })

    // Criar PDF
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Dimensões do PDF
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calcular proporções
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 10

    // Adicionar imagem ao PDF
    pdf.addImage(
      canvas.toDataURL('image/png', options.quality || 0.95),
      'PNG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    )

    // Adicionar metadados
    pdf.setProperties({
      title: options.filename || 'Chart Export',
      subject: 'ICARUS v5.0 - Dark Glass Medical',
      author: 'ICARUS System',
      keywords: 'analytics, chart, dashboard',
      creator: 'ICARUS v5.0',
    })

    // Download
    pdf.save(`${options.filename || 'chart'}.pdf`)
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error)
    throw new Error('Falha no export para PDF')
  }
}

/**
 * Export dados do gráfico para Excel
 */
export async function exportChartToExcel(
  chartData: ChartData,
  options: ChartExportOptions
): Promise<void> {
  try {
    // Criar workbook
    const wb = XLSX.utils.book_new()

    // Preparar dados
    const wsData = [
      // Header
      [chartData.title],
      [chartData.subtitle || ''],
      [],
      // Column headers
      [chartData.xAxisKey, chartData.dataKey],
      // Data rows
      ...chartData.data.map(row => [
        row[chartData.xAxisKey],
        row[chartData.dataKey],
      ]),
    ]

    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Estilização (se suportado pelo formato)
    ws['!cols'] = [
      { wch: 20 }, // Largura coluna 1
      { wch: 15 }, // Largura coluna 2
    ]

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Dados')

    // Criar segunda aba com metadados
    const metaData = [
      ['Metadados'],
      [],
      ['Sistema', 'ICARUS v5.0'],
      ['Design System', 'Dark Glass Medical'],
      ['Data de Export', new Date().toISOString()],
      ['Total de Registros', chartData.data.length.toString()],
    ]
    const wsMeta = XLSX.utils.aoa_to_sheet(metaData)
    XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadados')

    // Download
    XLSX.writeFile(wb, `${options.filename || 'chart-data'}.xlsx`)
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
    throw new Error('Falha no export para Excel')
  }
}

/**
 * Export gráfico para PNG
 */
export async function exportChartToPNG(
  chartElement: HTMLElement,
  options: ChartExportOptions
): Promise<void> {
  try {
    // Capturar elemento como canvas
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#0B0D16', // Dark Glass Medical
      scale: 3, // 3x para alta qualidade
      logging: false,
    })

    // Converter para blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Falha ao criar blob')
        }

        // Criar link de download
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${options.filename || 'chart'}.png`
        link.href = url
        link.click()

        // Cleanup
        URL.revokeObjectURL(url)
      },
      'image/png',
      options.quality || 0.95
    )
  } catch (error) {
    console.error('Erro ao exportar para PNG:', error)
    throw new Error('Falha no export para PNG')
  }
}

/**
 * Export múltiplos gráficos para PDF (multi-página)
 */
export async function exportMultipleChartsToPDF(
  chartElements: HTMLElement[],
  options: ChartExportOptions
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    for (let i = 0; i < chartElements.length; i++) {
      const canvas = await html2canvas(chartElements[i], {
        backgroundColor: '#0B0D16',
        scale: 2,
        logging: false,
      })

      if (i > 0) {
        pdf.addPage()
      }

      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(
        canvas.toDataURL('image/png', 0.95),
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      )

      // Adicionar número da página
      pdf.setFontSize(10)
      pdf.setTextColor(148, 163, 184) // Slate 400
      pdf.text(
        `Página ${i + 1} de ${chartElements.length}`,
        pdfWidth / 2,
        pdfHeight - 5,
        { align: 'center' }
      )
    }

    pdf.save(`${options.filename || 'charts-export'}.pdf`)
  } catch (error) {
    console.error('Erro ao exportar múltiplos gráficos:', error)
    throw new Error('Falha no export multi-página')
  }
}

/**
 * Helper: Detectar formato de arquivo
 */
export function detectExportFormat(filename: string): 'pdf' | 'excel' | 'png' | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'pdf':
      return 'pdf'
    case 'xlsx':
    case 'xls':
      return 'excel'
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'png'
    default:
      return null
  }
}

/**
 * Hook React para usar export
 */
export function useChartExport() {
  const exportChart = async (
    elementId: string,
    chartData: ChartData,
    options: ChartExportOptions
  ) => {
    const element = document.getElementById(elementId)
    
    if (!element) {
      throw new Error(`Elemento ${elementId} não encontrado`)
    }

    switch (options.format) {
      case 'pdf':
        await exportChartToPDF(element, options)
        break
      case 'excel':
        await exportChartToExcel(chartData, options)
        break
      case 'png':
        await exportChartToPNG(element, options)
        break
      default:
        throw new Error(`Formato ${options.format} não suportado`)
    }
  }

  return { exportChart }
}

// Export de utilitários
export { html2canvas, jsPDF, XLSX }

