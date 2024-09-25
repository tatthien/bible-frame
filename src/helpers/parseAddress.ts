import { ADDRESS_REGEX } from '../constants'

export const parseAddress = (address: string) => {
  const match = address.match(ADDRESS_REGEX)

  if (match) {
    const verseFrom = Number(match[3])
    const verseTo = Number(match[4])

    let verses = verseFrom ? [verseFrom] : []
    if (verseFrom && verseTo) {
      verses = Array.from(
        { length: verseTo - verseFrom + 1 },
        (_, i) => verseFrom + i,
      )
    }

    return {
      book: match[1].toUpperCase(),
      chapter: match[2],
      verses: verses,
    }
  }

  return null
}
