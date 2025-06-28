
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
  
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const frontendBaseUrl = 
  process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_FRONTEND_DEV_URL
  : process.env.NEXT_PUBLIC_FRONTEND_PROD_URL

export function getImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
}

export function formatTime(time: string | null) {
  if (!time) return 'N/A';

  if(time.includes('T')) {
    const date = new Date(time);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }) + ' | ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
});
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
  }).format(amount);
};

export function getBookingStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function getRoleColor(role: string) {
  switch (role) {
    case 'manager':
      return 'bg-purple-100 text-purple-800';
    case 'supervisor':
      return 'bg-blue-100 text-blue-800';
    case 'attendant':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function getDayNumber(date: Date) {
  const day = date.getDay();
  return day === 0 ? 7 : day; // Convert Sunday (0) to 7, keep others as is
};

export function fromDatetimeLocalValue(value: Date): string {

  const offset = value.getTimezoneOffset() * 60000
  return new Date(value.getTime() + offset).toISOString()
}