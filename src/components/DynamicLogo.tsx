import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DynamicLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'sidebar' | 'login';
  showText?: boolean;
}

const DynamicLogo: React.FC<DynamicLogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  showText = false 
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 22,
    md: 28,
    lg: 40,
  };

  const containerClasses = {
    default: 'bg-primary rounded-xl',
    sidebar: 'bg-sidebar-primary rounded-xl shadow-lg',
    login: 'bg-primary rounded-3xl shadow-2xl',
  };

  const iconClasses = {
    default: 'text-primary-foreground',
    sidebar: 'text-sidebar-primary-foreground',
    login: 'text-primary-foreground',
  };

  // If there's a custom logo, use it
  if (theme.logoUrl) {
    return (
      <div className="flex items-center gap-3">
        <img 
          src={theme.logoUrl} 
          alt={theme.organizationName}
          className={`${sizeClasses[size]} object-contain rounded-xl`}
        />
        {showText && (
          <div className="hidden md:block">
            <p className="text-sm font-bold text-foreground">{theme.organizationName}</p>
            <p className="text-[10px] text-muted-foreground">{theme.organizationSubtitle}</p>
          </div>
        )}
      </div>
    );
  }

  // Default shield icon
  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} ${containerClasses[variant]} flex items-center justify-center`}>
        <ShieldCheck size={iconSizes[size]} className={iconClasses[variant]} />
      </div>
      {showText && (
        <div className="hidden md:block">
          <p className="text-sm font-bold text-foreground">{theme.organizationName}</p>
          <p className="text-[10px] text-muted-foreground">{theme.organizationSubtitle}</p>
        </div>
      )}
    </div>
  );
};

export default DynamicLogo;
