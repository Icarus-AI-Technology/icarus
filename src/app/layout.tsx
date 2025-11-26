import React from "react";

/**
 * Stub de layout mantido apenas para compatibilidade com branches que ainda
 * carregam a pasta `src/app` do Next.js. O build oficial roda em Vite/React,
 * então este componente funciona como um pass-through simples e não depende de
 * APIs do Next.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
