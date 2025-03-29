"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | undefined
  onSelect?: (date: Date | undefined) => void
  className?: string
  showOutsideDays?: boolean
  initialFocus?: boolean
  disabled?: boolean
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  showOutsideDays = true,
  disabled = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const singleDate = mode === "single" && selected instanceof Date ? selected : undefined
  
  // Go to next/previous month
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  
  // Handle date selection
  const handleDateClick = (day: Date) => {
    if (disabled) return
    onSelect?.(day)
  }

  // Generate month view
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Get dates to display
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })
  
  // Day names
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className={cn("w-full p-3", className)}>
      {/* Caption */}
      <div className="flex justify-center pt-1 relative items-center w-full">
        <span className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1 absolute right-1">
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar */}
      <div className="mt-4">
        {/* Headers */}
        <div className="flex w-full">
          {weekDays.map(day => (
            <div key={day} className="flex-1 text-center text-muted-foreground rounded-md text-[0.8rem]">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid of days */}
        <div className="grid grid-cols-7 mt-2 gap-1">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelectedDay = singleDate ? isSameDay(day, singleDate) : false
            const dayToday = isToday(day)

            return (
              <Button
                key={i}
                variant="ghost"
                className={cn(
                  "h-8 w-full p-0 font-normal",
                  !isCurrentMonth && !showOutsideDays && "invisible",
                  !isCurrentMonth && showOutsideDays && "text-muted-foreground opacity-50",
                  isSelectedDay && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  dayToday && !isSelectedDay && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleDateClick(day)}
                disabled={disabled || (!isCurrentMonth && !showOutsideDays)}
              >
                {format(day, "d")}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { Calendar }
