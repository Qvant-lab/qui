<template>
  <div :class="inputNumberClass">
    <button
      v-if="controls"
      class="q-input-number__button_decrease q-input-number__button q-icon-minus"
      :disabled="isDisabled"
      :class="decreaseClass"
      @click.prevent="handleChangeNumberButtonClick()"
    />

    <q-input
      ref="input"
      :value="formattedValue"
      class="q-input-number__input"
      :disabled="isDisabled"
      :placeholder="placeholder"
      :validate-event="false"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown.native="handleKeydown"
      @click.native="handleClick"
      @keypress.prevent.native="onInputKeyPress"
      @paste.prevent.native="handlePaste"
    />

    <button
      v-if="controls"
      class="q-input-number__button_increase q-input-number__button q-icon-plus"
      :disabled="isDisabled"
      :class="increaseClass"
      @click.prevent="handleChangeNumberButtonClick(true)"
    />
  </div>
</template>

<script>
export default {
  name: 'QInputNumber',
  componentName: 'QInputNumber',

  inject: {
    qForm: {
      default: null
    },
    qFormItem: {
      default: null
    }
  },

  props: {
    /**
     * the minimum allowed value
     */
    min: {
      type: Number,
      default: Number.MIN_SAFE_INTEGER
    },

    /**
     * the maximum allowed value
     */
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },

    /**
     * incremental step
     */
    step: {
      type: Number,
      default: 1
    },

    /**
     * precision of input value
     */
    precision: {
      type: Number,
      default: 0
    },
    /**
     * whether the component is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * whether to enable the control buttons
     */
    controls: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: null
    },
    value: {
      type: [Number, String],
      default: null,
      validator: value => {
        if (!Number.isNaN(Number(value)) || value === null) return true;

        return false;
      }
    },
    validateEvent: {
      type: Boolean,
      default: true
    },
    /**
     * `String` before number
     */
    prefix: {
      type: String,
      default: null
    },
    /**
     * `String` after number
     */
    suffix: {
      type: String,
      default: null
    },
    /**
     * BCP47 language identifier
     */
    localization: {
      type: String,
      default: null
    },
    useGrouping: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isDisabled() {
      return this.disabled || (this.qForm?.disabled ?? false);
    },

    inputNumberClass() {
      return {
        'q-input-number': true,
        'q-input-number_with-controls': this.controls
      };
    },

    increaseClass() {
      const number = this.parsedNumber;

      if (number >= this.max) {
        return 'q-input-number__button_is-disabled';
      }

      return '';
    },

    decreaseClass() {
      const number = this.parsedNumber;

      if (number <= this.min) {
        return 'q-input-number__button_is-disabled';
      }

      return '';
    },

    localizationTag() {
      return this.localization ?? this.$Q?.locale ?? 'en';
    },

    localeFormat() {
      return Intl.NumberFormat(this.localizationTag, {
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.precision
      }).format;
    },

    formattedValue() {
      const prefix = this.prefix ?? '';
      const suffix = this.suffix ?? '';
      const value = this.localeFormat(this.value);

      return this.value !== null ? `${prefix}${value}${suffix}` : '';
    },

    parsedNumber() {
      return this.formattedValue
        ? this.parseLocaleNumber(
            this.getValueWithoutAdditions(this.formattedValue)
          )
        : 0;
    },

    prefixLength() {
      return this.prefix?.length ?? 0;
    },

    suffixLength() {
      return this.suffix?.length ?? 0;
    }
  },

  methods: {
    setCursorPosition(target, position) {
      target.setSelectionRange(position, position);
    },

    getLocaleSeparator(type) {
      return Intl.NumberFormat(this.localizationTag)
        .format(type === 'decimal' ? 1.1 : 11111)
        .replace(/\p{Number}/gu, '');
    },

    parseLocaleNumber(stringNumber) {
      return parseFloat(
        stringNumber
          .replace(new RegExp(`\\${this.getLocaleSeparator()}`, 'g'), '')
          .replace(new RegExp(`\\${this.getLocaleSeparator('decimal')}`), '.')
      );
    },

    getFormattedPartsLength(value, caretPos) {
      return value.slice(0, caretPos).split(this.getLocaleSeparator()).length;
    },

    checkStringAdditions(value, addition) {
      const position = String(value).indexOf(this[addition]);
      const expectedPosition =
        addition === 'suffix'
          ? String(value).length - this[addition].length
          : 0;

      return position === expectedPosition;
    },

    getValueWithoutAdditions(value) {
      if (!value) return value;

      const prefixReg = new RegExp(`^${this.prefix}`, 'g');
      const suffixReg = new RegExp(`${this.suffix}$`, 'g');

      let newValue = value;

      if (this.prefix && this.checkStringAdditions(newValue, 'prefix'))
        newValue = newValue.replace(prefixReg, '');

      if (this.suffix && this.checkStringAdditions(newValue, 'suffix'))
        newValue = newValue.replace(suffixReg, '');

      return newValue;
    },

    isCharReadonly(char) {
      return Number.isNaN(Number(char)) && char !== '-';
    },

    getCleanSelections({ value, selectionStart, selectionEnd }) {
      const selectionNewStart =
        selectionStart <= this.prefixLength
          ? this.prefixLength
          : selectionStart;

      const selectionNewEnd =
        selectionEnd >= value.length - this.suffixLength
          ? value.length - this.suffixLength
          : selectionEnd;

      return {
        selectionNewStart,
        selectionNewEnd,
        value: this.getValueWithoutAdditions(value)
      };
    },

    handleClick(event) {
      const { input } = this.$refs.input.$refs;
      const { value, selectionStart, selectionEnd } = input;

      if (selectionStart !== selectionEnd) {
        event.preventDefault();
        return;
      }

      if (selectionStart < this.prefixLength + 1) {
        this.setCursorPosition(input, this.prefixLength);
      } else if (selectionStart > value.length - this.suffixLength - 1) {
        this.setCursorPosition(input, value.length - this.suffixLength);
      }
    },

    handlePaste(event) {
      const data = (event.clipboardData || window.clipboardData).getData(
        'Text'
      );

      this.insertPasteText(event, data);
    },

    onInputKeyPress(event) {
      if (
        Number.isNaN(Number(event.key)) &&
        event.key !== '-' &&
        event.key !== '.' &&
        event.key !== ','
      )
        return;

      const {
        value,
        selectionNewStart,
        selectionNewEnd
      } = this.getCleanSelections(event.target);

      if (event.key === '-') {
        if (
          !this.formattedValue ||
          selectionNewEnd - selectionNewStart === value.length
        ) {
          this.$refs.input.$refs.input.value = '-';
        } else if (selectionNewStart === 1) {
          this.insertText(event, event.key);
        }

        return;
      }

      this.insertText(event, event.key);
    },

    handleKeydown(event) {
      const { value, selectionStart, selectionEnd } = event.target;

      switch (event.key) {
        case 'Backspace':
        case 'Delete':
          event.preventDefault();
          this.insertText(event, event.key);
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          if (
            (event.key === 'ArrowLeft' &&
              selectionStart < this.prefixLength + 1) ||
            (event.key === 'ArrowRight' &&
              selectionEnd > value.length - this.suffixLength - 1)
          ) {
            event.preventDefault();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.setCursorPosition(event.target, this.prefixLength);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.setCursorPosition(
            event.target,
            value.length - this.suffixLength
          );
          break;
        default:
          break;
      }
    },

    insertPasteText(event, text) {
      const parsedText = this.parseLocaleNumber(
        this.getValueWithoutAdditions(text)
      );
      if (Number.isNaN(Number(parsedText))) return;

      const { selectionStart, selectionEnd } = event.target;

      const previousPart = this.getValueWithoutAdditions(
        this.formattedValue.substring(0, selectionStart)
      );
      const lastPart = this.getValueWithoutAdditions(
        this.formattedValue.substring(selectionEnd)
      );

      const newValue = this.parseLocaleNumber(
        `${previousPart}${parsedText}${lastPart}`
      );

      this.updateInput(
        event.target,
        newValue.toFixed(this.precision),
        selectionEnd
      );
    },

    getSelectionsAndInsertedValue() {},

    insertText(event, key) {
      const { selectionStart } = event.target;

      const {
        value,
        selectionNewStart,
        selectionNewEnd
      } = this.getCleanSelections(event.target);

      let movedSelectionEnd = selectionNewEnd;

      let moveSelection = 0;
      let insertedValue = '';

      const previousPart = this.getValueWithoutAdditions(
        this.formattedValue.substring(0, selectionNewStart)
      );
      const lastPart = this.getValueWithoutAdditions(
        this.formattedValue.substring(movedSelectionEnd)
      );

      if (
        (key === 'Backspace' && !previousPart.length) ||
        (key === 'Delete' && !lastPart.length)
      ) {
        if (movedSelectionEnd - selectionNewStart === value.length) {
          this.updateInput(event.target, null, movedSelectionEnd);
        }

        if (value === '-') {
          this.$refs.input.$refs.input.value = '';
        }

        return;
      }

      const prevChar = previousPart.substring(previousPart.length - 1);
      const nextChar = lastPart.substring(1, -1);

      if (key === this.getLocaleSeparator('decimal')) {
        if (nextChar === this.getLocaleSeparator('decimal'))
          this.setCursorPosition(event.target, selectionStart + 1);

        return;
      }

      if (key === '-' && nextChar === key) return;

      switch (key) {
        case 'Backspace':
          moveSelection = this.isCharReadonly(prevChar) ? -2 : -1;
          movedSelectionEnd -= this.isCharReadonly(prevChar) ? 1 : 0;
          break;
        case 'Delete':
          moveSelection = this.isCharReadonly(nextChar) ? 1 : 0;
          movedSelectionEnd += this.isCharReadonly(nextChar) ? 2 : 1;
          break;
        default:
          insertedValue = key;
          break;
      }

      if (insertedValue && !this.formattedValue) {
        this.updateInput(
          event.target,
          Number(key * -1).toFixed(this.precision),
          movedSelectionEnd
        );
        return;
      }

      this.updateValue(
        event,
        selectionNewStart + moveSelection,
        movedSelectionEnd,
        insertedValue,
        key
      );
    },

    updateValue(event, selectionStart, selectionEnd, insertedValue, key) {
      const { target } = event;
      const { value } = target;

      const valueSeparatedParts = [
        value.substring(this.prefixLength, selectionStart),
        value.substring(selectionEnd, value.length - this.suffixLength)
      ];

      if (
        !valueSeparatedParts[0] &&
        valueSeparatedParts[1].substring(1, -1) ===
          this.getLocaleSeparator('decimal')
      ) {
        this.updateInput(event.target, null, selectionEnd);
        return;
      }

      const newValue = this.parseLocaleNumber(
        `${valueSeparatedParts[0]}${insertedValue}${valueSeparatedParts[1]}`
      );

      if (newValue > this.max || newValue < this.min) return;

      this.updateInput(
        event.target,
        newValue.toFixed(this.precision),
        selectionEnd,
        newValue < 0 || key === '-'
      );
    },

    updateInput(target, newValue, selectionEnd, isMinusSign) {
      if (newValue === null) {
        this.changesEmmiter(null);
        return;
      }

      const minusZero = Number(newValue) === 0 && isMinusSign;

      const prefix = this.prefix ?? '';
      const suffix = this.suffix ?? '';
      const value = this.localeFormat(minusZero ? -0 : newValue);

      const formattedValue = `${prefix}${value}${suffix}`;

      const newLength = formattedValue.length;
      const newCaretPosition =
        target.value.length > 1
          ? selectionEnd + (newLength - target.value.length || 1)
          : target.value.length + this.prefixLength + 1;

      this.$refs.input.$refs.input.value = formattedValue;

      this.changesEmmiter(Number(minusZero ? -0 : newValue));

      let movedCaret = newCaretPosition;

      if (newCaretPosition < this.prefixLength) {
        movedCaret = this.prefixLength;
      } else if (newCaretPosition > formattedValue.length - this.prefixLength) {
        movedCaret = formattedValue.length - this.prefixLength;
      }

      this.setCursorPosition(target, movedCaret);
    },

    handleChangeNumberButtonClick(isIncrease) {
      let updatedNumber = this.parsedNumber;
      const step = isIncrease ? this.step : -this.step;

      updatedNumber = Math.round((updatedNumber + step) * 100) / 100;

      if ((isIncrease && updatedNumber > this.max) || updatedNumber < this.min)
        return;

      this.changesEmmiter(updatedNumber, 'change');
    },

    handleBlur(event) {
      this.$emit('blur', event);

      const { value } = event.target;

      const emittedValue =
        !value || value === '-'
          ? null
          : this.parseLocaleNumber(
              this.getValueWithoutAdditions(event.target.value)
            );

      this.changesEmmiter(emittedValue, 'change');

      if (this.validateEvent) this.qFormItem?.validateField('blur');
    },

    handleFocus(event) {
      this.$emit('focus', event);
    },

    changesEmmiter(value, type) {
      if (type === 'change') {
        this.$emit('change', value);
        if (this.validateEvent) this.qFormItem?.validateField('change');
        return;
      }

      this.$emit('input', value);
      this.$emit('change', value);
      if (this.validateEvent) this.qFormItem?.validateField('input');
    }
  }
};
</script>
