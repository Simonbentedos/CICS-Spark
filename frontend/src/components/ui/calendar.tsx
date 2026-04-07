"use client"

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from './Button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('spark-calendar-surface', className)}
      captionLayout="dropdown"
      navLayout="around"
      startMonth={new Date(1980, 0, 1)}
      endMonth={new Date(new Date().getFullYear() + 2, 11, 1)}
      classNames={{
        months: 'spark-calendar-months',
        month: 'spark-calendar-month',
        caption: 'spark-calendar-caption',
        caption_label: 'sr-only',
        dropdowns: 'spark-calendar-dropdowns',
        dropdown_root: 'spark-calendar-dropdown-root',
        dropdown: 'spark-calendar-dropdown',
        nav: 'spark-calendar-nav',
        button_previous: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'spark-calendar-nav-btn'),
        button_next: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'spark-calendar-nav-btn'),
        chevron: 'spark-calendar-chevron',
        month_grid: 'spark-calendar-month-grid',
        weekdays: 'spark-calendar-weekdays',
        weekday: 'spark-calendar-weekday',
        weeks: 'spark-calendar-weeks',
        week: 'spark-calendar-week',
        day: 'spark-calendar-day',
        day_button: 'spark-calendar-day-btn',
        selected: 'spark-calendar-selected',
        today: 'spark-calendar-today',
        outside: 'spark-calendar-outside',
        disabled: 'spark-calendar-disabled',
        hidden: 'spark-calendar-hidden',
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
