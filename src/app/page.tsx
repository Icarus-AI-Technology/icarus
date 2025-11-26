'use client'

import { Link } from 'react-router-dom'
import {
  Package, ShoppingCart, DollarSign, Users,
  TrendingUp, FileText, Truck, Settings,
  Database, Brain, Zap, Shield
} from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/layouts/Header'

export default function HomePage() {
  const modules = [
    { name: 'Vendas', icon: ShoppingCart, count: 8, href: '/vendas', color: 'blue' },
    { name: 'Compras', icon: Truck, count: 6, href: '/compras', color: 'green' },
    { name: 'Financeiro', icon: DollarSign, count: 12, href: '/financeiro', color: 'purple' },
    { name: 'Estoque', icon: Package, count: 8, href: '/estoque/produtos', color: 'yellow' },
    { name: 'Fiscal', icon: FileText, count: 6, href: '/fiscal', color: 'red' },
    { name: 'RH', icon: Users, count: 6, href: '/rh', color: 'pink' },
    { name: 'Produção', icon: Settings, count: 5, href: '/producao', color: 'orange' },
    { name: 'Analytics', icon: TrendingUp, count: 4, href: '/analytics', color: 'cyan' },
  ]

  const features = [
    { icon: Brain, title: 'IcarusBrain', description: 'IA integrada com GPT-4' },
    { icon: Zap, title: 'Performance', description: 'Vite + React Query' },
    { icon: Shield, title: 'Segurança', description: 'RLS + Supabase Auth' },
    { icon: Database, title: 'Supabase', description: 'PostgreSQL + Realtime' },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419]">
        <Header />

        {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="
                bg-gradient-to-br from-gray-900/90 to-gray-800/90
                backdrop-blur-sm
                p-6 rounded-2xl
                border border-white/10
                shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
                hover:border-blue-500/30
                transition-all duration-200
              "
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modules */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Módulos (58)</h2>
            <p className="text-gray-400 mt-1">Cobertura completa de processos empresariais</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module) => {
              const colorClasses = {
                blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                green: 'bg-green-500/10 border-green-500/20 text-green-400',
                purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                red: 'bg-red-500/10 border-red-500/20 text-red-400',
                pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
              }

              return (
                <Link
                  key={module.name}
                  to={module.href}
                  className="
                    bg-gradient-to-br from-gray-900/90 to-gray-800/90
                    backdrop-blur-sm
                    p-6 rounded-2xl
                    border border-white/10
                    shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
                    hover:border-blue-500/30
                    hover:scale-105
                    transition-all duration-200
                    cursor-pointer
                    block
                  "
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorClasses[module.color as keyof typeof colorClasses]}`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-100">{module.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100">{module.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{module.count} módulos</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="
          bg-gradient-to-br from-gray-900/90 to-gray-800/90
          backdrop-blur-sm
          p-8 rounded-2xl
          border border-white/10
          shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        ">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Módulos</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">58</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Componentes DS</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">50+</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Documentação</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">145KB</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Cobertura</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">100%</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-8 border-t border-white/10">
          <p className="text-gray-400">
            ICARUS v5.0 - ERP com IA, Design Neumórfico e Performance Otimizada
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Desenvolvido com Vite, TypeScript, Tailwind CSS e Supabase
          </p>
        </div>

      </main>
    </div>
    </ProtectedRoute>
  )
}
