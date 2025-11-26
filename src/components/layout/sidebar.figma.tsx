import figma from '@figma/code-connect';
import { Sidebar } from './Sidebar';

/**
 * Figma Code Connect for Sidebar
 *
 * Links the Figma design to the actual React component implementation.
 */
figma.connect(
  Sidebar,
  'https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=1004-2004',
  {
    example: (props) => (
      <Sidebar
        collapsed={props.collapsed}
        theme={props.theme}
        modules={props.modules}
        user={props.user}
        onToggle={props.onToggle}
        overlay={props.overlay}
      />
    ),
    props: {
      collapsed: figma.boolean('Collapsed'),
      theme: figma.enum('Theme', {
        Light: 'light',
        Dark: 'dark',
      }),
      modules: figma.children('Modules'),
      user: figma.instance('User'),
      overlay: figma.boolean('Overlay'),
      onToggle: figma.instance('Toggle'),
    },
    imports: ["import { Sidebar } from '@/components/layout/sidebar'"],
    instructions: `
ICARUS Sidebar - Padrões de Layout

═══════════════════════════════════════════════

1️⃣ ESTRUTURA OBRIGATÓRIA

✅ SEMPRE:
<Sidebar
  collapsed={sidebarCollapsed}
  modules={ICARUS_MODULES}
  user={currentUser}
  onToggle={handleToggle}
/>

MÓDULOS ICARUS (padrão):
const ICARUS_MODULES = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard', href: '/dashboard' },
  { id: 'financeiro', icon: 'wallet', label: 'Financeiro', href: '/financeiro' },
  { id: 'estoque', icon: 'package', label: 'Estoque', href: '/estoque' },
  { id: 'vendas', icon: 'shopping-cart', label: 'Vendas', href: '/vendas' },
  { id: 'crm', icon: 'users', label: 'CRM', href: '/crm' },
  { id: 'producao', icon: 'tool', label: 'Produção', href: '/producao' },
  { id: 'relatorios', icon: 'chart', label: 'Relatórios', href: '/relatorios' },
  { id: 'configuracoes', icon: 'settings', label: 'Configurações', href: '/configuracoes' },
];

─────────────────────────────────────────────────

2️⃣ PERSISTÊNCIA DE ESTADO

✅ USAR ZUSTAND (padrão ICARUS):

// src/stores/sidebar.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: 'icarus-sidebar',
    }
  )
);

// Usar no componente:
import { useSidebarStore } from '@/stores/sidebar';

function Layout() {
  const { collapsed, toggle } = useSidebarStore();

  return (
    <Sidebar
      collapsed={collapsed}
      onToggle={toggle}
      modules={ICARUS_MODULES}
    />
  );
}

─────────────────────────────────────────────────

3️⃣ ÍCONES 3D

✅ SEMPRE react-3d-icons em módulos:

// Ícones disponíveis:
- 'home' → Dashboard
- 'wallet' → Financeiro
- 'package' → Estoque
- 'shopping-cart' → Vendas
- 'users' → CRM
- 'tool' → Produção
- 'chart' → Relatórios
- 'settings' → Configurações

// Renderização automática:
<Sidebar modules={modules} />
// O componente já renderiza Icon3D automaticamente

─────────────────────────────────────────────────

4️⃣ RESPONSIVO

BREAKPOINTS ICARUS:
- Mobile (<768px): Sempre collapsed, overlay
- Tablet (768-1024px): Collapsed por padrão
- Desktop (>1024px): Expanded por padrão

✅ IMPLEMENTAÇÃO:

import { useState, useEffect } from 'react';
import { useSidebarStore } from '@/stores/sidebar';

function DashboardLayout({ children }) {
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force collapsed on mobile
  useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={isMobile ? true : collapsed}
        onToggle={toggle}
        modules={ICARUS_MODULES}
        overlay={isMobile}
      />

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

─────────────────────────────────────────────────

5️⃣ NAVEGAÇÃO ATIVA

✅ DESTACAR ROTA ATUAL:

import { useLocation } from 'react-router-dom';

const { pathname } = useLocation();

const ICARUS_MODULES = [
  { id: 'financeiro', icon: 'wallet', label: 'Financeiro', href: '/financeiro' },
  // ... outros módulos
];

// O Sidebar já verifica pathname.startsWith(href) automaticamente
// Mas você pode customizar:

{modules.map(module => (
  <a
    key={module.id}
    href={module.href}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
      pathname.startsWith(module.href)
        ? 'bg-blue-50 text-blue-600 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)]'
        : 'hover:shadow-[4px_4px_8px_rgba(0,0,0,0.1)]'
    )}
  >
    <Icon3D name={module.icon} />
    {!collapsed && <span>{module.label}</span>}
  </a>
))}

─────────────────────────────────────────────────

6️⃣ USUÁRIO

✅ SEMPRE MOSTRAR USUÁRIO NO FOOTER:

import { useAuth } from '@/hooks/useAuth';

function Layout() {
  const { user } = useAuth();

  return (
    <Sidebar
      collapsed={collapsed}
      modules={ICARUS_MODULES}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }}
    />
  );
}

─────────────────────────────────────────────────

7️⃣ THEME

✅ LIGHT (Padrão):
- Fundo branco/cinza claro
- Texto escuro
- Sombras neumórficas claras

✅ DARK:
- Fundo escuro
- Texto claro
- Sombras adaptadas

IMPLEMENTAÇÃO:
<Sidebar
  theme={isDarkMode ? 'dark' : 'light'}
  modules={ICARUS_MODULES}
/>

─────────────────────────────────────────────────

8️⃣ EXEMPLO COMPLETO

import { Sidebar } from '@/components/layout/sidebar';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

const ICARUS_MODULES = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard', href: '/dashboard' },
  { id: 'financeiro', icon: 'wallet', label: 'Financeiro', href: '/financeiro' },
  { id: 'estoque', icon: 'package', label: 'Estoque', href: '/estoque' },
  { id: 'vendas', icon: 'shopping-cart', label: 'Vendas', href: '/vendas' },
  { id: 'crm', icon: 'users', label: 'CRM', href: '/crm' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force collapsed on mobile
  useEffect(() => {
    if (isMobile && !collapsed) setCollapsed(true);
  }, [isMobile]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={isMobile ? true : collapsed}
        onToggle={toggle}
        modules={ICARUS_MODULES}
        user={{
          name: user?.name || 'Usuário',
          email: user?.email || 'usuario@icarus.com',
          avatar: user?.avatar
        }}
        overlay={isMobile}
        theme="light"
      />

      <main
        className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          collapsed ? 'lg:ml-20' : 'lg:ml-72'
        )}
      >
        {children}
      </main>
    </div>
  );
}

─────────────────────────────────────────────────

9️⃣ PERMISSÕES

✅ FILTRAR MÓDULOS POR PERMISSÃO:

const ICARUS_MODULES = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard', permission: 'view_dashboard' },
  { id: 'financeiro', icon: 'wallet', label: 'Financeiro', permission: 'view_finance' },
  { id: 'admin', icon: 'settings', label: 'Admin', permission: 'admin' },
];

function Layout() {
  const { user } = useAuth();

  const allowedModules = ICARUS_MODULES.filter(module =>
    !module.permission || user.permissions.includes(module.permission)
  );

  return (
    <Sidebar
      modules={allowedModules}
      user={user}
    />
  );
}

─────────────────────────────────────────────────

🔟 SUBMÓDULOS

✅ ESTRUTURA HIERÁRQUICA:

const ICARUS_MODULES = [
  {
    id: 'financeiro',
    icon: 'wallet',
    label: 'Financeiro',
    href: '/financeiro',
    children: [
      { id: 'contas-pagar', label: 'Contas a Pagar', href: '/financeiro/contas-pagar' },
      { id: 'contas-receber', label: 'Contas a Receber', href: '/financeiro/contas-receber' },
      { id: 'fluxo-caixa', label: 'Fluxo de Caixa', href: '/financeiro/fluxo-caixa' },
    ]
  },
];

// Renderizar submódulos:
{modules.map(module => (
  <div key={module.id}>
    <NavItem module={module} />
    {module.children && !collapsed && (
      <div className="ml-6 mt-2 space-y-1">
        {module.children.map(child => (
          <NavItem key={child.id} module={child} isChild />
        ))}
      </div>
    )}
  </div>
))}

─────────────────────────────────────────────────

1️⃣1️⃣ BADGES/NOTIFICAÇÕES

✅ ADICIONAR BADGES:

const ICARUS_MODULES = [
  {
    id: 'vendas',
    icon: 'shopping-cart',
    label: 'Vendas',
    badge: 5, // 5 novas vendas
  },
  {
    id: 'mensagens',
    icon: 'mail',
    label: 'Mensagens',
    badge: 12,
  },
];

// Renderizar badge:
<a className="relative">
  <Icon3D name={module.icon} />
  {!collapsed && <span>{module.label}</span>}
  {module.badge > 0 && (
    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {module.badge > 9 ? '9+' : module.badge}
    </span>
  )}
</a>

─────────────────────────────────────────────────

1️⃣2️⃣ CHECKLIST FINAL

Antes de usar Sidebar, verifique:
☐ useSidebarStore configurado
☐ ICARUS_MODULES definido
☐ user autenticado
☐ Responsivo (mobile/tablet/desktop)
☐ Overlay em mobile
☐ Ícones 3D nos módulos
☐ onToggle funcionando
☐ Navegação ativa destacada
☐ Permissões filtradas
☐ Theme apropriado

═══════════════════════════════════════════════

🎯 SIDEBAR BEM CONFIGURADO = NAVEGAÇÃO FLUÍDA!
    `,
  }
);
