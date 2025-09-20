import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options
  })
  return formatter.format(new Date(date))
}

export function formatDateTime(date: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    ...options
  })
  return formatter.format(new Date(date))
}
