"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

interface ProviderProps extends ColorModeProviderProps {
  children: React.ReactNode
}

export function Provider({ children, ...props }: ProviderProps) {
  return (
    <ChakraProvider>
      <ColorModeProvider {...props}>
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  )
}