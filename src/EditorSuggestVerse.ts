import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from 'obsidian'
import BibleFramePlugin from '../main'
import { BASE_API_URL } from './constants'
import { addressMatch } from './helpers/addressMatch'
import { matchTirggerPrefix } from './helpers/matchTriggerPrefix'
import { SuggestVerse } from './SuggestVerse'

export class EditorSuggestVerse extends EditorSuggest<SuggestVerse> {
  plugin: BibleFramePlugin

  constructor(plugin: BibleFramePlugin) {
    super(plugin.app)
    this.plugin = plugin
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _: TFile | null,
  ): EditorSuggestTriggerInfo | null {
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch)

    if (currentContent.length < 2) {
      return null
    }

    const prefixTrigger = currentContent.substring(0, 2)
    if (!matchTirggerPrefix(prefixTrigger)) {
      return null
    }

    const queryContent = currentContent.substring(2).trim()
    const match = addressMatch(queryContent)

    if (match) {
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: queryContent.lastIndexOf(match),
        },
        query: match,
      }
    }

    return null
  }

  async getSuggestions(context: EditorSuggestContext): Promise<SuggestVerse[]> {
    const res = await fetch(
      `${BASE_API_URL}/verses?address=${encodeURIComponent(context.query)}`,
    )
    const json = await res.json()

    if (!json.length) return []

    const suggestVerse = new SuggestVerse(json, context.query)

    return [suggestVerse]
  }

  renderSuggestion(value: SuggestVerse, el: HTMLElement): void {
    const wrapper = el.createDiv()
    wrapper.innerHTML = value.renderSuggestion()
  }

  selectSuggestion(value: SuggestVerse, evt: MouseEvent | KeyboardEvent): void {
    if (this.context) {
      this.context.editor.replaceRange(
        value.callout(),
        this.context.start,
        this.context.end,
      )
    }
  }
}
