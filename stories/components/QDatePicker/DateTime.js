const DateTime = (_, { argTypes }) => ({
  props: Object.keys(argTypes).filter(
    arg => !['value', 'format'].includes(arg)
  ),
  data() {
    return {
      value: null,
      format: 'dd MMMM yyyy'
    };
  },
  methods: {
    handleRangePickClick(val) {
      console.log('handleRangePickClick', val);
    }
  },
  template: `
      <q-date-picker
        v-model="value"
        :clearable="clearable"
        :editable="editable"
        :placeholder="placeholder"
        :type="type"
        :format="format"
        :output-format="outputFormat"
        :name="name"
        :disabled="disabled"
        :disabled-values="disabledValues"
        :shortcuts="shortcuts"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder"
        :first-day-of-week="firstDayOfWeek"
        :range-separator="rangeSeparator"
        :validate-event="validateEvent"
        @rangepick="handleRangePickClick"
        :append-to-body="appendToBody"
      />`
});

DateTime.args = {
  type: 'datetime'
};

export default DateTime;
