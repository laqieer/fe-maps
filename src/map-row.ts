import { css, customElement, html, LitElement, property } from 'lit-element';
import "./map-table";
import { GameVal, getHexVal, getPrimSize, getPrimName } from './utils';

/**
 * Renders a single row in a table.
 */
@customElement('map-row')
export class MapRow extends LitElement {
  static override styles = css`
    :host {
      background: #202020;
      border: 1px solid #808080;
      display: flex;

      --map-blue: #2196F3;
      --map-gray: #202020;
      --map-black: #999999;
    }

    :host([odd]) {
      background: #101010;
    }

    div:not(:last-child) {
      border-right: 1px solid var(--map-black);
    }

    div {
      box-sizing: border-box;
      display: inline-block;
      overflow: hidden;
      padding: 3px 5px 3px 5px;
      text-overflow: ellipsis;
    }

    div,
    span {
      transition: background-color .5s linear;
    }

    p {
      margin: 0 0 3px 0;
    }

    .size {
      flex: none;
      text-align: right;
      width: 5em;
    }

    .addr {
      flex: none;
      font-family: "Courier New", monospace;
      width: 7em;
    }

    .addr,
    .offset {
      text-align: right;
    }

    .type {
      cursor: help;
      font-family: "Courier New", monospace;
      font-size: 14px;
      margin: 0 2px 0 0;
    }

    .val,
    .offset {
      width: 5.5em;
    }

    .has-tooltip {
      border-bottom: 1px dotted white;
      cursor: help;
    }

    .expand {
      color: var(--map-blue);
      cursor: pointer;
    }

    .highlight {
      background-color: steelblue;
    }

    .desc,
    .params,
    .return {
      flex: 1;
    }
  `;

  /**
   * The JSON data to render.
   */
  @property({ type: Object }) data = {} as { [key: string]: unknown };

  @property({ type: Object }) structs = {} as { [key: string]: unknown };

  @property({ type: Object }) enums = {} as { [key: string]: unknown };

  @property({ type: String }) version = '';

  @property({ type: Boolean, reflect: true }) odd = false;

  @property({ type: Boolean, reflect: true }) expanded = false;

  @property({ type: Boolean }) isEnum = false;

  @property({ type: String }) parentAddress = '';

  @property({ type: String }) maptype = '';

  private toHex(num: number): string {
    return num.toString(16).toUpperCase();
  }

  private getLength() {
    return this.getSize() * this.getCount();
  }

