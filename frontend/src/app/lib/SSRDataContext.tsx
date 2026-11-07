import { createContext, useContext } from "react"

export const SSRDataContext = createContext<Record<string, unknown>>({})

export function useSSRData(): Record<string, unknown> {
  return useContext(SSRDataContext)
}
