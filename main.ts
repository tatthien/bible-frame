import { App, MarkdownRenderer, Plugin, PluginSettingTab, Setting } from 'obsidian';

const BASE_API_URL = 'http://localhost:3000'

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

export default class BibleFramePlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    try {
      await this.loadSettings();

      this.registerMarkdownCodeBlockProcessor("bible", async (source, el, ctx) => {
        try {

          const rootEl = el.createEl('div', {
            cls: 'bible-frame',
          })

          const res = await fetch(`${BASE_API_URL}/verses?address=${encodeURIComponent(source)}`)
          const json = await res.json()

          const scriptureEl = rootEl.createEl('div', { cls: 'bible-frame-scripture' })
          scriptureEl.innerHTML = json.length ? json.map((verse: any) => `<sup>${verse.number}</sup> ${verse.content}`).join(' ') : 'No verses found. Double check the address and try again.'

          const srcEl = rootEl.createEl('div', { cls: 'bible-frame-src' })
          MarkdownRenderer.render(this.app, `\`\`\`plain\n${source}\n\`\`\``, srcEl, ctx.sourcePath, this)
        } catch (err) {
          el.createEl('pre', { text: err })
        }
      });


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

class BibleFrameSettingTab extends PluginSettingTab {
  plugin: BibleFramePlugin;

  constructor(app: App, plugin: BibleFramePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}
