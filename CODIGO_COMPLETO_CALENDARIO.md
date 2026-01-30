# CÓDIGO COMPLETO DO CALENDÁRIO

## 1. Componente Calendar (components/ui/calendar.tsx)

```tsx
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      weekStartsOn={0}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
```

## 2. Uso no Dashboard (app/dashboard/page.tsx)

```tsx
// Imports necessários
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Estados
const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
  from: undefined,
  to: undefined,
})
const [dateRangeOpen, setDateRangeOpen] = useState(false)

// Inicializar com o mês atual
useEffect(() => {
  if (!isLoading) {
    const now = new Date()
    const monthRange = getMonthRange(now)
    setDateRange({ from: monthRange.start, to: monthRange.end })
  }
}, [isLoading])

// JSX do Filtro
<div className="flex flex-col gap-2">
  <span className="text-xs text-muted-foreground font-medium">
    Escolha o período inicial e final
  </span>
  <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-[340px] justify-start text-left font-normal h-9",
          !dateRange.from && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateRange.from ? (
          dateRange.to ? (
            <>
              {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
            </>
          ) : (
            format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
          )
        ) : (
          "Selecione o período"
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={(range) => {
          setDateRange(range || { from: undefined, to: undefined })
          if (range?.from && range?.to) {
            setDateRangeOpen(false)
          }
        }}
        numberOfMonths={2}
        initialFocus
      />
    </PopoverContent>
  </Popover>
</div>
```

## 3. CSS Adicional (app/globals.css)

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  
  /* Calendário: garantir que os nomes dos dias apareçam corretamente */
  .rdp-head_cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
  }
}
```

## 4. Função Auxiliar getMonthRange

```tsx
const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return { start, end }
}
```

## Recursos do Calendário

✅ **Seleção de Range**: Clique uma vez para início, duas para fim
✅ **Dois Meses**: Mostra 2 meses lado a lado
✅ **Nomes Corretos**: dom seg ter qua qui sex sáb (com locale ptBR)
✅ **Navegação**: Setas para mudar de mês
✅ **Auto-close**: Fecha automaticamente ao selecionar período completo
✅ **Formato PT-BR**: dd/MM/yyyy
✅ **Layout Correto**: head_row com flex w-full e head_cell com w-9 garantem alinhamento perfeito

