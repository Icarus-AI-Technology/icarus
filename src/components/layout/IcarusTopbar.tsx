import { Bell, Search, Settings, User, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useSidebar } from '@/hooks/useSidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export function IcarusTopbar() {
  const { theme, toggleTheme, isDark } = useTheme()
  const { sidebarWidth } = useSidebar()

  return (
    <header
      className={`fixed top-0 right-0 h-16 backdrop-blur-xl z-30 transition-all duration-300 ${
        isDark ? 'bg-[#15192B]/90' : 'bg-white/90'
      }`}
      style={{ 
        left: `${sidebarWidth}px`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} />
            <input
              placeholder="Buscar cirurgias, produtos, hospitais..."
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition-all ${
                isDark 
                  ? 'bg-[#1A1F35] text-white placeholder-[#64748B]' 
                  : 'bg-slate-100 text-slate-900 placeholder-slate-400'
              }`}
              style={{ 
                boxShadow: isDark 
                  ? 'inset 3px 3px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.02)' 
                  : 'inset 2px 2px 4px rgba(0,0,0,0.05), inset -2px -2px 4px rgba(255,255,255,0.8)'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDark 
                ? 'bg-[#1A1F35] text-[#94A3B8] hover:text-white' 
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            style={{ 
              boxShadow: isDark 
                ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' 
                : '3px 3px 6px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.9)'
            }}
            aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
          >
            {isDark ? (
              <Sun className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Moon className="h-5 w-5" strokeWidth={2} />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${
                  isDark 
                    ? 'bg-[#1A1F35] text-[#94A3B8] hover:text-white' 
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                style={{ 
                  boxShadow: isDark 
                    ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' 
                    : '3px 3px 6px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.9)'
                }}
              >
                <Bell className="h-5 w-5" strokeWidth={2} />
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                >
                  3
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={`w-80 border-none rounded-xl p-2 ${isDark ? 'bg-[#1A1F35]' : 'bg-white'}`}
              style={{ boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)' }}
            >
              <DropdownMenuLabel className={`font-semibold px-3 py-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={isDark ? 'bg-[#252B44]' : 'bg-slate-200'} />
              <div className="space-y-2 p-1">
                {[
                  { title: 'Cirurgia agendada', desc: 'Nova cirurgia de João Silva agendada para amanhã', time: '5 minutos atrás', color: '#6366F1' },
                  { title: 'Estoque baixo', desc: 'Produto STN-CARD-001 com estoque abaixo do mínimo', time: '1 hora atrás', color: '#F59E0B' },
                  { title: 'NFe emitida', desc: 'Nota fiscal #12345 emitida com sucesso', time: '3 horas atrás', color: '#10B981' }
                ].map((notif, i) => (
                  <div 
                    key={i}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      isDark 
                        ? 'bg-[#15192B] hover:bg-[#1F2642]' 
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                    style={{ 
                      boxShadow: isDark 
                        ? 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(255,255,255,0.02)' 
                        : 'inset 1px 1px 3px rgba(0,0,0,0.05), inset -1px -1px 3px rgba(255,255,255,0.8)'
                    }}
                  >
                    <div className={`font-medium text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: notif.color }} />
                      {notif.title}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>{notif.desc}</div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>{notif.time}</div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <button 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDark 
                ? 'bg-[#1A1F35] text-[#94A3B8] hover:text-white' 
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            style={{ 
              boxShadow: isDark 
                ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' 
                : '3px 3px 6px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.9)'
            }}
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-[#1A1F35] hover:bg-[#1F2642]' 
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
                style={{ 
                  boxShadow: isDark 
                    ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' 
                    : '3px 3px 6px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.9)'
                }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  <User className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div className="text-left hidden md:block">
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin User</div>
                  <div className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>admin@icarus.com.br</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={`w-56 border-none rounded-xl ${isDark ? 'bg-[#1A1F35]' : 'bg-white'}`}
              style={{ boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)' }}
            >
              <DropdownMenuLabel className={isDark ? 'text-white' : 'text-slate-900'}>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className={isDark ? 'bg-[#252B44]' : 'bg-slate-200'} />
              <DropdownMenuItem className={`rounded-lg cursor-pointer ${
                isDark 
                  ? 'text-[#94A3B8] hover:text-white hover:bg-[#252B44]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}>
                <User className="mr-2 h-4 w-4 text-[#6366F1]" strokeWidth={2} />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className={`rounded-lg cursor-pointer ${
                isDark 
                  ? 'text-[#94A3B8] hover:text-white hover:bg-[#252B44]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}>
                <Settings className="mr-2 h-4 w-4 text-[#8B5CF6]" strokeWidth={2} />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? 'bg-[#252B44]' : 'bg-slate-200'} />
              <DropdownMenuItem className="text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" strokeWidth={2} />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão Logout Rápido - SVG Vermelho com Neumorphism */}
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: isDark 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #EF4444',
              boxShadow: isDark
                ? '4px 4px 10px rgba(0,0,0,0.4), -3px -3px 8px rgba(255,255,255,0.02), 0 0 15px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.1)'
                : '3px 3px 8px rgba(0,0,0,0.1), -2px -2px 6px rgba(255,255,255,0.9), 0 0 12px rgba(239, 68, 68, 0.15)'
            }}
            aria-label="Sair do sistema"
            title="Sair"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Seta para direita */}
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
