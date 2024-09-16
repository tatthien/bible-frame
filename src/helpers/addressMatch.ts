import { ADDRESS_REGEX } from "../constants"

export const addressMatch = (address: string) => {
  const match = address.match(ADDRESS_REGEX)
  if (match) {
    return match[0]
  }
  return ''
}
