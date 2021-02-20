import Component from './index';

describe('QTableRow', () => {
  let options;

  beforeEach(() => {
    options = {
      propsData: {
        rowIndex: 0,
        selectable: true,
        row: {
          data: {
            col1: 'Col 1 row 1',
            col2: 'Col 2 row 1',
            col3: 'Col 3 row 1'
          }
        },
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
          },
          {
            key: 'col3',
            value: 'Column 3'
          }
        ]
      }
    };
  });

  it('QTableRow should match snapshot', () => {
    const { element } = shallowMount(Component, options);

    expect(element).toMatchSnapshot();
  });

  describe('computed', () => {
    describe('isChecked', () => {
      it('should be falsy by default', () => {
        const { vm } = shallowMount(Component, options);

        expect(vm.isChecked).toBeFalsy();
      });

      it('should emit checked data', () => {
        const instance = shallowMount(Component, options);
        const testData = true;

        instance.setData({ isChecked: testData });

        expect(instance.emitted('check')[0]).toEqual([
          {
            isChecked: testData,
            row: {
              data: {
                col1: 'Col 1 row 1',
                col2: 'Col 2 row 1',
                col3: 'Col 3 row 1'
              }
            },
            rowIndex: 0
          }
        ]);
      });
    });

    describe('rowClass', () => {
      it('should process data to build class witout indent', () => {
        const classSpy = jest.fn(() => 'custom_class');
        const clickSpy = jest.fn();
        options.propsData = {
          ...options.propsData,
          customRowClass: classSpy,
          rowClick: clickSpy
        };

        const { vm } = shallowMount(Component, options);
        expect(vm.rowClass).toEqual({
          'q-table__row_is-interactive': true,
          custom_class: true
        });
      });

      it('should process data to build class with indent', () => {
        const classSpy = jest.fn(() => 'custom_class');
        const clickSpy = jest.fn();
        options.propsData = {
          ...options.propsData,
          customRowClass: classSpy,
          rowClick: clickSpy,
          indentSize: 2,
          indent: 12
        };

        const { vm } = shallowMount(Component, options);
        expect(vm.rowClass).toEqual({
          'q-table__row_is-interactive': true,
          custom_class: true,
          'q-table__row-level-6': true
        });
      });
    });
  });

  describe('methods', () => {
    it('updateRow should call formatter', () => {
      const { vm } = shallowMount(Component, options);
      const spy = jest.fn();
      const testedColumn = {
        formatter: spy
      };

      vm.updateRow({}, {}, {}, testedColumn);

      expect(spy).toBeCalled();
    });
  });
});
