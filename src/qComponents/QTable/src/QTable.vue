<template>
  <div
    ref="root"
    class="q-table"
  >
    <div
      ref="loaderWrapper"
      class="q-table__loading-wrapper"
    >
      <q-scrollbar
        ref="scrollbar"
        wrap-class="q-table__scroll-wrapper"
        theme="secondary"
      >
        <div
          v-if="isLoading || !isLoadingAnimationComplete"
          class="q-table__loader"
          :class="{ 'q-table__loader_is-loading': isLoading }"
        >
          <div class="q-table__loader-circle">
            <div class="q-table__loader-circle_quarter" />
            <div class="q-table__loader-circle_quarter" />
            <div class="q-table__loader-circle_quarter" />
            <div class="q-table__loader-circle_quarter" />
          </div>
        </div>
        <div
          ref="tableWrapper"
          class="q-table__wrapper"
          :class="wrapperClass"
          :style="loadingWrapperClass"
        >
          <template v-if="isDraggable">
            <div class="dnd-handler" />
            <div class="dnd-separator" />
          </template>

          <table
            v-if="rows.length"
            ref="QTable"
            class="q-table__table"
            :class="tableClasses"
            cellspacing="0"
            cellpadding="0"
          >
            <colgroup>
              <col
                v-if="isSelectable"
                :style="checkboxColWidth"
              />
              <template v-for="(group, groupIndex) in groupsOfColumns">
                <col
                  v-for="(column, index) in group.columns"
                  :key="`fixCol${groupIndex}${index}`"
                  :style="getColWidth(column)"
                />
              </template>
            </colgroup>

            <thead v-if="doesHeaderExist">
              <tr>
                <th
                  v-if="isSelectable"
                  :observer-key="
                    isSelectableColumnSticked && 'q-table-checkboxes'
                  "
                  class="q-table__header-cell q-table__header-cell__checkbox"
                >
                  <q-checkbox
                    v-if="selectableColumn.totalCheckboxPosition === 'header'"
                    v-model="areAllChecked"
                    :indeterminate="isIndeterminate"
                  />
                </th>
                <template v-for="(group, groupIndex) in groupsOfColumns">
                  <th
                    v-for="(column, index) in group.columns"
                    :key="`group${groupIndex}${index}`"
                    :class="getCellClasses(column, group)"
                    :style="getHeaderCellStyles(group, column)"
                    :observer-key="column.sticky ? column.key : null"
                    class="q-table__header-cell"
                  >
                    <div class="q-table__header-cell-wrapper">
                      <div
                        class="q-table__header-cell-content"
                        :class="getHeaderContentClass(column)"
                        :title="getHeaderTitle(column)"
                        @click="handleHeaderClick(column)"
                      >
                        <slot
                          v-if="$scopedSlots.header"
                          name="header"
                          :data="column"
                          v-bind="updateColumnItem(column, index, column.key)"
                        />

                        <slot
                          v-else-if="column.slots && column.slots.header"
                          :name="column.slots.header"
                          :data="column"
                          v-bind="updateColumnItem(column, index, column.key)"
                        />

                        <template v-else>
                          {{ column.value }}
                        </template>
                      </div>

                      <span
                        v-if="column.sortable"
                        class="q-table__sort-arrow"
                        :class="{
                          'q-icon-arrow-up': sort.direction !== 'descending',
                          'q-icon-arrow-down': sort.direction === 'descending'
                        }"
                        @click="handleHeaderClick(column)"
                      />

                      <template v-if="group.draggable">
                        <div
                          class="drop-handler dnd-before"
                          :class="getHandlerClass(group.key)"
                          :dndidx="index"
                        />

                        <drag-elements
                          :col-index="index"
                          parent-selector=".q-table__scroll-wrapper"
                          dummy-selector=".dnd-handler"
                          separator-selector=".dnd-separator"
                          target-selector=".q-table__header-cell"
                          limit-box-selector=".q-table__table"
                          :drop-zone-selector="`.${getHandlerClass(group.key)}`"
                          :is-first-blocked="isSelectable"
                          @change-order="
                            data => changeColumnsOrder(data, group.key)
                          "
                        >
                          <div class="drag-n-drop-icon">
                            <span
                              v-if="group.draggable"
                              class="q-icon-drag-linear"
                            />
                          </div>
                        </drag-elements>

                        <div
                          class="drop-handler dnd-after"
                          :class="getHandlerClass(group.key)"
                          :dndidx="index + 1"
                        />
                      </template>
                    </div>
                  </th>
                </template>
              </tr>
            </thead>

            <tbody>
              <tr v-if="isTotalExist">
                <td
                  v-if="isSelectable"
                  class="q-table__total-cell"
                  :observer-key="
                    isSelectableColumnSticked && 'q-table-checkboxes'
                  "
                  :class="{
                    'q-table__total-cell_selectable':
                      selectableColumn.totalCheckboxPosition === 'total'
                  }"
                >
                  <q-checkbox
                    v-if="selectableColumn.totalCheckboxPosition === 'total'"
                    v-model="areAllChecked"
                    :indeterminate="isIndeterminate"
                  />
                </td>
                <template v-for="(group, groupIndex) in groupsOfColumns">
                  <td
                    v-for="(column, index) in group.columns"
                    :key="`col${groupIndex}${index}`"
                    :class="getCellClasses(column, group)"
                    :observer-key="column.sticky ? column.key : null"
                    class="q-table__cell q-table__total-cell"
                  >
                    <slot
                      v-if="$scopedSlots.total"
                      name="total"
                      :data="total"
                      v-bind="updateTotalItem(total, index, column.key)"
                    />

                    <slot
                      v-else-if="column.slots && column.slots.total"
                      :name="column.slots.total"
                      :data="total"
                      v-bind="updateTotalItem(total, index, column.key)"
                    />

                    <template v-else-if="total[column.key]">
                      {{ total[column.key] }}
                    </template>
                  </td>
                </template>
              </tr>

              <row-hoc
                v-for="(row, rowIndex) in computedRows"
                :ref="rowIndex === 0 && 'QFirstRow'"
                :key="rowIndex"
                :row="row"
                :row-index="rowIndex"
                :columns="allColumns"
                :class="levelClass(row.indent)"
                :expandable="expandable"
                :indent-size="indentSize"
                :indent="row.indent"
                :children-key="childrenKey"
                :pages-in-expand="pagesInExpand"
                :custom-row-class="customRowClass"
                :custom-row-style="customRowStyle"
                :checked-rows="checkedRows"
                :is-selectable="isSelectable"
                :is-selectable-column-sticked="isSelectableColumnSticked"
                :row-click="$listeners['row-click'] && handleRowClick"
                @expand-click="handleExpandClick"
                @check="handleRowCheck"
              >
                <template #row="{ rowData }">
                  <slot
                    v-if="$scopedSlots.row"
                    name="row"
                    :row="rowData"
                  />

                  <slot
                    v-else-if="findSlotForRow(rowData.key)"
                    :name="findSlotForRow(rowData.key)"
                    :row="rowData.data"
                    :row-key="rowData.key"
                    :index="rowData.index"
                    :value="rowData.value"
                    :indent="rowData.indent"
                    :column="rowData.column"
                  />

                  <template v-else>
                    {{ rowData.value }}
                  </template>
                </template>
              </row-hoc>
            </tbody>
          </table>

          <div
            v-else
            class="q-table__empty"
          >
            <div class="q-table__empty-image" />
            <div class="q-table__empty-text">
              {{ emptyText || $t('QTable.noData') }}
            </div>
          </div>
        </div>
      </q-scrollbar>
    </div>
  </div>
