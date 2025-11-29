import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { MaskedInput } from '@/components/ui/MaskedInput'
import { useTheme } from '@/hooks/useTheme'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  Settings, Building2, Upload, FileKey, Image, FileText,
  CheckCircle, Shield, Trash2, Eye, Download,
  Lock, Database,
  RefreshCw, Save, Search, Loader2
} from 'lucide-react'

/**
 * Módulo: Configurações do Sistema
 * Categoria: Sistema & Integrações
 * 
 * FUNCIONALIDADES:
 * - Upload de Certificado Digital (A1/A3)
 * - Upload de Logo com ferramentas de edição
 * - Cadastro de Empresa via CNPJ (API Receita Federal)
 * - Templates de Documentos com editor WYSIWYG
 * - Configurações gerais do sistema
 */

// Interface para dados da empresa via CNPJ
interface DadosEmpresaCNPJ {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: {
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  telefone: string
  email: string
  atividadePrincipal: string
  atividadesSecundarias: string[]
  situacaoCadastral: string
  dataAbertura: string
  capitalSocial: number
  naturezaJuridica: string
  regimeTributario: string
  responsavelLegal: string
}

// Interface para certificado digital
interface CertificadoDigital {
  nome: string
  tipo: 'A1' | 'A3'
  validade: string
  status: 'valido' | 'vencido' | 'expirando'
  arquivo?: File
}

export function ConfiguracoesSystemModule() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('empresa')
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false)
  const [cnpjBusca, setCnpjBusca] = useState('')
  const [showPreviewLogo, setShowPreviewLogo] = useState(false)
  
  // Dados da empresa
  const [dadosEmpresa, setDadosEmpresa] = useState<Partial<DadosEmpresaCNPJ>>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    telefone: '',
    email: '',
    regimeTributario: '',
    responsavelLegal: '',
  })

  // Certificado digital
  const [certificado, setCertificado] = useState<CertificadoDigital | null>(null)
  const [senhaCertificado, setSenhaCertificado] = useState('')
  const [isDraggingCert, setIsDraggingCert] = useState(false)

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isDraggingLogo, setIsDraggingLogo] = useState(false)

  // Templates
  const [templates, setTemplates] = useState([
    { id: '1', nome: 'NF-e Padrão', tipo: 'nfe', ativo: true },
    { id: '2', nome: 'Orçamento OPME', tipo: 'orcamento', ativo: true },
    { id: '3', nome: 'Contrato Consignação', tipo: 'contrato', ativo: true },
    { id: '4', nome: 'Relatório Cirúrgico', tipo: 'relatorio', ativo: false },
  ])

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Buscar dados da empresa via CNPJ
  const buscarCNPJ = async () => {
    if (cnpjBusca.replace(/\D/g, '').length !== 14) {
      return
    }

    setIsLoadingCNPJ(true)
    
    try {
      // Simular chamada à API da Receita Federal
      // Em produção, usar API real (ReceitaWS, Brasil API, etc.)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Dados mock
      const dadosMock: DadosEmpresaCNPJ = {
        razaoSocial: 'NEWORTHO DISTRIBUIDORA DE MATERIAIS MEDICOS LTDA',
        nomeFantasia: 'NEWORTHO',
        cnpj: cnpjBusca,
        inscricaoEstadual: '123.456.789.012',
        inscricaoMunicipal: '12345678',
        endereco: {
          logradouro: 'Avenida Paulista',
          numero: '1000',
          complemento: 'Sala 1501',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
        },
        telefone: '(11) 3456-7890',
        email: 'contato@newortho.com.br',
        atividadePrincipal: '46.45-1-01 - Comércio atacadista de instrumentos e materiais para uso médico',
        atividadesSecundarias: [
          '46.44-3-01 - Comércio atacadista de medicamentos',
          '47.73-3-00 - Comércio varejista de artigos médicos',
        ],
        situacaoCadastral: 'ATIVA',
        dataAbertura: '2015-03-15',
        capitalSocial: 500000,
        naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
        regimeTributario: 'lucro_presumido',
        responsavelLegal: 'JOÃO CARLOS DA SILVA',
      }
      
      setDadosEmpresa(dadosMock)
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error)
    } finally {
      setIsLoadingCNPJ(false)
    }
  }

  // Handle upload de certificado
  const handleCertificadoUpload = useCallback((file: File) => {
    if (file.name.endsWith('.pfx') || file.name.endsWith('.p12')) {
      setCertificado({
        nome: file.name,
        tipo: 'A1',
        validade: '2025-12-31',
        status: 'valido',
        arquivo: file,
      })
    }
  }, [])

  // Handle upload de logo
  const handleLogoUpload = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'cert' | 'logo') => {
    e.preventDefault()
    if (type === 'cert') setIsDraggingCert(true)
    else setIsDraggingLogo(true)
  }

  const handleDragLeave = (type: 'cert' | 'logo') => {
    if (type === 'cert') setIsDraggingCert(false)
    else setIsDraggingLogo(false)
  }

  const handleDrop = (e: React.DragEvent, type: 'cert' | 'logo') => {
    e.preventDefault()
    if (type === 'cert') {
      setIsDraggingCert(false)
      const file = e.dataTransfer.files[0]
      if (file) handleCertificadoUpload(file)
    } else {
      setIsDraggingLogo(false)
      const file = e.dataTransfer.files[0]
      if (file) handleLogoUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Configurações do Sistema</h1>
          <p className={textSecondary}>
            Configurações gerais, certificados, empresa e templates
          </p>
        </div>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="certificado" className="gap-2">
            <FileKey className="w-4 h-4" />
            Certificado Digital
          </TabsTrigger>
          <TabsTrigger value="logo" className="gap-2">
            <Image className="w-4 h-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Tab: Empresa */}
        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#6366F1]" />
                Buscar Empresa por CNPJ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <MaskedInput
                    mask="cnpj"
                    label="CNPJ"
                    value={cnpjBusca}
                    onValueChange={(value) => setCnpjBusca(value)}
                    required
                  />
                </div>
                <div className="pt-7">
                  <Button 
                    onClick={buscarCNPJ} 
                    disabled={isLoadingCNPJ || cnpjBusca.replace(/\D/g, '').length !== 14}
                    className="gap-2"
                  >
                    {isLoadingCNPJ ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Buscar na Receita
                  </Button>
                </div>
              </div>

              {/* Dados preenchidos automaticamente */}
              {dadosEmpresa.razaoSocial && (
                <div className="mt-6 space-y-6">
                  <div className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className={`font-medium ${textPrimary}`}>Dados encontrados na Receita Federal</span>
                      <Badge className="bg-green-500/20 text-green-500">
                        {dadosEmpresa.situacaoCadastral}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <MaskedInput
                        mask="uppercase"
                        label="Razão Social"
                        value={dadosEmpresa.razaoSocial}
                        onValueChange={(value) => setDadosEmpresa({ ...dadosEmpresa, razaoSocial: value })}
                        required
                      />
                    </div>
                    <div>
                      <MaskedInput
                        mask="uppercase"
                        label="Nome Fantasia"
                        value={dadosEmpresa.nomeFantasia}
                        onValueChange={(value) => setDadosEmpresa({ ...dadosEmpresa, nomeFantasia: value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <MaskedInput
                        mask="cnpj"
                        label="CNPJ"
                        value={dadosEmpresa.cnpj}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Inscrição Estadual</Label>
                      <Input
                        value={dadosEmpresa.inscricaoEstadual}
                        onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, inscricaoEstadual: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Inscrição Municipal</Label>
                      <Input
                        value={dadosEmpresa.inscricaoMunicipal}
                        onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, inscricaoMunicipal: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>Logradouro</Label>
                      <Input
                        value={dadosEmpresa.endereco?.logradouro}
                        onChange={(e) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, logradouro: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input
                        value={dadosEmpresa.endereco?.numero}
                        onChange={(e) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, numero: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Complemento</Label>
                      <Input
                        value={dadosEmpresa.endereco?.complemento}
                        onChange={(e) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, complemento: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Bairro</Label>
                      <Input
                        value={dadosEmpresa.endereco?.bairro}
                        onChange={(e) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, bairro: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input
                        value={dadosEmpresa.endereco?.cidade}
                        onChange={(e) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, cidade: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Input
                        value={dadosEmpresa.endereco?.estado}
                        onChange={(e) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, estado: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <MaskedInput
                        mask="cep"
                        label="CEP"
                        value={dadosEmpresa.endereco?.cep}
                        onValueChange={(value) => setDadosEmpresa({ 
                          ...dadosEmpresa, 
                          endereco: { ...dadosEmpresa.endereco!, cep: value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <MaskedInput
                        mask="telefone"
                        label="Telefone"
                        value={dadosEmpresa.telefone}
                        onValueChange={(value) => setDadosEmpresa({ ...dadosEmpresa, telefone: value })}
                      />
                    </div>
                    <div>
                      <MaskedInput
                        mask="email"
                        label="Email"
                        value={dadosEmpresa.email}
                        onValueChange={(value) => setDadosEmpresa({ ...dadosEmpresa, email: value })}
                      />
                    </div>
                    <div>
                      <Label>Regime Tributário</Label>
                      <Select
                        value={dadosEmpresa.regimeTributario}
                        onValueChange={(value) => setDadosEmpresa({ ...dadosEmpresa, regimeTributario: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simples">Simples Nacional</SelectItem>
                          <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                          <SelectItem value="lucro_real">Lucro Real</SelectItem>
                          <SelectItem value="mei">MEI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <MaskedInput
                      mask="uppercase"
                      label="Responsável Legal"
                      value={dadosEmpresa.responsavelLegal}
                      onValueChange={(value) => setDadosEmpresa({ ...dadosEmpresa, responsavelLegal: value })}
                    />
                  </div>

                  {dadosEmpresa.capitalSocial && (
                    <div className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <h4 className={`font-medium ${textPrimary} mb-3`}>Informações Adicionais</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className={textSecondary}>Capital Social:</span>
                          <p className={textPrimary}>{formatCurrency(dadosEmpresa.capitalSocial)}</p>
                        </div>
                        <div>
                          <span className={textSecondary}>Data Abertura:</span>
                          <p className={textPrimary}>{dadosEmpresa.dataAbertura}</p>
                        </div>
                        <div className="col-span-2">
                          <span className={textSecondary}>Natureza Jurídica:</span>
                          <p className={textPrimary}>{dadosEmpresa.naturezaJuridica}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Certificado Digital */}
        <TabsContent value="certificado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="w-5 h-5 text-[#6366F1]" />
                Certificado Digital para NF-e
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Zone */}
              <div
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${isDraggingCert 
                    ? 'border-[#6366F1] bg-[#6366F1]/10' 
                    : `${borderColor} hover:border-[#6366F1]/50`
                  }
                `}
                style={{ minHeight: '200px' }}
                onDragOver={(e) => handleDragOver(e, 'cert')}
                onDragLeave={() => handleDragLeave('cert')}
                onDrop={(e) => handleDrop(e, 'cert')}
              >
                <input
                  type="file"
                  accept=".pfx,.p12"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCertificadoUpload(file)
                  }}
                />
                <div className="flex flex-col items-center justify-center h-full">
                  <div className={`w-16 h-16 rounded-2xl ${inputBg} flex items-center justify-center mb-4`}>
                    <Upload className="w-8 h-8 text-[#6366F1]" />
                  </div>
                  <p className={`text-lg font-medium ${textPrimary} mb-2`}>
                    Arraste o certificado aqui
                  </p>
                  <p className={textSecondary}>
                    ou clique para selecionar
                  </p>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    Formatos aceitos: .pfx, .p12 (A1/A3) • Máximo 10MB
                  </p>
                </div>
              </div>

              {/* Certificado Atual */}
              {certificado && (
                <div className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        certificado.status === 'valido' ? 'bg-green-500/20' :
                        certificado.status === 'expirando' ? 'bg-cyan-500/20' : 'bg-red-500/20'
                      }`}>
                        <FileKey className={`w-6 h-6 ${
                          certificado.status === 'valido' ? 'text-green-500' :
                          certificado.status === 'expirando' ? 'text-cyan-400' : 'text-red-500'
                        }`} />
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{certificado.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={
                            certificado.status === 'valido' ? 'bg-green-500/20 text-green-500' :
                            certificado.status === 'expirando' ? 'bg-cyan-500/20 text-cyan-400' : 
                            'bg-red-500/20 text-red-500'
                          }>
                            {certificado.tipo}
                          </Badge>
                          <span className={textSecondary}>•</span>
                          <span className={textSecondary}>Válido até: {certificado.validade}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCertificado(null)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Senha do Certificado</Label>
                    <Input
                      type="password"
                      placeholder="Digite a senha do certificado"
                      value={senhaCertificado}
                      onChange={(e) => setSenhaCertificado(e.target.value)}
                    />
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      A senha é criptografada e armazenada de forma segura
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Logo */}
        <TabsContent value="logo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-[#6366F1]" />
                Logo da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Zone */}
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                    ${isDraggingLogo 
                      ? 'border-[#6366F1] bg-[#6366F1]/10' 
                      : `${borderColor} hover:border-[#6366F1]/50`
                    }
                  `}
                  onDragOver={(e) => handleDragOver(e, 'logo')}
                  onDragLeave={() => handleDragLeave('logo')}
                  onDrop={(e) => handleDrop(e, 'logo')}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file)
                    }}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <div className={`w-16 h-16 rounded-2xl ${inputBg} flex items-center justify-center mb-4`}>
                      <Image className="w-8 h-8 text-[#6366F1]" />
                    </div>
                    <p className={`text-lg font-medium ${textPrimary} mb-2`}>
                      Arraste a logo aqui
                    </p>
                    <p className={textSecondary}>
                      ou clique para selecionar
                    </p>
                    <p className={`text-sm ${textSecondary} mt-2`}>
                      Requisitos: 200x60px • PNG, JPG, SVG
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h4 className={`font-medium ${textPrimary}`}>Preview</h4>
                  
                  {/* Light Background */}
                  <div className="p-6 rounded-xl bg-white border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Fundo Claro</p>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-12 object-contain" />
                    ) : (
                      <div className="h-12 flex items-center text-slate-400">
                        Nenhuma logo carregada
                      </div>
                    )}
                  </div>

                  {/* Dark Background */}
                  <div className="p-6 rounded-xl bg-[#0B0D16] border border-[#252B44]">
                    <p className="text-xs text-slate-500 mb-2">Fundo Escuro</p>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-12 object-contain" />
                    ) : (
                      <div className="h-12 flex items-center text-slate-600">
                        Nenhuma logo carregada
                      </div>
                    )}
                  </div>

                  {logoFile && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Redimensionar
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        setLogoFile(null)
                        setLogoPreview(null)
                      }}>
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6366F1]" />
                Templates de Documentos
              </CardTitle>
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                Novo Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        template.ativo ? 'bg-[#6366F1]/20' : 'bg-slate-500/20'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          template.ativo ? 'text-[#6366F1]' : 'text-slate-500'
                        }`} />
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{template.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={
                            template.ativo ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'
                          }>
                            {template.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <span className={textSecondary}>•</span>
                          <span className={`text-sm ${textSecondary}`}>{template.tipo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-6 p-4 rounded-xl border ${borderColor} bg-[#6366F1]/5`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Variáveis Disponíveis</h4>
                <p className={`text-sm ${textSecondary} mb-3`}>
                  Use estas variáveis nos templates para dados dinâmicos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['{{empresa}}', '{{cnpj}}', '{{data}}', '{{cliente}}', '{{valor}}', '{{produtos}}', '{{assinatura}}'].map((v) => (
                    <Badge key={v} variant="outline" className="font-mono text-xs">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Segurança */}
        <TabsContent value="seguranca" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#6366F1]" />
                  Políticas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Autenticação 2FA obrigatória', status: true },
                  { label: 'Sessão expira em 30 minutos', status: true },
                  { label: 'Bloqueio após 5 tentativas', status: true },
                  { label: 'Rotação de senhas (90 dias)', status: false },
                  { label: 'Logs de auditoria', status: true },
                ].map((item, index) => (
                  <div key={index} className={`p-3 rounded-xl ${inputBg} flex items-center justify-between`}>
                    <span className={textPrimary}>{item.label}</span>
                    <Badge className={item.status ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'}>
                      {item.status ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#10B981]" />
                  Backup e Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={textSecondary}>Último backup</span>
                    <Badge className="bg-green-500/20 text-green-500">Hoje 03:00</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={textSecondary}>Próximo backup</span>
                    <span className={textPrimary}>Amanhã 03:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={textSecondary}>Retenção</span>
                    <span className={textPrimary}>30 dias</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Dados (LGPD)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
