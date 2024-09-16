import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from "obsidian";
import BibleFramePlugin from "../main";
import { BASE_API_URL } from "./constants";
import { addressMatch } from "./helpers/addressMatch";
import { matchTirggerPrefix } from "./helpers/matchTriggerPrefix";

export class EditorSuggestVerse extends EditorSuggest<any> {
  plugin: BibleFramePlugin

  constructor(plugin: BibleFramePlugin) {
    super(plugin.app);
    this.plugin = plugin
  }

  onTrigger(cursor: EditorPosition, editor: Editor, _: TFile | null): EditorSuggestTriggerInfo | null {
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
          ch: queryContent.lastIndexOf(match)
        },
        query: match,
      };
    }

    return null
  }

  async getSuggestions(context: EditorSuggestContext): any[] | Promise<any[]> {
    const res = await fetch(`${BASE_API_URL}/verses?address=${encodeURIComponent(context.query)}`)
    const json = await res.json()

    if (!json.length) return []

    const html = json.map((verse: any) => `<sup>${verse.number}</sup> ${verse.content}`).join(' ')

    return [html]
  }

  renderSuggestion(value: any, el: HTMLElement): void {
    const wrapper = el.createDiv()
    wrapper.innerHTML = value
  }

  selectSuggestion(value: any, evt: MouseEvent | KeyboardEvent): void {
    if (this.context) {
      this.context.editor.replaceRange(value, this.context.start, this.context.end)
    }
  }
}
