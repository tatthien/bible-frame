import { capitalize } from "./helpers/capitalize";

export class SuggestVerse {
  private address: string
  private verses: {
    number: number
    content: string
  }[]

  constructor(verses: { number: number; content: string }[], address: string) {
    this.address = address
    this.verses = verses
  }

  renderSuggestion(): string {
    return this.htmlVerses()
  }

  callout(): string {
    const header = `> [!bible]+ ${capitalize(this.address)}\n`
    const content = `> ${this.htmlVerses()}`

    return header + content
  }

  htmlVerses(): string {
    return this.verses
      .map((verse: { number: number; content: string }) => `<sup>${verse.number}</sup> ${verse.content}`)
      .join(' ')
  }
}
