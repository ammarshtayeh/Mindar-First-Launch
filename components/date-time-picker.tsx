
"use client"

import React, { useState } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { format } from "date-fns"
import { arEG } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = useState("12:00")

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve time if exists
      const [hours, minutes] = selectedTime.split(':').map(Number)
      selectedDate.setHours(hours)
      selectedDate.setMinutes(minutes)
    }
    setDate(selectedDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setSelectedTime(time)
    
    if (date) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      setDate(newDate)
    }
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-right font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: arEG }) : <span>اختر التاريخ</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Clock className="w-4 h-4" />
        </div>
        <input 
            type="time" 
            className="h-10 rounded-lg border border-slate-200 px-3 pl-9 bg-transparent text-sm"
            value={selectedTime}
            onChange={handleTimeChange}
        />
      </div>
    </div>
  )
}
