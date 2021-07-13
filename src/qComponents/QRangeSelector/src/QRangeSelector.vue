<template>
  <div
    class="q-range-selector"
    :class="{ 'is-vertical': vertical }"
  >
    <div
      ref="path"
      class="q-range-selector__path"
      @click="onPathClick"
    >
      <div
        class="q-range-selector__bar"
        :style="barStyle"
      />

      <range-selector-button
        :tab-index="0"
        :value="firstValue"
        :opposite-value="secondValue"
        @drag-moving="handleDragMoving"
        @position-change="changeButtonPosition"
      />

      <range-selector-button
        v-if="range && secondValue"
        :tab-index="1"
        :value="secondValue"
        :opposite-value="firstValue"
        @drag-moving="handleDragMoving"
        @position-change="changeButtonPosition"
      />

      <template v-if="showSteps">
        <div
          v-for="(item, key) in steps"
          :key="key"
          class="q-range-selector__step"
          :style="getStopStyle(item)"
        />
      </template>

      <template v-if="captionsList">
        <div
          v-for="(item, key) in captionsList"
          :key="key"
          class="q-range-selector__caption"
          :style="getStopStyle(item.position)"
        >
          {{ item.value }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import RangeSelectorButton from './components/RangeSelectorButton';

export default {
  name: 'QRangeSelector',

  components: {
    RangeSelectorButton
  },

  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    step: {
      type: Number,
      default: 1,
      validator: value => value > 0
    },
    value: {
      type: [Number, String, Array],
      default: 0
    },
    showSteps: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    stickToSteps: {
      type: Boolean,
      default: false
    },
    captions: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      firstValue: null,
      secondValue: null
    };
  },

  computed: {
    precision() {
      let e = 1;
      let p = 0;
      while (Math.round(this.step * e) / e !== this.step) {
        e *= 10;
        p += 1;
      }
      return p;
    },

    captionsList() {
      return Object.entries(this.captions).map(([key, value]) => ({
        position: Number(key),
        value
      }));
    },

    firstPercent() {
      const value = this.firstValue;

      let left =
        value > this.max
          ? 100
          : (100 * (value - this.min)) / (this.max - this.min);

      if (value < this.min) left = 0;

      return left.toFixed(3);
    },

    secondPercent() {
      if (!this.range) return null;

      const value = this.secondValue;

      let left =
        value > this.max
          ? 100
          : (100 * (value - this.min)) / (this.max - this.min);

      if (value < this.min) left = 0;

      return left.toFixed(3);
    },

    barStyle() {
      if (this.vertical) {
        return {
          height: this.secondPercent
            ? `${this.secondPercent - this.firstPercent}%`
            : `${this.firstPercent}%`,
          bottom: this.range ? `${this.firstPercent}%` : 0
        };
      }
      return {
        width: this.secondPercent
          ? `${this.secondPercent - this.firstPercent}%`
          : `${this.firstPercent}%`,
        left: this.range ? `${this.firstPercent}%` : 0
      };
    },

    steps() {
      if (this.min > this.max) return [];

      const stepsCount = (this.max - this.min) / this.step;
      const stepWidth = (100 * this.step) / (this.max - this.min);

      return Array.from({ length: stepsCount + 1 }, (_, i) => i * stepWidth);
    }
  },

  watch: {
    value: {
      handler() {
        this.getValues();
      },
      immediate: true
    }
  },

  mounted() {
    this.getValues();
  },

  methods: {
    getValues() {
      if (!this.range) {
        this.firstValue = Array.isArray(this.value)
          ? this.value[0]
          : this.value;
        this.secondValue = null;
        return;
      }
      if (Array.isArray(this.value)) {
        this.firstValue = Math.max(this.min, this.value[0]);
        this.secondValue = Math.min(this.max, this.value[1]);
        return;
      }

      this.firstValue = Math.max(this.min, this.value);
      this.secondValue = this.max;
    },

    onPathClick(event) {
      const { left, bottom, width, height } = this.getPathSize();
      const newValue = this.vertical
        ? ((bottom - event.clientY) / height) * 100
        : ((event.clientX - left) / width) * 100;

      let targetValue = this.stickToSteps
        ? this.steps
            .reduce((a, b) => {
              return Math.abs(b - newValue) < Math.abs(a - newValue) ? b : a;
            })
            .toFixed(this.precision)
        : newValue.toFixed(this.precision);

      if (!this.range) {
        if (targetValue > this.max) targetValue = this.max;
        if (targetValue < this.min) targetValue = this.min;

        this.changesEmmiter(targetValue);
        return;
      }

      let isFirstButtonChanged = true;

      if (
        Math.abs(this.firstValue - targetValue) <
        Math.abs(this.secondValue - targetValue)
      ) {
        isFirstButtonChanged = this.firstValue < this.secondValue;
      } else {
        isFirstButtonChanged = this.firstValue > this.secondValue;
      }

      if (
        (isFirstButtonChanged && targetValue > this.secondValue) ||
        (!isFirstButtonChanged && targetValue < this.firstValue)
      )
        return;

      const newValues = isFirstButtonChanged
        ? [targetValue, this.secondValue]
        : [this.firstValue, targetValue];

      this.changesEmmiter(newValues);
    },

    getPathSize() {
      const {
        left,
        bottom,
        width,
        height
      } = this.$refs.path.getBoundingClientRect();

      return {
        left,
        bottom,
        width,
        height
      };
    },

    getStopStyle(position) {
      if (this.vertical) return { bottom: `${position}%` };

      return { left: `${position}%` };
    },

    handleDragMoving({ newValue, tabIndex }) {
      if (tabIndex === 0) {
        this.firstValue = newValue.toFixed(this.precision);
        return;
      }

      this.secondValue = newValue.toFixed(this.precision);
    },

    changesEmmiter(newValue) {
      this.$emit('input', newValue);
      this.$emit('change', newValue);
    },

    changeButtonPosition({ newValue, tabIndex }) {
      const fixedNewValue = newValue.toFixed(this.precision);

      const passedData =
        tabIndex === 0
          ? [Math.max(this.min, fixedNewValue), this.secondValue]
          : [this.firstValue, Math.min(this.max, fixedNewValue)];

      this.changesEmmiter(this.range ? passedData : fixedNewValue);
    }
  }
};
</script>
