import type React from "react"
export function Alert({
  children,
  variant = "default",
  className,
  ...props
}: {
  children: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
  [x: string]: any
}) {
  const alertClasses = `rounded-md border px-4 py-3 ${
    variant === "destructive" ? "bg-red-100 text-red-500 border-red-200" : "bg-blue-100 text-blue-500 border-blue-200"
  } ${className || ""}`

  return (
    <div className={alertClasses} {...props}>
      {children}
    </div>
  )
}

export function Badge({
  children,
  variant = "default",
  className,
  ...props
}: {
  children: React.ReactNode
  variant?: "default" | "outline"
  className?: string
  [x: string]: any
}) {
  const badgeClasses = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
    variant === "outline"
      ? "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
      : "bg-secondary text-secondary-foreground"
  } ${className || ""}`

  return (
    <div className={badgeClasses} {...props}>
      {children}
    </div>
  )
}

