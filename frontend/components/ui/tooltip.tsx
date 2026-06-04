"use client"

import {
  Tooltip as ChakraTooltip,
  TooltipProps as ChakraTooltipProps,
} from "@chakra-ui/react"
import * as React from "react"

export interface TooltipProps extends Omit<ChakraTooltipProps, "label"> {
  content: string
  disabled?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const { children, content, disabled, ...rest } = props

    if (disabled) return <>{children}</>

    return (
      <ChakraTooltip label={content} {...rest}>
        {children}
      </ChakraTooltip>
    )
  },
)