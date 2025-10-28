import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondary-outline' | 'ghost'
  children: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({ 
  variant = 'primary', 
  children, 
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:translate-y-[1px] disabled:translate-y-0 inline-flex items-center justify-center gap-2'
  
  const variantStyles = {
    primary: 'bg-lapis-lazuli hover:bg-lapis-lazuli/80 text-white disabled:bg-lapis-lazuli/50 disabled:cursor-not-allowed disabled:opacity-50',
    secondary: 'bg-viridian hover:bg-viridian/80 text-white disabled:bg-viridian/50 disabled:cursor-not-allowed disabled:opacity-50',
    'secondary-outline': 'bg-viridian/5 hover:bg-viridian/10 active:bg-viridian/20 border-2 border-viridian text-gray-300 disabled:border-viridian/50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50',
    ghost: 'bg-gunmetal hover:bg-hover-surface active:bg-active-surface border-2 border-white/10 text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50'
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}

