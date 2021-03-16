import QInputNumber from '../../src/qComponents/QInputNumber';

export default {
  title: 'Components/QInputNumber',
  component: QInputNumber,
  argTypes: {
    value: {
      control: {
        type: 'none'
      }
    }
  }
};

export const Default = (_, { argTypes }) => ({
  props: Object.keys(argTypes).filter(val => val !== 'value'),
  data() {
    return {
      value: 1234
    };
  },
  methods: {
    handleEmit(value, type) {
      console.log(value, type);
    }
  },
  template: `
    <q-input-number 
      v-bind="$props" 
      v-model="value"
      prefix=">"
      suffix="<"
      :precision="2"
      use-grouping
      @input="handleEmit($event, 'input')"
      @change="handleEmit($event, 'change')"
    >
      <template #suffix>123</template>
    </q-input-number>
  `
});

Default.storyName = 'Default';
