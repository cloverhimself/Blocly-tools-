import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function Button({ variant = 'primary', icon, isLoading, children, className = '', ...props }: ButtonProps) {
  const baseClasses = "flex items-center justify-center gap-2 rounded-sm px-4 py-2 font-bold font-sans text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#FFD400] text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-[#FFD400]",
    secondary: "bg-white text-[#111111] border border-[#111111] hover:bg-[#FAFAFA]",
    danger: "bg-red-500 text-white border border-red-600 hover:bg-red-600",
    ghost: "bg-transparent text-[#111111] border-none hover:text-[#FFD400]"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
}
