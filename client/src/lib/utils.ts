import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useLocation } from "wouter"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useQuery() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  return {
    get: (key: string) => searchParams.get(key),
    getAll: (key: string) => searchParams.getAll(key),
    has: (key: string) => searchParams.has(key),
    toString: () => searchParams.toString()
  };
}