  async highlightCell(key: string, shouldScroll: boolean) {
    if (key == 'enum') {
      this.expanded = true;
    }
    await this.updateComplete;
    const element = this.shadowRoot?.querySelector('.' + key)! as HTMLElement;
    if (shouldScroll) {
      // Account for the sticky header.
      const yOffset = 140;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset - yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    element.classList.add('highlight');
  }

  async highlightSubTable(
    result: { row: number[], key: string }, shouldScroll: boolean) {
    this.expanded = true;
    await this.updateComplete;
    const table = this.shadowRoot?.querySelector('map-table')!;
    table.highlight(result, shouldScroll);
  }

  clearHighlights() {
    const highlights =
      Array.from(this.shadowRoot?.querySelectorAll('.highlight')!);
    highlights.forEach(el => el.classList.remove('highlight'));
    if (this.expanded) {
      const table = this.shadowRoot?.querySelector('map-table')!;
      table.clearHighlights();
    }
  }

  collapseAll() {
    if (this.expanded) {
      const table = this.shadowRoot?.querySelector('map-table')!;
      table.collapseAll();
    }
    this.expanded = false;
  }

  private getCount() {
    return 'count' in this.data ? parseInt(this.data.count as string, 16) : 1;
  }

  private getSize() : number {
    if (this.data.size) {
      return getHexVal(this.data.size as GameVal, this.version);
    }
    const type = (this.data.type as string).split('.')[0];
    if (type in this.structs) {
      const struct = this.structs[type] as { size: GameVal }
      return getHexVal(struct.size, this.version);
    }
    return getPrimSize(type);
  }

  private getTooltip() {
    if (this.maptype === 'code') {
      return `Ends at ${
        this.toHex(this.getAddr() + this.getLength() - 1)}`
    }
    if (this.version) {
      const count = this.getCount();
      if (count > 1) {
        const size = this.getSize();
        return 'Size: ' + this.toHex(size) + '\nCount: ' + this.toHex(count);
      }
      return '';
    }
    return 'Address: ' + this.getOffsetAddr();
  }

  private getOffsetAddr() {
    const off = parseInt(this.data.offset as string, 16);
    return this.toHex(parseInt(this.parentAddress, 16) + off);
  }

  private showToggle() {
    return (this.isExpandEnum() || this.data.type as string in this.structs);
  }

  private expand() {
    this.expanded = !this.expanded;
  }

  private isExpandEnum() {
    return 'enum' in this.data;
  }

  private getExpandName(): string {
    return this.isExpandEnum() ? this.data.enum as string :
      this.data.type as string;
  }

  private getData(): { [key: string]: unknown }[] {
    if (this.isExpandEnum()) {
      return this.enums[this.getExpandName()] as { [key: string]: unknown }[];
    }
    return (this.structs[this.getExpandName()] as { [key: string]: unknown })
      .vars as { [key: string]: unknown }[];
  }

  private getAddr(): number {
    if (this.version) {
      return getHexVal(this.data.addr as GameVal, this.version);
    }
    return parseInt(this.data.offset as string, 16);
  }

  private getAddrStr(): string {
    return this.toHex(this.getAddr());
  }

  private shouldAddrHaveToolTip(): boolean {
    return !this.version;
  }

  private getFirstClass(data: { [key: string]: unknown }): string {
    if (data.val) {
      return 'val'
    } else if (data.addr) {
      return 'addr';
    }
    return 'offset';
  }

  private renderCodeVar(codeVar: object) {
    const cv = codeVar as { [index: string]: string };
    const type = cv.type.split('.')[0]
    const tip = getPrimName(type);
    return html`<p>
      <span class="type" title=${tip}>${type}</span>
      <span>${cv.desc}</span>
    </p>`;
  }

  override render() {
    return this.isEnum ?
      html`
      <div class="${this.getFirstClass(this.data)}">${this.data.val}</div>
      <div class="desc">${this.data.desc}</div>` :
      html`
      <div class="${this.getFirstClass(this.data)}">
        <span class="${this.shouldAddrHaveToolTip() ? 'has-tooltip' : ''}"
              title="${
        this.shouldAddrHaveToolTip() ? this.getTooltip() :
          ''}">${this.getAddrStr()}</span>
      </div>
      <div class="size">
        <span class="${this.version && !!this.getTooltip() ?
                'has-tooltip' : ''}"
              title="${this.getTooltip()}">${
        this.toHex(this.getLength())}</span>
      </div>
      <div class="desc">${this.data.desc} ${
        this.showToggle() ?
          html`<span class="expand" @click="${this.expand}">[${
            this.expanded ? '-' : '+'}]</span>` :
          ''}
          ${
        this.expanded ? html`<map-table
              .data="${this.getData()}"
              ?isEnum="${this.isExpandEnum()}"
              .structs="${this.structs}"
              .enums="${this.enums}"
              .parentAddress="${
          this.version ? this.getAddrStr() :
            this.getOffsetAddr()}">
            </map-table>` :
          ''}
      </div>
      ${
        this.maptype === 'code' ?
          html`
      <div class="params">
        <span>
          ${this.data.params ?
            (this.data.params as object[])
              .map(param => this.renderCodeVar(param)) :
              'void'}
        </span>
      </div>
      <div class="return">
        <span>
          ${this.data.return ?
            this.renderCodeVar(this.data.return as object) :
            'void'}
        </span>
      </div>` :
          ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'map-row': MapRow;
  }
}
