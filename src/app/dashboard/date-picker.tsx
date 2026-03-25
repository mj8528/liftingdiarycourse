"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export function DatePicker({ selected }: { selected: Date }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    setOpen(false);
    const iso = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex w-[220px] items-center justify-start gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 hover:bg-zinc-800">
        <CalendarIcon className="h-4 w-4 text-zinc-400" />
        {formatDate(selected)}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700 shadow-2xl" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          className="bg-zinc-900"
          classNames={{
            month_caption: "flex h-9 w-full items-center justify-center px-9",
            caption_label: "text-sm font-semibold text-zinc-50",
            nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            button_previous: "inline-flex items-center justify-center size-9 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 transition-colors",
            button_next: "inline-flex items-center justify-center size-9 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 transition-colors",
            weekday: "flex-1 rounded-md text-[0.75rem] font-medium text-zinc-500 select-none text-center py-1",
            day: "group/day relative aspect-square h-full w-full rounded-md p-0 text-center select-none",
            today: "rounded-md bg-zinc-700 text-zinc-50",
            outside: "text-zinc-600 opacity-50",
            disabled: "text-zinc-600 opacity-30",
          }}
          components={{
            DayButton: ({ modifiers, className, ...props }) => {
              const isSelected = modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle;
              return (
                <Button
                  {...props}
                  variant="ghost"
                  className={cn(
                    "relative flex aspect-square w-full min-w-9 items-center justify-center rounded-md text-sm font-normal transition-colors",
                    isSelected
                      ? "bg-white text-zinc-900 font-semibold hover:bg-zinc-100"
                      : modifiers.today
                      ? "bg-zinc-700 text-zinc-50 hover:bg-zinc-600"
                      : modifiers.outside
                      ? "text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400"
                      : modifiers.disabled
                      ? "text-zinc-700 cursor-not-allowed"
                      : "text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50",
                    className,
                  )}
                />
              );
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
