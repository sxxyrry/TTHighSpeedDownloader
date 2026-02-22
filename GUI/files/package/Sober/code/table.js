import { useElement } from './core/element.js';
const name = 's-table';
const style = /*css*/ `
:host{
  display: inline-block;
  font-size: .875rem;
  overflow: auto;
  border: solid 1px var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
  border-radius: 4px;
  white-space: nowrap;
}
slot{
  display: table;
  border-collapse: collapse;
  min-width: 100%;
}
@media (pointer: fine){
  :host::-webkit-scrollbar{
    width: 6px;
    height: 6px;
    background: transparent;
  }
  :host::-webkit-scrollbar-thumb{
    background: var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
    border-radius: 3px;
  }
  @supports not selector(::-webkit-scrollbar){
    :host{
      scrollbar-color: var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */}) transparent;
    }
  }
}
`;
const template = /*html*/ `
<slot></slot>
`;
export class Table extends useElement({ style, template }) {
}
const theadName = 's-thead';
const theadStyle = /*css*/ `
:host{
  display: table-header-group;
  font-weight: 600;
  position: sticky;
  top: 0;
  border-bottom: solid 1px var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
  background: var(--s-color-surface-container, ${"#ECEEF0" /* Theme.colorSurfaceContainer */});
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
}
`;
const theadTemplate = /*html*/ `<slot></slot>`;
export class Thead extends useElement({
    style: theadStyle,
    template: theadTemplate
}) {
}
const tbodyName = 's-tbody';
const tbodyStyle = /*css*/ `
:host{
  display: table-row-group;
  color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */});
}
::slotted(s-tr:not(:first-child)){
  border-top: solid 1px var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
}
`;
const tbodyTemplate = /*html*/ `<slot></slot>`;
export class Tbody extends useElement({
    style: tbodyStyle,
    template: tbodyTemplate
}) {
}
const trName = 's-tr';
const trStyle = /*css*/ `
:host{
  display: table-row;
}
`;
const trTemplate = /*html*/ `<slot></slot>`;
export class Tr extends useElement({
    style: trStyle,
    template: trTemplate,
}) {
}
const thName = 's-th';
const thStyle = /*css*/ `
:host{
  display: table-cell;
  padding: 12px 16px;
  text-transform: capitalize;
}
`;
const thTemplate = /*html*/ `<slot></slot>`;
export class Th extends useElement({
    style: thStyle,
    template: thTemplate
}) {
}
const tdName = 's-td';
const tdStyle = /*css*/ `
:host{
  display: table-cell;
  user-select: text;
  padding: 12px 16px;
}
`;
const tdTemplate = /*html*/ `<slot></slot>`;
export class Td extends useElement({
    style: tdStyle,
    template: tdTemplate
}) {
}
Table.define(name);
Thead.define(theadName);
Tbody.define(tbodyName);
Tr.define(trName);
Th.define(thName);
Td.define(tdName);
