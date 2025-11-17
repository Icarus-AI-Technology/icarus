/**
 * Testes de Acessibilidade WCAG 2.1 AA
 * 
 * Valida conformidade com padrões de acessibilidade
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Calendar, Package } from 'lucide-react';

describe('Acessibilidade WCAG 2.1 AA', () => {
  describe('Button Component', () => {
    it('deve ter texto acessível ou aria-label', () => {
      render(<Button>Salvar</Button>);
      const button = screen.getByRole('button', { name: /salvar/i });
      expect(button).toBeInTheDocument();
    });

    it('deve ter contraste adequado em botões primários', () => {
      const { container } = render(<Button variant="default">Teste</Button>);
      const button = container.querySelector('button');
      
      if (button) {
        const styles = window.getComputedStyle(button);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        
        // Verificar se background é indigo
        expect(bgColor).toContain('rgb(99, 102, 241)');
        // Verificar se texto é branco
        expect(textColor).toContain('rgb(255, 255, 255)');
      }
    });

    it('deve ter focus visible para navegação por teclado', () => {
      const { container } = render(<Button>Teste</Button>);
      const button = container.querySelector('button');
      
      if (button) {
        const styles = window.getComputedStyle(button);
        // Verificar se tem outline ou ring no focus
        expect(button.className).toContain('focus-visible:outline-none');
        expect(button.className).toContain('focus-visible:ring');
      }
    });
  });

  describe('KPICard Component', () => {
    it('deve ter título acessível', () => {
      render(
        <KPICard
          title="Total de Itens"
          value="100"
          icon={Package}
          variant="default"
        />
      );
      
      const title = screen.getByText('Total de Itens');
      expect(title).toBeInTheDocument();
    });

    it('deve ter contraste adequado em variante primary', () => {
      const { container } = render(
        <KPICard
          title="Teste"
          value="100"
          icon={Calendar}
          variant="primary"
        />
      );
      
      const card = container.querySelector('[class*="bg-[#6366F1]"]');
      if (card) {
        const styles = window.getComputedStyle(card);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        
        // Verificar background indigo
        expect(bgColor).toContain('rgb(99, 102, 241)');
        // Verificar texto branco
        expect(textColor).toContain('rgb(255, 255, 255)');
      }
    });
  });

  describe('Input Component', () => {
    it('deve ter label associado', () => {
      render(<Input label="Nome" placeholder="Digite seu nome" />);
      
      const label = screen.getByText('Nome');
      expect(label).toBeInTheDocument();
      
      const input = screen.getByPlaceholderText('Digite seu nome');
      expect(input).toBeInTheDocument();
    });

    it('deve ter mensagem de erro acessível', () => {
      render(
        <Input
          label="Email"
          error="Email inválido"
          placeholder="email@exemplo.com"
        />
      );
      
      const error = screen.getByText('Email inválido');
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('deve ter helper text quando fornecido', () => {
      render(
        <Input
          label="Código"
          helperText="Formato: XXX-XXX"
          placeholder="123-456"
        />
      );
      
      const helper = screen.getByText('Formato: XXX-XXX');
      expect(helper).toBeInTheDocument();
    });
  });

  describe('Regra Universal: Background Indigo = Texto Branco', () => {
    it('deve aplicar texto branco em backgrounds indigo', () => {
      const { container } = render(
        <div className="bg-[#6366F1] p-4">
          <span>Texto de teste</span>
        </div>
      );
      
      const span = container.querySelector('span');
      if (span) {
        const styles = window.getComputedStyle(span);
        const textColor = styles.color;
        
        // Verificar se texto é branco (ou muito claro)
        const rgb = textColor.match(/\d+/g);
        if (rgb) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);
          
          expect(r).toBeGreaterThanOrEqual(240);
          expect(g).toBeGreaterThanOrEqual(240);
          expect(b).toBeGreaterThanOrEqual(240);
        }
      }
    });
  });

  describe('Ícones SVG', () => {
    it('deve ter aria-hidden em ícones decorativos', () => {
      const { container } = render(
        <KPICard
          title="Teste"
          value="100"
          icon={Package}
          variant="default"
        />
      );
      
      const svg = container.querySelector('svg');
      if (svg) {
        // Ícones em KPICard devem ter aria-hidden
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });
});

