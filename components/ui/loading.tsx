import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de carregamento reutilizável
 * Fornece indicadores de carregamento consistentes para toda a aplicação
 */
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  className?: string;
}

/**
 * Componente de Loading que pode ser usado em diferentes contextos
 * 
 * @example
 * // Loading simples
 * <Loading />
 * 
 * @example
 * // Loading em tela cheia com texto personalizado
 * <Loading fullPage text="Carregando dados do portfólio..." />
 */
export function Loading({
  size = 'md',
  text = 'Carregando...',
  fullPage = false,
  className = ''
}: LoadingProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

export default Loading;
