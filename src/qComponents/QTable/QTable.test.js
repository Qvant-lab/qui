import Component from './index';

describe('QTable', () => {
  let options;

  beforeEach(() => {
    options = {
      propsData: {
        groupsOfColumns: [
          {
            key: 'group-key',
            columns: [
              {
                key: 'col1',
                value: 'Column 1',
                slots: {
                  row: 'row-slot'
                }
              },
              {
                key: 'col2',
                value: 'Column 2',
                slots: {
                  row: 'row-slot'
                }
              }
            ]
          },
          {
            columns: [
              {
                key: 'col3',
                value: 'Column 3',
                align: 'right'
              }
            ]
          }
        ],
        rows: [
          {
            col1: 'Col 1 row 1',
            col2: 'Col 2 row 1',
            col3: 'Col 3 row 1'
          },
          {
            col1: 'Col 1 row 2',
            col2: 'Col 2 row 2',
            col3: 'Col 3 row 2'
          }
        ]
      }
    };
  });

  it('QTable should match snapshot', () => {
    const { element } = shallowMount(Component, options);

    expect(element).toMatchSnapshot();
  });

  describe('computed', () => {
    it('allColumns should return updated columns', () => {
      const { vm } = shallowMount(Component, options);

      expect(vm.allColumns).toEqual([
        {
          align: 'left',
          key: 'col1',
          value: 'Column 1',
          slots: {
            row: 'row-slot'
          }
        },
        {
          align: 'left',
          key: 'col2',
          value: 'Column 2',
          slots: {
            row: 'row-slot'
          }
        },
        {
          align: 'right',
          key: 'col3',
          value: 'Column 3'
        }
      ]);
    });

    describe('isDraggable', () => {
      it('should return false in default statement', () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.isDraggable).toBeFalsy();
      });

      it('should return true, if some group has draggable prop', () => {
        options.propsData.groupsOfColumns[0].draggable = true;

        const { vm } = shallowMount(Component, options);

        expect(vm.isDraggable).toBeTruthy();
      });
    });

    it('isSeparated should return false if groupsOfColumns blank', () => {
      options.propsData.groupsOfColumns = [];
      const { vm } = shallowMount(Component, options);

      expect(vm.isDraggable).toBeFalsy();
    });

    describe('areAllChecked', () => {
      it('should return false if no selection', () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.areAllChecked).toBeFalsy();
      });

      it('should return false if some selected', () => {
        const instance = shallowMount(Component, options);
        instance.setData({ checkedRows: [0] });

        expect(instance.vm.areAllChecked).toBeFalsy();
      });

      it('should check all if param equal true', () => {
        const instance = shallowMount(Component, options);
        instance.setData({ areAllChecked: true });

        expect(instance.vm.areAllChecked).toBeTruthy();
      });

      it('should uncheck all if param equal false', () => {
        const instance = shallowMount(Component, options);
        instance.setData({ areAllChecked: false });

        expect(instance.vm.areAllChecked).toBeFalsy();
      });
    });

    it('tableClasses should match snapshot', () => {
      const { vm } = shallowMount(Component, options);

      expect(vm.tableClasses).toMatchSnapshot();
    });

    describe('isIndeterminate', () => {
      it('should return false if no selected', () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.isIndeterminate).toBeFalsy();
      });

      it('should return true if some selected', () => {
        const instance = shallowMount(Component, options);
        instance.setData({ checkedRows: [0] });

        expect(instance.vm.isIndeterminate).toBeTruthy();
      });

      it('should return false if all selected', () => {
        const instance = shallowMount(Component, options);
        instance.setData({ checkedRows: [0, 1] });

        expect(instance.vm.isIndeterminate).toBeFalsy();
      });
    });

    describe('isLeftShadowShown', () => {
      it('should be falsy if stickyColumnKey prop falsy', () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.isLeftShadowShown).toBeFalsy();
      });

      it('should return true if stickyColumnKey is true and scrolled', () => {
        options.propsData.stickyColumnKey = 'col1';
        const instance = shallowMount(Component, options);
        instance.setData({ scrolled: 1 });

        expect(instance.vm.isLeftShadowShown).toBeTruthy();
      });

      it('should return false if stickyColumnKey is true and no scrolled', () => {
        options.propsData.stickyColumnKey = 'col1';
        const instance = shallowMount(Component, options);

        expect(instance.vm.isLeftShadowShown).toBeFalsy();
      });
    });

    describe('isRightShadowShown', () => {
      it('should be falsy if stickyColumnKey prop falsy', () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.isRightShadowShown).toBeFalsy();
      });

      it('should return true if stickyColumnKey is true and no tableClass', () => {
        options.propsData.stickyColumnKey = 'col1';
        const instance = shallowMount(Component, options);

        expect(instance.vm.isRightShadowShown).toBeTruthy();
      });

      it('should return false if stickyColumnKey is true and has correctly tableClass', () => {
        options.propsData.stickyColumnKey = 'col1';
        const instance = shallowMount(Component, options);

        instance.vm.$refs.QTable = { offsetWidth: 10 };
        instance.setData({ scrolled: 10 });

        expect(instance.vm.isRightShadowShown).toBeFalsy();
      });
    });

    describe('tableClass', () => {
      it("should return 'scrolled-left' if didn't scrolled", () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.tableClass).toEqual('scrolled-left');
      });

      it("should return 'scrolled-center' if a little bit scrolled", () => {
        const instance = shallowMount(Component, options);
        instance.setData({ scrolled: 1 });

        expect(instance.vm.tableClass).toEqual('scrolled-center');
      });

      it("should return 'scrolled-right' if completely scrolled", () => {
        const instance = shallowMount(Component, options);

        instance.vm.$refs.QTable = { offsetWidth: 10 };

        instance.setData({ scrolled: 10 });

        expect(instance.vm.tableClass).toEqual('scrolled-right');
      });
    });

    it('computedRows should return updated rows', () => {
      const { vm } = shallowMount(Component, options);

      expect(vm.computedRows).toMatchSnapshot();
    });
  });

  describe('watch', () => {
    it('isLoading should trigger isLoadingAnimationComplete twice', () => {
      options.propsData.isLoading = true;
      const instance = shallowMount(Component, options);

      instance.setProps({
        isLoading: false
      });

      jest.useFakeTimers();

      instance.vm.$nextTick(() => {
        expect(instance.vm.isLoadingAnimationComplete).toBeFalsy();

        jest.runAllTimers();
        expect(instance.vm.isLoadingAnimationComplete).toBeTruthy();
      });
    });
  });

  describe('methods', () => {
    it('updateChildrenRows should return updated rows', () => {
      const { vm } = shallowMount(Component, options);

      const updatedChilds = vm.updateChildrenRows(
        [{ key: 'child key' }],
        { key: 'key' },
        {
          data: {
            key: 'key'
          },
          treeIndex: 1
        }
      );

      expect(updatedChilds).toEqual([
        {
          data: { key: 'child key' },
          indent: 16,
          parentRow: { key: 'key' },
          treeIndex: 1
        }
      ]);
    });

    it('handleHeaderClick should call setSort', () => {
      const { vm } = shallowMount(Component, options);
      const spy = jest.spyOn(vm, 'setSort');

      vm.handleHeaderClick({
        key: 'col1',
        sortable: true
      });

      expect(spy).toBeCalled();
    });

    it('findSlotForRow should find slot for row', () => {
      const { vm } = shallowMount(Component, options);

      expect(vm.findSlotForRow('col1')).toEqual('row-slot');
    });

    describe('handleRowCheck', () => {
      it('should add row index to checked array', () => {
        const { vm } = shallowMount(Component, options);

        vm.handleRowCheck({ isChecked: true, rowIndex: 0 });

        expect(vm.checkedRows).toEqual([0]);
      });

      it('should remove row index from checked array', () => {
        const instance = shallowMount(Component, options);
        instance.setData({
          checkedRows: [0]
        });

        instance.vm.handleRowCheck({ isChecked: false, rowIndex: 0 });

        expect(instance.vm.checkedRows).toEqual([]);
      });
    });

    describe('setSort', () => {
      it('should process passed direction', () => {
        const instance = shallowMount(Component, options);

        instance.vm.setSort('col1', 'descending');

        expect(instance.emitted()['change-sort']).toEqual([
          [
            {
              direction: 'descending',
              key: 'col1'
            }
          ]
        ]);
      });

      it('should process new key in sort', () => {
        const instance = shallowMount(Component, options);

        instance.vm.setSort('col1');

        expect(instance.emitted()['change-sort']).toEqual([
          [
            {
              direction: 'ascending',
              key: 'col1'
            }
          ]
        ]);
      });

      it('should process existed key in sort if no direction', () => {
        const instance = shallowMount(Component, options);

        instance.setData({
          sort: {
            key: 'col1',
            direction: null
          }
        });
        instance.vm.setSort('col1');

        expect(instance.emitted()['change-sort']).toEqual([
          [
            {
              direction: 'ascending',
              key: 'col1'
            }
          ]
        ]);
      });

      it('should process existed key in sort with opposite direction', () => {
        const instance = shallowMount(Component, options);

        instance.setData({
          sort: {
            key: 'col1',
            direction: 'ascending'
          }
        });
        instance.vm.setSort('col1');

        expect(instance.emitted()['change-sort']).toEqual([
          [
            {
              direction: 'descending',
              key: 'col1'
            }
          ]
        ]);
      });

      it('should process existed key in sort with descending direction', () => {
        const instance = shallowMount(Component, options);

        instance.setData({
          sort: {
            key: 'col1',
            direction: 'descending'
          }
        });
        instance.vm.setSort('col1');

        expect(instance.emitted()['change-sort']).toEqual([
          [
            {
              direction: null,
              key: 'col1'
            }
          ]
        ]);
      });
    });

    describe('handleExpandClick', () => {
      it('should open minimized row', () => {
        const { vm } = shallowMount(Component, options);
        const testedRowIndex = 0;
        vm.handleExpandClick(vm.treeRows[testedRowIndex]);

        expect(vm.treeRows[testedRowIndex].isTreeOpened).toBeTruthy();
      });

      it('should close expanded row', () => {
        const { vm } = shallowMount(Component, options);

        const testedRowIndex = 0;
        vm.treeRows[testedRowIndex].isTreeOpened = true;
        vm.handleExpandClick(vm.treeRows[testedRowIndex]);

        expect(vm.treeRows[testedRowIndex].isTreeOpened).toBeFalsy();
      });
    });

    describe('findScopedRow', () => {
      it('should return current row', () => {
        const { vm } = shallowMount(Component, options);
        const testedRow = { someKey: 'row' };

        expect(vm.findScopedRow(testedRow, 'someKey', 'row')).toEqual(
          testedRow
        );
      });

      it('should process row without children', () => {
        const { vm } = shallowMount(Component, options);
        const testedRow = { someKey: 'row' };

        expect(vm.findScopedRow(testedRow, 'someKey', 'key')).toEqual(null);
      });

      it('should process row with children', () => {
        const { vm } = shallowMount(Component, options);
        const testedRow = {
          someKey: 'row',
          children: [
            {
              someKey: 'child row'
            }
          ]
        };

        expect(vm.findScopedRow(testedRow, 'someKey', 'child row')).toEqual(
          testedRow.children[0]
        );
      });
    });

    describe('changeColumnsOrder', () => {
      it('should add new children', () => {
        options.propsData.groupsOfColumns[0];
        const instance = shallowMount(Component, options);
        instance.vm.changeColumnsOrder(
          { newPositionIndex: 0, oldPositionIndex: 1 },
          'group-key'
        );

        expect(
          instance.emitted()['change-order'][0][0][0].columns[0].key
        ).toEqual('col2');
      });
    });
  });
});
