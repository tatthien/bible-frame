import { capitalize } from './src/helpers/capitalize';
import { parseAddress } from './src/helpers/parseAddress';
import { MarkdownRenderer, Plugin } from 'obsidian';
import { BASE_API_URL } from 'src/constants';
import { EditorSuggestVerse } from './src/EditorSuggestVerse';
import { BibleFrameSettingTab } from './src/BibleFrameSettingTab';

interface BibleFrameSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: BibleFrameSettings = {
  mySetting: 'default'
}

export default class BibleFramePlugin extends Plugin {
  settings: BibleFrameSettings;

  async onload() {
    try {
      await this.loadSettings();

      this.registerMarkdownCodeBlockProcessor("bible", async (source, el, ctx) => {
        try {
          const address = parseAddress(source)
          if (!address) {
            throw new Error(`"${source}" is not a valid address`)
          }

          const { book, chapter, verses } = address

          const rootEl = el.createEl('div', {
            cls: 'bible-frame',
          })

          const res = await fetch(`${BASE_API_URL}/verses?address=${encodeURIComponent(source)}`)
          const json = await res.json()

          const scriptureEl = rootEl.createEl('div', { cls: 'bible-frame-scripture' })
          scriptureEl.innerHTML = json.length
            ? json.map((verse: any) => `<sup style="font-size: 0.5em; font-weight: 500">${verse.number}</sup> ${verse.content}`).join(' ')
            : `<span style="font-size: 0.875em;">No verses found for the address <strong>"${capitalize(source)}"</strong></span>`

          if (json.length) {
            const srcEl = rootEl.createEl('div', { cls: 'bible-frame-src' })
            MarkdownRenderer.render(this.app, `[[${book.toUpperCase()}-${chapter}#${verses[0]} | ${capitalize(source)}]]`, srcEl, ctx.sourcePath, this)
          }
        } catch (err) {
          el.createEl('pre', { text: err })
        }
      });

      this.registerEditorSuggest(new EditorSuggestVerse(this))

      // This adds a settings tab so the user can configure various aspects of the plugin
      this.addSettingTab(new BibleFrameSettingTab(this.app, this));
    } catch (err) {
      console.error('[ERROR]', err)
    }
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

