export default (_, { argTypes }) => ({
  props: Object.keys(argTypes).filter(val => val !== 'value'),
  data() {
    return {
      value: [25, 75]
    };
  },
  template: `
    <q-range-selector 
      v-bind="$props" 
      v-model="value"
      range
    />
  `
});
