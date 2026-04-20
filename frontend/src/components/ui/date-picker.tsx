"use client"

import { format, isValid, parse } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { ChangeEvent, ChangeEventHandler } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Calendar } from './calendar'
import { Input } from './Input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const DATE_PATTERN = 'MM/dd/yyyy'

interface DatePickerProps {
  value?: string
  onChange: (nextValue: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  popoverClassName?: string
}

type CalendarDropdownOption = {
  value?: string | number
  label: string
  disabled?: boolean
}

type CalendarDropdownProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options?: CalendarDropdownOption[]
}

function autoFormatTypedDate(rawValue: string) {
  const digitsOnly = rawValue.replaceAll(/\D/g, '').slice(0, 8)

  if (digitsOnly.length <= 2) {
    return digitsOnly
  }

  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
}

function dispatchCalendarSelectChange(nextValue: string | number, event: ChangeEventHandler<HTMLSelectElement>) {
  const selectEvent = {
    target: {
      value: String(nextValue),
    },
  } as ChangeEvent<HTMLSelectElement>

  event(selectEvent)
}

function CalendarMonthCaption({ children }: Readonly<{ children?: React.ReactNode }>) {
  return <div>{children}</div>
}

function CalendarDropdownNav({ children }: Readonly<{ children?: React.ReactNode }>) {
  return <div className="spark-date-picker-dropdown-nav">{children}</div>
}

function CalendarDropdown({ value, onChange, options }: Readonly<CalendarDropdownProps>) {
  const resolvedValue = Array.isArray(value) ? value[0] : value

  return (
    <Select
      value={resolvedValue ? String(resolvedValue) : undefined}
      onValueChange={(nextValue) => {
        if (onChange) {
          dispatchCalendarSelectChange(nextValue, onChange)
        }
      }}
    >
      <SelectTrigger className="spark-date-picker-dropdown-trigger">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem
            key={String(option.value ?? option.label)}
            value={String(option.value ?? option.label)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function parseDisplayDate(value: string | undefined) {
  if (!value?.length || value.length !== 10) {
    return undefined
  }

  const parsedDate = parse(value, DATE_PATTERN, new Date())

  if (!isValid(parsedDate)) {
    return undefined
  }

  return format(parsedDate, DATE_PATTERN) === value ? parsedDate : undefined
}

export function DatePicker({
  value = '',
  onChange,
  placeholder = 'MM/DD/YYYY',
  className,
  inputClassName,
  popoverClassName,
}: Readonly<DatePickerProps>) {
  const selectedDate = useMemo(() => parseDisplayDate(value), [value])
  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const [month, setMonth] = useState<Date>(selectedDate ?? new Date())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setDate(selectedDate)

    if (selectedDate) {
      setMonth(selectedDate)
    }
  }, [selectedDate])

  function handleInputChange(nextValue: string) {
    onChange(autoFormatTypedDate(nextValue))
  }

  function handleDateSelect(date: Date | undefined) {
    setDate(date)
    onChange(date ? format(date, DATE_PATTERN) : '')
    setIsOpen(false)
  }

  function handleMonthChange(newMonth: Date) {
    setMonth(newMonth)
    // Auto-set the date to the 1st of the navigated month/year so the input reflects the selection
    const first = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)
    setDate(first)
    onChange(format(first, DATE_PATTERN))
  }

  return (
    <div className={cn('relative w-[154px]', className)}>
      <Input
        value={value}
        onChange={(event) => handleInputChange(event.target.value)}
        placeholder={placeholder}
        className={cn('spark-date-input', inputClassName)}
      />

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="spark-date-trigger"
            aria-label="Open calendar"
          >
            <CalendarIcon className="spark-date-picker-icon" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn('spark-calendar-popover w-auto p-0', popoverClassName)}
          align="start"
          sideOffset={6}
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            hideNavigation
            month={month}
            onMonthChange={handleMonthChange}
            selected={date}
            onSelect={handleDateSelect}
            components={{
              MonthCaption: CalendarMonthCaption,
              DropdownNav: CalendarDropdownNav,
              Dropdown: CalendarDropdown,
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
