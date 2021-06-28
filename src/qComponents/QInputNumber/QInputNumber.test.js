import Component from './src/QInputNumber';

describe('QInputNumber', () => {
  it('should match snapshot', () => {
    const { element } = shallowMount(Component);

    expect(element).toMatchSnapshot();
  });

  it('should match snapshot without controls', () => {
    const { element } = shallowMount(Component, {
      propsData: {
        controls: false
      }
    });

    expect(element).toMatchSnapshot();
  });

  describe('computed', () => {
    it('increaseClass', async () => {
      const instance = shallowMount(Component, {
        propsData: {
          value: 9007199254740992
        }
      });

      expect(instance.vm.increaseClass).toEqual(
        'q-input-number__button_is-disabled'
      );
    });

    it('decreaseClass', async () => {
      const instance = shallowMount(Component, {
        propsData: {
          value: -9007199254740992
        }
      });

      expect(instance.vm.decreaseClass).toEqual(
        'q-input-number__button_is-disabled'
      );
    });
  });

  describe('methods', () => {
    describe('handleChangeNumberButtonClick', () => {
      it('increase', () => {
        const instance = shallowMount(Component, {
          propsData: {
            value: 0
          }
        });
        instance.vm.handleChangeNumberButtonClick(true);

        expect(instance.emitted().change[0]).toEqual([1]);
      });

      it('decrease', () => {
        const instance = shallowMount(Component, {
          propsData: {
            value: 0
          }
        });
        instance.vm.handleChangeNumberButtonClick();

        expect(instance.emitted().change[0]).toEqual([-1]);
      });
    });

    describe('getLocaleSeparator', () => {
      it('should return decimal', () => {
        const { vm } = shallowMount(Component);

        expect(vm.getLocaleSeparator('decimal')).toEqual('.');
      });

      it('should return thousands', () => {
        const { vm } = shallowMount(Component);

        expect(vm.getLocaleSeparator()).toEqual(',');
      });
    });

    it('parseLocaleNumber', () => {
      const { vm } = shallowMount(Component);

      expect(vm.parseLocaleNumber('123,123.0')).toEqual(123123);
    });

    describe('getLocaleSeparator', () => {
      it('should return 2 parts', () => {
        const { vm } = shallowMount(Component);

        expect(vm.getFormattedPartsLength('1,120,120', 5)).toEqual(2);
      });

      it('should return 1 part', () => {
        const { vm } = shallowMount(Component);

        expect(vm.getFormattedPartsLength('1,234', 1)).toEqual(1);
      });
    });

    describe('checkStringAdditions', () => {
      it('should return prefix', () => {
        const { vm } = shallowMount(Component, {
          propsData: {
            prefix: '>'
          }
        });

        expect(vm.checkStringAdditions('>1120<', 'prefix')).toBeTruthy();
      });

      it('should return suffix', () => {
        const { vm } = shallowMount(Component, {
          propsData: {
            suffix: '<'
          }
        });

        expect(vm.checkStringAdditions('>1120<', 'suffix')).toBeTruthy();
      });
    });

    it('getValueWithoutAdditions', () => {
      const { vm } = shallowMount(Component, {
        propsData: {
          prefix: '>',
          suffix: '<'
        }
      });

      expect(vm.getValueWithoutAdditions('>1120<')).toEqual('1120');
    });

    describe('isCharReadonly', () => {
      it('should return false if char is number', () => {
        const { vm } = shallowMount(Component);

        expect(vm.isCharReadonly('1')).toBeFalsy();
      });

      it('should return true if char is -', () => {
        const { vm } = shallowMount(Component);

        expect(vm.isCharReadonly('.')).toBeTruthy();
      });
    });
  });
});
