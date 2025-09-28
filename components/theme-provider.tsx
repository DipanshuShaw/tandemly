"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"           // applies "dark" or "light" class on <html>
      defaultTheme="dark"         // default theme
      enableSystem={true}         // follow system theme (set false if you want only manual toggle)
      disableTransitionOnChange   // avoids flicker on theme switch
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