</template>

<script>
import { cloneDeep, throttle } from 'lodash-es';
import QTableRow from './components/QTableRow';
import DragElements from './components/DragElements';

import withQTableRow from './hocs/withQTableRow';

const RowHoc = withQTableRow(QTableRow);
const shadowDropOffset = 3;
const MIN_BLANK_TABLE_HEIGHT = 228;
const CHECKBOX_COL_WIDTH = 64;

export default {
  name: 'QTable',

  components: {
    RowHoc,
    DragElements
  },

  props: {
    /**
     * do not shrink column's width as native table does (change `defaultColWidth` or pass the `width` to each column object for managing the width)
     */
    fixedLayout: {
      type: Boolean,
      default: true
    },
    /**
     * Default columns width, required `fixedLayout: true`
     */
    defaultColWidth: {
      type: String,
      default: '200px'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    /**
     * `groupsOfColumns` MUST contain one or more groups of columns,
     * Each group MUST contain `key` and `columns` - array of objects.
     * Each group MAY contain:
     *  `color` (hex string) - column's header color.
     *  `draggabble` (boolean) - whether to drag and drop columns inside the group.
     *  `align` (left/right) - content's align.
     * Each column MUST contain `key` and `value`.
     * Each column MAY contain:
     *  `sortable`,
     *  `slots`,
     *  `width` (works with `fixedLayout: true`),
     *  `minWidth` (works with `fixedLayout: false`),
     *  `customCellClass`,
     *  `formatter` (fn)
     */
    groupsOfColumns: {
      type: Array,
      required: true
    },
    /**
     * Array of objects, each object must contain `[column.key]: value` pair
     */
    rows: {
      type: Array,
      required: true
    },
    /**
     * Show/hide grid view
     */
    grid: {
      type: Boolean,
      default: false
    },
    /**
     * Object, `[column.key]: value` pair, not all are required
     */
    total: {
      type: Object,
      default: () => ({})
    },
    childrenKey: {
      type: String,
      default: 'children'
    },
    expandable: {
      type: Boolean,
      default: false
    },
    indentSize: {
      type: Number,
      default: 16
    },
    uniqueKey: {
      type: String,
      default: ''
    },
    pagesInExpand: {
      type: [Boolean, String],
      default: false
    },
    /**
     * Get row as argument, must return style `String`,
     * you can also return one:
     * `green-row`
     * `red-row`
     * `grey-row`
     * `dark-row`
     * `yellow-row`
     */
    customRowClass: {
      type: Function,
      default: null
    },
    /**
     * Get row as argument, must return style `String`
     */
    customRowStyle: {
      type: Function,
      default: null
    },
    /**
     * Checkboxes column.
     * `sticky` - whether column should stick.
     * `totalCheckboxPosition` - where total checkbox need to place, `header` or `total`.
     */
    selectableColumn: {
      type: Object,
      default: () => ({}),
      required: false,
      validator: props => {
        if (!Object.keys(props).length) return true;

        return (
          props.totalCheckboxPosition &&
          ['header', 'total'].includes(props.totalCheckboxPosition)
        );
      }
    },
    defaultSort: {
      type: Object,
      default: () => ({
        key: null,
        direction: 'ascending'
      })
    },
    /**
     * Text for empty table
     */
    emptyText: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      timer: 2,
      isLoadingAnimationComplete: true,
      loaderWrapperHeight: 0,
      scrolled: 0,
      wrapperWidth: 0,
      tableWrapper: null,
      treeRows: [],
      loaderRow: null,
      wrapperClass: '',
      checkedRows: [],
      sort: this.defaultSort,
      stickedOffsets: {
        left: {},
        right: {}
      },
      observers: {},
      isRendered: false,
      QFirstRowEl: null
    };
  },

  computed: {
    allColumns() {
      return this.groupsOfColumns.reduce((acc, group) => {
        const eachGroup = group.columns.map(col => {
          const newCol = {
            ...col,
            align: col.align ?? group.align ?? 'left'
          };
          return newCol;
        });
        return acc.concat(eachGroup);
      }, []);
    },

    doesHeaderExist() {
      return this.groupsOfColumns.some(({ columns }) =>
        columns.some(({ value, slots }) => value?.toString() ?? slots?.header)
      );
    },

    isDraggable() {
      return this.groupsOfColumns.find(group => group.draggable);
    },

    isSeparated() {
      return this.groupsOfColumns.length > 1;
    },

    areAllChecked: {
      get() {
        return this.checkedRows.length === this.rows.length;
      },
      set(isChecked) {
        this.checkedRows = isChecked
          ? Array.from(Array(this.computedRows.length).keys())
          : [];
      }
    },

    isSelectable() {
      return Boolean(Object.keys(this.selectableColumn).length);
    },

    isSelectableColumnSticked() {
      return (this.isSelectable && this.selectableColumn?.sticky) ?? false;
    },

    tableClasses() {
      return {
        'q-table__draggable': this.isDraggable,
        'q-table__selectable': this.isSelectable,
        'q-table__separated': this.isSeparated,
        'q-table__grid': this.grid,
        'q-table__fixed': this.fixedLayout
      };
    },

    isIndeterminate() {
      return Boolean(
        this.checkedRows.length && this.checkedRows.length !== this.rows.length
      );
    },

    isTotalExist() {
      return Boolean(Object.keys(this.total).length);
    },

    loadingWrapperClass() {
      return {
        height: this.loaderWrapperHeight ? `${this.loaderWrapperHeight}px` : '',
        transition: `all 0.${this.timer}s`
      };
    },

    tableClass() {
      if (this.scrolled === 0) return 'scrolled-left';

      const QTableWidth = this.$refs.QTable.offsetWidth;

      return this.scrolled === QTableWidth - this.wrapperWidth
        ? 'scrolled-right'
        : 'scrolled-center';
    },

    computedRows() {
      const rows = this.treeRows.length ? this.treeRows : this.rows;

      return rows.map((row, index) => ({
        ...row,
        treeIndex: index
      }));
    },

    checkboxColWidth() {
      return { width: `${CHECKBOX_COL_WIDTH}px` };
    }
  },

  watch: {
    isLoading() {
      this.isLoadingAnimationComplete = false;

      setTimeout(() => {
        this.loaderWrapperHeight = this.$refs.QTable
          ? this.$refs.QTable.clientHeight + shadowDropOffset
          : MIN_BLANK_TABLE_HEIGHT;

        setTimeout(() => {
          this.isLoadingAnimationComplete = true;
        }, 200);
      }, this.timer * 300);
    },
    rows: {
      handler(rows) {
        this.treeRows = rows.map((row, index) => {
          const updatedRow = {
            data: row,
            treeIndex: index
          };

          const childs = updatedRow.data[this.childrenKey];

          if (childs) {
            updatedRow.data[this.childrenKey] = this.updateChildrenRows(
              childs,
              row,
              updatedRow
            );
          }

          return updatedRow;
        });
      },
      immediate: true
    },
    checkedRows(rowsIndexes) {
      const rows = this.computedRows.filter((_, index) =>
        rowsIndexes.includes(index)
      );

      this.$emit('rows-check', rows);
    }
  },

  updated() {
    this.changeWrapperHeight();
  },

  beforeUpdate() {
    this.QFirstRowEl = this.$refs.QFirstRow?.[0]?.$el;

    if (!this.QFirstRowEl) return;

    this.getStickedOffsets();
    this.createObservers();

    if (!this.isRendered) this.detectIntersections(0);
  },

  created() {
    window.addEventListener('resize', this.changeWrapperHeight, {
      passive: true
    });
  },

  destroyed() {
    window.removeEventListener('resize', this.changeWrapperHeight);
  },

  mounted() {
    if (this.$refs.QTable) {
      this.loaderWrapperHeight =
        this.$refs.QTable.clientHeight + shadowDropOffset;
    }

    const wrapper = this.$refs?.tableWrapper ?? null;

    if (wrapper && this.$refs.QTable) {
      if (wrapper.offsetWidth < this.$refs.QTable.offsetWidth) {
        this.wrapperClass = 'q-table__wrapper_scrollable';
      }

      wrapper.addEventListener('scroll', this.onScroll, {
        passive: true
      });

      this.wrapperWidth = wrapper.offsetWidth;
    }

    if (!this.$refs.scrollbar) return;

    this.$watch(
      () => this.$refs.scrollbar.moveX,
      throttle(this.detectIntersections, 100)
    );
  },

  beforeDestroy() {
    if (!this.$refs.tableWrapper) return;

    this.$refs.tableWrapper.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    createObservers() {
      if (!this.$refs.QTable) return;

      this.observers = {};

      let totalWidth = parseFloat(
        window.getComputedStyle(this.$refs.tableWrapper).paddingLeft
      );

      if (this.isSelectable) {
        if (this.isSelectableColumnSticked) {
          this.observers['q-table-checkboxes'] = {
            position: 'left',
            triggerLeft: totalWidth,
            triggerRight: totalWidth + CHECKBOX_COL_WIDTH,
            offset: 0,
            isSticked: false
          };
        }

        totalWidth += CHECKBOX_COL_WIDTH;
      }

      this.allColumns.forEach(({ sticky, key }, index) => {
        const elementWidth = this.QFirstRowEl.querySelector(
          `td:nth-child(${index + (this.isSelectable ? 2 : 1)})`
        ).offsetWidth;

        if (!sticky) {
          totalWidth += elementWidth;
          return;
        }

        this.observers[key] = {
          position: sticky.position,
          triggerLeft: totalWidth,
          triggerRight: totalWidth + elementWidth,
          offset: this.getStickyOffset(sticky.position, key),
          isSticked: false
        };

        totalWidth += elementWidth;
      });

      totalWidth += parseFloat(
        window.getComputedStyle(this.$refs.tableWrapper).paddingRight
      );
    },

    detectIntersections(moveX) {
      const rootWidth = this.$refs.root.offsetWidth;
      const moveXPixels = (rootWidth * moveX) / 100;

      if (!this.$refs.QTable) return;

      const observers = { ...this.observers };

      Object.entries(observers).forEach(
        (
          [key, { position, triggerLeft, triggerRight, offset, isSticked }],
          index
        ) => {
          const intersectableElements = this.$refs.QTable.querySelectorAll(
            `[observer-key=${key}]`
          );

          const scroll = moveXPixels + offset;

          let triggerWithinRoot = triggerLeft < scroll;
          let triggerOutsideRoot = triggerLeft >= scroll;

          if (position === 'right') {
            const reversedOffset = triggerRight + offset * 2;
            triggerWithinRoot = reversedOffset > scroll + rootWidth;
            triggerOutsideRoot = reversedOffset < scroll + rootWidth;
          }

          const isTriggerConditionChanged =
            (!isSticked && triggerWithinRoot) ||
            (isSticked && triggerOutsideRoot);

          if (!isTriggerConditionChanged) return;

          observers[key].isSticked = !isSticked && triggerWithinRoot;
          intersectableElements.forEach(elem =>
            this.changeStickyStyles({
              elem,
              index,
              position,
              offset,
              isOff: isSticked && triggerOutsideRoot
            })
          );
        }
      );

      this.observers = observers;
      this.isRendered = true;
    },

    changeStickyStyles({ elem, index, position, isOff, offset }) {
      if (isOff) {
        elem.classList.remove('q-table__sticked-cell');

        if (position === 'right') {
          elem.classList.remove('q-table__sticked-cell_is-reversed');
          /* eslint-disable-next-line no-param-reassign */
          elem.style.zIndex = null;
        }

        /* eslint-disable-next-line no-param-reassign */
        elem.style[position] = null;

        return;
      }

      elem.classList.add('q-table__sticked-cell');

      let correction = this.grid ? index : 0;

      if (position === 'right') {
        const reversedIndex =
          Object.keys(this.stickedOffsets.right).length + 2 - index;

        elem.classList.add('q-table__sticked-cell_is-reversed');
        /* eslint-disable-next-line no-param-reassign */
        elem.style.zIndex = reversedIndex;

        correction = this.grid ? reversedIndex : 0;
      }

      /* eslint-disable-next-line no-param-reassign */
      elem.style[position] = `${offset + correction}px`;
    },

    getStickyOffset(position, key) {
      if (!Object.keys(this.stickedOffsets[position]).length) return 0;

      return this.stickedOffsets[position]?.[key] ?? 0;
    },

    getStickedOffsets() {
      if (!this.$refs.QTable) return;

      this.stickedOffsets = {
        left: {},
        right: {}
      };

      let tds = this.QFirstRowEl.querySelectorAll('td');

      if (!tds.length) return;

      let totalLeftWidth = 0;
      let totalRightWidth = 0;

      if (this.isSelectable && this.isSelectableColumnSticked) {
        this.stickedOffsets.left['q-table-checkboxes'] = CHECKBOX_COL_WIDTH;
        totalLeftWidth += CHECKBOX_COL_WIDTH;
      }

      this.allColumns.forEach((col, index) => {
        if (col.sticky?.position === 'left') {
          this.stickedOffsets.left[col.key] = totalLeftWidth;
          totalLeftWidth += tds[index].offsetWidth;
        }
      });

      tds = Array.from(tds).reverse();
      [...this.allColumns].reverse().forEach((col, index) => {
        if (col.sticky?.position === 'right') {
          this.stickedOffsets.right[col.key] = totalRightWidth;
          totalRightWidth += tds[index].offsetWidth;
        }
      });
    },

    getHeaderContentClass({ slots }) {
      const hasSlot = Boolean(slots?.header || this.$scopedSlots.header);
      return hasSlot ? null : 'q-table__header-cell-content_original';
    },

    getHeaderTitle({ value, slots }) {
      const hasSlot = Boolean(slots?.header || this.$scopedSlots.header);
      return hasSlot ? null : value;
    },

    changeWrapperHeight() {
      if (this.isLoading || !this.isLoadingAnimationComplete) return;

      this.loaderWrapperHeight = this.$refs.QTable
        ? this.$refs.QTable.clientHeight + shadowDropOffset
        : MIN_BLANK_TABLE_HEIGHT;
    },

    updateChildrenRows(childs, row, updatedRow) {
      return childs.map(child => {
        const childlessRow = { ...row };
        this.$delete(childlessRow, [this.childrenKey]);

        const updatedChildRow = {
          data: child,
          parentRow: childlessRow,
          indent: updatedRow.indent + this.indentSize || this.indentSize,
          treeIndex: updatedRow.treeIndex
        };

        const rowChilds = updatedChildRow.data[this.childrenKey];

        if (rowChilds) {
          updatedChildRow.data[this.childrenKey] = this.updateChildrenRows(
            rowChilds,
            child,
            updatedChildRow
          );
        }

        return updatedChildRow;
      });
    },

    handleHeaderClick({ key, sortable }) {
      if (!sortable) return;
      this.setSort(key);
    },

    getHandlerClass(group) {
      return `${this.isSeparated ? group : 'column'}-handler`;
    },

    findSlotForRow(columnKey) {
      const currentCol = this.allColumns.find(({ key }) => key === columnKey);

      return currentCol?.slots?.row ?? null;
    },

    handleRowClick(row) {
      this.$emit('row-click', row);
    },

    handleRowCheck({ isChecked, rowIndex }) {
      const checkedRows = new Set(this.checkedRows);

      if (isChecked) {
        checkedRows.add(rowIndex);
      } else {
        checkedRows.delete(rowIndex);
      }

      this.checkedRows = Array.from(checkedRows);
    },

    setSort(key, direction) {
      if (direction) {
        this.sort = {
          key,
          direction
        };

        this.$emit('change-sort', this.sort);

        return;
      }

      if (this.sort.key !== key) {
        this.sort = {
          key,
          direction: this.sort.direction ?? 'ascending'
        };

        this.$emit('change-sort', this.sort);

        return;
      }

      switch (this.sort.direction) {
        case null:
          this.sort.direction = 'ascending';
          break;
        case 'ascending':
          this.sort.direction = 'descending';
          break;
        default:
        case 'descending':
          this.sort.direction = null;
          break;
      }

      this.$emit('change-sort', this.sort);
    },

    levelClass(indent) {
      if (!indent) return '';
      return `q-table__row-level-${indent / this.indentSize}`;
    },

    handleExpandClick(row) {
      const currentRow = this.treeRows[row.treeIndex];

      if (!row.isTreeOpened) {
        const updatedRow = {
          ...currentRow,
          isTreeOpened: true
        };

        this.treeRows.splice(currentRow, 1, updatedRow);
        return;
      }

      this.$delete(currentRow, 'isTreeOpened');
    },

    findScopedRow(row, key, value) {
      let foundRow = null;

      if (row[key] === value) {
        foundRow = row;
      }

      if (!foundRow && row[this.childrenKey]) {
        row[this.childrenKey].forEach(childRow => {
          if (!foundRow) foundRow = this.findScopedRow(childRow, key, value);
        });
      }

      return foundRow;
    },

    resolve(row, newChilds, isAdditional) {
      this.treeRows = this.computedRows;

      const parentRow = this.findScopedRow(
        this.treeRows[row.treeIndex],
        this.uniqueKey,
        row[this.uniqueKey]
      );

      let loaderRow = null;

      let updatedChilds = newChilds.map(child => {
        const childlessRow = { ...row };
        this.$delete(childlessRow, [this.childrenKey]);

        if (child[this.pagesInExpand]) {
          loaderRow = { ...child, parentRow: childlessRow };
        }
        return {
          ...child,
          parentRow: childlessRow,
          indent: row.indent + this.indentSize || this.indentSize,
          treeIndex: row.treeIndex
        };
      });

      if (this.pagesInExpand && loaderRow) {
        updatedChilds = updatedChilds.filter(
          child => !child[this.pagesInExpand]
        );
        updatedChilds.push(loaderRow);
      }

      if (isAdditional && parentRow[this.childrenKey]) {
        const childs = parentRow[this.childrenKey].filter(
          child => !child[this.pagesInExpand]
        );

        this.$set(parentRow, [this.childrenKey], [...childs, ...updatedChilds]);
      } else {
        this.$set(parentRow, [this.childrenKey], updatedChilds);
      }

      parentRow.isTreeOpened = true;

      return this.treeRows;
    },

    onScroll({ target }) {
      this.scrolled = target.scrollLeft;
    },

    getHeaderCellStyles(group, column) {
      const style = {};

      if (column?.minWidth) style.minWidth = column.minWidth;
      if (!this.isSeparated || !group) return style;

      return {
        ...style,
        borderColor: group.color ?? ''
      };
    },

    getCellClasses(column = {}, group) {
      const classes = [this.getSortableClass(column)];

      if (this.isSeparated) {
        classes.push(`q-table__header-cell_${group.key}`);
      }

      if (group.align || column.align) {
        classes.push(
          `q-table__header-cell_align-${column.align ?? group.align}`
        );
      }

      return classes;
    },

    getSortableClass(column) {
      const isColumnSortable = column?.sortable ?? null;

      const sortableClass =
        this.sort.key === column.key && this.sort.direction
          ? `q-table__cell-sortable_${this.sort.direction}`
          : 'q-table__cell-sortable';

      if (!isColumnSortable) return '';

      if (this.sort.key === column?.key) {
        return `${sortableClass} ${sortableClass}`;
      }

      return sortableClass;
    },

    getColWidth(column) {
      return {
        width: column.width ?? this.defaultColWidth
      };
    },

    updateColumnItem(item, index, key) {
      return {
        columnKey: key || null,
        index,
        value: item.value ?? null
      };
    },

    updateTotalItem(item, index, key) {
      return {
        columnKey: key || null,
        index,
        value: item[key] ?? null
      };
    },

    changeColumnsOrder({ newPositionIndex, oldPositionIndex }, groupKey) {
      const columns = cloneDeep(this.groupsOfColumns);
      const group = columns.find(({ key }) => key === groupKey);
      if (group?.columns) {
        group.columns.splice(
          newPositionIndex,
          0,
          group.columns.splice(oldPositionIndex, 1)[0]
        );
      }

      this.$emit('change-order', columns);
    }
  }
};
</script>
