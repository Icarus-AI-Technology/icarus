import figma from '@figma/code-connect';
import { NeuInput } from './neu-input';

/**
 * Figma Code Connect for NeuInput
 *
 * Links the Figma design to the actual React component implementation.
 */
figma.connect(
  NeuInput,
  'https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=1003-2003',
  {
    example: (props) => (
      <NeuInput
        type={props.type}
        placeholder={props.placeholder}
        label={props.label}
        error={props.error}
        helperText={props.helperText}
        disabled={props.disabled}
      />
    ),
    props: {
      type: figma.enum('Type', {
        Text: 'text',
        Email: 'email',
        Password: 'password',
        Number: 'number',
        Tel: 'tel',
        Date: 'date',
      }),
      placeholder: figma.string('Placeholder'),
      label: figma.string('Label'),
      error: figma.string('Error'),
      helperText: figma.string('HelperText'),
      disabled: figma.boolean('Disabled'),
    },
    imports: ["import { NeuInput } from '@/components/ui/neu-input'"],
    instructions: `
ICARUS NeuInput - Padrões de Formulário

═══════════════════════════════════════════════

1️⃣ ESTRUTURA BÁSICA

✅ SEMPRE INCLUIR LABEL:
<NeuInput
  label="Nome do Produto"
  placeholder="Ex: Prótese de Joelho"
  type="text"
/>

❌ NUNCA:
- Input sem label (exceto busca)
- Placeholder como label
- Label genérico ("Digite aqui")

─────────────────────────────────────────────────

2️⃣ TIPOS DE INPUT

✅ TEXT (Padrão):
<NeuInput
  label="Nome Completo"
  type="text"
  placeholder="João da Silva"
/>

✅ EMAIL:
<NeuInput
  label="Email"
  type="email"
  placeholder="seu@email.com"
  helperText="Usaremos para recuperação de senha"
/>

✅ PASSWORD:
<NeuInput
  label="Senha"
  type="password"
  placeholder="Mínimo 8 caracteres"
  helperText="Use letras, números e símbolos"
/>

✅ NUMBER:
<NeuInput
  label="Quantidade"
  type="number"
  placeholder="0"
  min={0}
  step={1}
/>

✅ TEL:
<NeuInput
  label="Telefone"
  type="tel"
  placeholder="(11) 98765-4321"
/>

✅ DATE:
<NeuInput
  label="Data de Nascimento"
  type="date"
/>

─────────────────────────────────────────────────

3️⃣ VALIDAÇÃO

✅ COM REACT HOOK FORM:
import { useForm } from 'react-hook-form';

function Form() {
  const { register, formState: { errors } } = useForm();

  return (
    <NeuInput
      label="Email"
      type="email"
      error={errors.email?.message}
      {...register('email', {
        required: 'Email é obrigatório',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
          message: 'Email inválido'
        }
      })}
    />
  );
}

─────────────────────────────────────────────────

✅ VALIDAÇÃO MANUAL:
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const validateEmail = (value: string) => {
  if (!value) return 'Email é obrigatório';
  if (!value.includes('@')) return 'Email inválido';
  return '';
};

<NeuInput
  label="Email"
  type="email"
  value={email}
  error={error}
  onChange={(e) => {
    setEmail(e.target.value);
    setError(validateEmail(e.target.value));
  }}
/>

─────────────────────────────────────────────────

4️⃣ HELPER TEXT

✅ USAR PARA:
- Instruções de formato
- Dicas de preenchimento
- Informações contextuais
- Requisitos de validação

EXEMPLOS:
<NeuInput
  label="CPF"
  placeholder="000.000.000-00"
  helperText="Apenas números"
/>

<NeuInput
  label="Senha"
  type="password"
  helperText="Mínimo 8 caracteres, incluindo letras e números"
/>

<NeuInput
  label="Código do Produto"
  placeholder="PRO-001"
  helperText="Formato: PRO-XXX onde XXX é um número"
/>

─────────────────────────────────────────────────

5️⃣ ESTADOS DE ERRO

✅ MENSAGENS ESPECÍFICAS:
// ❌ Genérico
error="Campo inválido"

// ✅ Específico
error="Email deve conter @"
error="Senha muito curta (mínimo 8 caracteres)"
error="CPF inválido"

✅ COMPORTAMENTO:
- Mostrar erro após blur ou submit
- Limpar erro quando começar a digitar
- Cor vermelha no border
- Ícone de erro (opcional)

EXEMPLO:
const [touched, setTouched] = useState(false);

<NeuInput
  label="Email"
  type="email"
  error={touched && !isValid ? 'Email inválido' : ''}
  onBlur={() => setTouched(true)}
/>

─────────────────────────────────────────────────

6️⃣ DISABLED STATE

✅ QUANDO USAR:
- Durante submissão do form
- Campos não editáveis
- Dependências não satisfeitas

EXEMPLO:
<NeuInput
  label="Email"
  type="email"
  disabled={isSubmitting}
/>

<NeuInput
  label="Endereço de Cobrança"
  disabled={!useDifferentBillingAddress}
  helperText={
    !useDifferentBillingAddress
      ? 'Marque a opção acima para editar'
      : undefined
  }
/>

─────────────────────────────────────────────────

7️⃣ FORMULÁRIOS COMPLETOS

✅ PADRÃO ICARUS:
import { useForm } from 'react-hook-form';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard } from '@/components/ui/neu-card';

function ProdutoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    await saveProduto(data);
  };

  return (
    <NeuCard variant="soft" padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <NeuInput
          label="Nome do Produto"
          placeholder="Ex: Prótese de Joelho"
          error={errors.nome?.message}
          {...register('nome', { required: 'Nome é obrigatório' })}
        />

        <NeuInput
          label="Código"
          placeholder="PRO-001"
          helperText="Formato: PRO-XXX"
          error={errors.codigo?.message}
          {...register('codigo', {
            required: 'Código é obrigatório',
            pattern: {
              value: /^PRO-\\d{3}$/,
              message: 'Formato inválido'
            }
          })}
        />

        <NeuInput
          label="Preço"
          type="number"
          placeholder="0.00"
          error={errors.preco?.message}
          {...register('preco', {
            required: 'Preço é obrigatório',
            min: { value: 0.01, message: 'Preço deve ser maior que zero' }
          })}
        />

        <div className="flex gap-3 justify-end pt-4">
          <NeuButton variant="secondary" type="button">
            Cancelar
          </NeuButton>

          <NeuButton
            variant="soft"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Salvar
          </NeuButton>
        </div>
      </form>
    </NeuCard>
  );
}

─────────────────────────────────────────────────

8️⃣ ACESSIBILIDADE

✅ OBRIGATÓRIO:
- id único para cada input
- htmlFor no label
- aria-invalid quando houver erro
- aria-describedby para erro/helper

EXEMPLO:
<div>
  <label htmlFor="email-input" className="block mb-2">
    Email
  </label>
  <input
    id="email-input"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : "email-helper"}
  />
  {error && (
    <p id="email-error" role="alert">
      {error}
    </p>
  )}
  {helperText && !error && (
    <p id="email-helper">{helperText}</p>
  )}
</div>

─────────────────────────────────────────────────

9️⃣ MÁSCARAS

✅ USAR BIBLIOTECAS:
import { IMaskInput } from 'react-imask';

// CPF
<NeuInput
  label="CPF"
  as={IMaskInput}
  mask="000.000.000-00"
/>

// Telefone
<NeuInput
  label="Telefone"
  as={IMaskInput}
  mask="(00) 00000-0000"
/>

// Moeda
<NeuInput
  label="Valor"
  as={IMaskInput}
  mask={Number}
  scale={2}
  prefix="R$ "
/>

─────────────────────────────────────────────────

🔟 CHECKLIST FINAL

Antes de usar NeuInput, verifique:
☐ Label descritivo presente
☐ Type apropriado (email, tel, etc)
☐ Placeholder útil (não como label)
☐ Validação implementada
☐ Mensagens de erro específicas
☐ HelperText quando necessário
☐ Disabled durante submit
☐ Acessibilidade (id, aria-*)
☐ Máscara se aplicável

═══════════════════════════════════════════════

🎯 FORMS BEM FEITOS = UX EXCELENTE!
    `,
  }
);
