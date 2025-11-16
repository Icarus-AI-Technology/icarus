import React from 'react';
import { cn } from '@/lib/utils';
import { Icon3D } from '../ui/icon-3d';

export interface SidebarModule {
  id: string;
  icon: string;
  label: string;
  href?: string;
}

export interface SidebarUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface SidebarProps {
  collapsed?: boolean;
  theme?: 'light' | 'dark';
  modules?: SidebarModule[];
  user?: SidebarUser;
  onToggle?: () => void;
  overlay?: boolean;
  className?: string;
}

/**
 * Sidebar - Main Navigation Sidebar
 *
 * The main navigation sidebar for ICARUS application.
 * Supports collapsed state, themes, module navigation, and user info.
 *
 * @example
 * // Basic sidebar
 * <Sidebar
 *   collapsed={false}
 *   modules={ICARUS_MODULES}
 *   user={currentUser}
 *   onToggle={handleToggle}
 * />
 *
 * @example
 * // Collapsed sidebar with dark theme
 * <Sidebar
 *   collapsed={true}
 *   theme="dark"
 *   modules={ICARUS_MODULES}
 * />
 */
export function Sidebar({
  collapsed = false,
  theme = 'light',
  modules = [],
  user,
  onToggle,
  overlay = false,
  className,
}: SidebarProps) {
  const themeClasses = {
    light:
      'bg-gradient-to-br from-white to-gray-50 text-gray-800 border-gray-200',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700',
  };

  return (
    <>
      {/* Overlay for mobile */}
      {overlay && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50',
          'flex flex-col',
          'transition-all duration-300 ease-in-out',
          'border-r',
          'shadow-[8px_0_16px_rgba(0,0,0,0.1)]',
          themeClasses[theme],
          collapsed ? 'w-20' : 'w-72',
          overlay && collapsed && '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Icon3D name="logo" size="lg" />
              <h1 className="text-xl font-bold">ICARUS</h1>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <Icon3D name="logo" size="md" />
            </div>
          )}
          {onToggle && !overlay && (
            <button
              onClick={onToggle}
              className={cn(
                'p-2 rounded-lg transition-all',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                collapsed && 'hidden'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon3D name="menu" size="sm" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {modules.map((module) => (
            <a
              key={module.id}
              href={module.href || `/${module.id}`}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl',
                'transition-all duration-200',
                'hover:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]',
                collapsed && 'justify-center'
              )}
            >
              <Icon3D name={module.icon} size="md" />
              {!collapsed && (
                <span className="font-medium">{module.label}</span>
              )}
            </a>
          ))}
        </nav>

        {/* Footer with user info */}
        {user && (
          <div
            className={cn(
              'p-4 border-t border-gray-200',
              collapsed && 'px-2'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                'bg-gradient-to-br from-white to-gray-50',
                'shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)]',
                collapsed && 'flex-col gap-2 p-2'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full',
                  'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
                  'font-bold',
                  collapsed ? 'w-8 h-8 text-sm' : 'w-10 h-10'
                )}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
