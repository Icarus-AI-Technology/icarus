/**
 * ChatResponseCard - Componente para renderização de cards interativos nas respostas do ChatWidget
 * Suporta: Tabelas, KPIs, Ações, Código, Alertas e Links
 */

import React from 'react';
import { 
  ExternalLink, ChevronRight, AlertTriangle, CheckCircle, 
  Info, XCircle, TrendingUp, TrendingDown, Copy, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos de cards suportados
export type CardType = 'table' | 'kpi' | 'action' | 'code' | 'alert' | 'link' | 'list';

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

export interface ActionData {
  type: string;
  label: string;
  link?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface AlertData {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface LinkData {
  title: string;
  url: string;
  description?: string;
}

export interface ListData {
  title: string;
  items: string[];
  ordered?: boolean;
}

export interface ChatCardData {
  type: CardType;
  data: TableData | KPIData[] | ActionData[] | string | AlertData | LinkData[] | ListData;
}

interface ChatResponseCardProps {
  card: ChatCardData;
  onAction?: (action: ActionData) => void;
}

export function ChatResponseCard({ card, onAction }: ChatResponseCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Table
  if (card.type === 'table') {
    const tableData = card.data as TableData;
    return (
      <div className="mt-3 overflow-x-auto rounded-lg border border-[#252B44]">
        <table className="w-full text-xs">
          <thead className="bg-[#1A1F35]">
            <tr>
              {tableData.headers.map((header, idx) => (
                <th key={idx} className="px-3 py-2 text-left text-[#94A3B8] font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252B44]">
            {tableData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#1A1F35]/50 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 text-white">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render KPIs
  if (card.type === 'kpi') {
    const kpiData = card.data as KPIData[];
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {kpiData.map((kpi, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-lg bg-[#1A1F35]"
            style={{
              boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02)'
            }}
          >
            <p className="text-[10px] text-[#64748B] uppercase tracking-wide">{kpi.label}</p>
            <p className="text-lg font-bold text-white mt-0.5">{kpi.value}</p>
            {kpi.change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-[10px] mt-1',
                kpi.change >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {kpi.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(kpi.change)}%</span>
                {kpi.changeLabel && (
                  <span className="text-[#64748B]">{kpi.changeLabel}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Render Actions
  if (card.type === 'action') {
    const actions = card.data as ActionData[];
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onAction?.(action)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all',
              action.variant === 'primary' && 'bg-[#6366F1] text-white hover:bg-[#4F46E5]',
              action.variant === 'secondary' && 'bg-[#1A1F35] text-white hover:bg-[#252B44]',
              action.variant === 'danger' && 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
              !action.variant && 'bg-white/10 text-white hover:bg-white/20'
            )}
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </button>
        ))}
      </div>
    );
  }

  // Render Code
  if (card.type === 'code') {
    const code = card.data as string;
    return (
      <div className="mt-3 relative">
        <pre className="p-3 rounded-lg bg-[#0B0D16] text-xs text-[#94A3B8] overflow-x-auto font-mono">
          <code>{code}</code>
        </pre>
        <button
          onClick={() => handleCopy(code)}
          className="absolute top-2 right-2 p-1.5 rounded bg-[#1A1F35] hover:bg-[#252B44] transition-colors"
          title="Copiar código"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3 text-[#64748B]" />
          )}
        </button>
      </div>
    );
  }

  // Render Alert
  if (card.type === 'alert') {
    const alert = card.data as AlertData;
    const alertStyles = {
      success: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle, iconColor: 'text-green-400' },
      warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, iconColor: 'text-amber-400' },
      error: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle, iconColor: 'text-red-400' },
      info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Info, iconColor: 'text-blue-400' },
    };
    const style = alertStyles[alert.type];
    const IconComponent = style.icon;

    return (
      <div className={cn(
        'mt-3 p-3 rounded-lg border flex gap-3',
        style.bg, style.border
      )}>
        <IconComponent className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />
        <div>
          <p className="text-sm font-medium text-white">{alert.title}</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">{alert.message}</p>
        </div>
      </div>
    );
  }

  // Render Links
  if (card.type === 'link') {
    const links = card.data as LinkData[];
    return (
      <div className="mt-3 space-y-2">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-2 rounded-lg bg-[#1A1F35] hover:bg-[#252B44] transition-colors group"
          >
            <ExternalLink className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white group-hover:text-[#6366F1] transition-colors truncate">
                {link.title}
              </p>
              {link.description && (
                <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{link.description}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  }

  // Render List
  if (card.type === 'list') {
    const list = card.data as ListData;
    const ListTag = list.ordered ? 'ol' : 'ul';
    return (
      <div className="mt-3 p-3 rounded-lg bg-[#1A1F35]">
        {list.title && (
          <p className="text-xs font-medium text-[#94A3B8] mb-2">{list.title}</p>
        )}
        <ListTag className={cn(
          'text-sm text-white space-y-1',
          list.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'
        )}>
          {list.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ListTag>
      </div>
    );
  }

  return null;
}

/**
 * Função helper para parsear markdown e extrair cards estruturados
 */
export function parseMessageContent(content: string): { text: string; cards: ChatCardData[] } {
  const cards: ChatCardData[] = [];
  let text = content;

  // Detectar tabelas markdown (| header | header |)
  const tableRegex = /\|(.+\|)+\n\|[-:\s|]+\|\n(\|.+\|\n?)+/g;
  const tableMatches = text.match(tableRegex);
  if (tableMatches) {
    tableMatches.forEach(match => {
      const lines = match.trim().split('\n');
      const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim());
      const rows = lines.slice(2).map(row => 
        row.split('|').filter(c => c.trim()).map(c => c.trim())
      );
      cards.push({
        type: 'table',
        data: { headers, rows }
      });
      text = text.replace(match, '');
    });
  }

  // Detectar blocos de código
  const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
  const codeMatches = text.matchAll(codeRegex);
  for (const match of codeMatches) {
    cards.push({
      type: 'code',
      data: match[1].trim()
    });
    text = text.replace(match[0], '');
  }

  return { text: text.trim(), cards };
}

export default ChatResponseCard;

