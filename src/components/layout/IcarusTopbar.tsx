import { useState } from 'react'
import { Bell, Search, Settings, User, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-card border-b border-border z-30 transition-all duration-300"
      style={{ left: `${sidebarWidth}px` }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cirurgias, produtos, hospitais..."
              className="pl-9 w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="p-3 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent">
                  <div className="font-medium text-sm">Cirurgia agendada</div>
                  <div className="text-xs text-muted-foreground">
                    Nova cirurgia de João Silva agendada para amanhã
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    5 minutos atrás
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent">
                  <div className="font-medium text-sm">Estoque baixo</div>
                  <div className="text-xs text-muted-foreground">
                    Produto STN-CARD-001 com estoque abaixo do mínimo
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    1 hora atrás
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent">
                  <div className="font-medium text-sm">NFe emitida</div>
                  <div className="text-xs text-muted-foreground">
                    Nota fiscal #12345 emitida com sucesso
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    3 horas atrás
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">
                    admin@medopme.com.br
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
