import { useState } from 'react'
import { Bell, Search, Settings, User, Moon, Sun, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface IcarusTopbarProps {
  sidebarWidth?: number
}

export function IcarusTopbar({ sidebarWidth = 256 }: IcarusTopbarProps) {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-[#15192B]/90 backdrop-blur-xl z-30 transition-all duration-300"
      style={{ 
        left: `${sidebarWidth}px`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              placeholder="Buscar cirurgias, produtos, hospitais..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#1A1F35] text-white placeholder-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition-all"
              style={{ boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.02)' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-[#1A1F35] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
            style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-[#F59E0B]" strokeWidth={2} /> : <Moon className="h-5 w-5 text-[#6366F1]" strokeWidth={2} />}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-10 h-10 rounded-xl bg-[#1A1F35] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors relative"
                style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' }}
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
              className="w-80 bg-[#1A1F35] border-none rounded-xl p-2"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            >
              <DropdownMenuLabel className="text-white font-semibold px-3 py-2">Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#252B44]" />
              <div className="space-y-2 p-1">
                {[
                  { title: 'Cirurgia agendada', desc: 'Nova cirurgia de João Silva agendada para amanhã', time: '5 minutos atrás', color: '#6366F1' },
                  { title: 'Estoque baixo', desc: 'Produto STN-CARD-001 com estoque abaixo do mínimo', time: '1 hora atrás', color: '#F59E0B' },
                  { title: 'NFe emitida', desc: 'Nota fiscal #12345 emitida com sucesso', time: '3 horas atrás', color: '#10B981' }
                ].map((notif, i) => (
                  <div 
                    key={i}
                    className="p-3 rounded-xl bg-[#15192B] cursor-pointer hover:bg-[#1F2642] transition-colors"
                    style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(255,255,255,0.02)' }}
                  >
                    <div className="font-medium text-sm text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: notif.color }} />
                      {notif.title}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">{notif.desc}</div>
                    <div className="text-xs text-[#64748B] mt-1">{notif.time}</div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <button 
            className="w-10 h-10 rounded-xl bg-[#1A1F35] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
            style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' }}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1A1F35] hover:bg-[#1F2642] transition-colors"
                style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)' }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  <User className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-white">Admin User</div>
                  <div className="text-xs text-[#94A3B8]">admin@icarus.com.br</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-[#1A1F35] border-none rounded-xl"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            >
              <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#252B44]" />
              <DropdownMenuItem className="text-[#94A3B8] hover:text-white hover:bg-[#252B44] rounded-lg cursor-pointer">
                <User className="mr-2 h-4 w-4 text-[#6366F1]" strokeWidth={2} />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#94A3B8] hover:text-white hover:bg-[#252B44] rounded-lg cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-[#8B5CF6]" strokeWidth={2} />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#252B44]" />
              <DropdownMenuItem className="text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" strokeWidth={2} />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
