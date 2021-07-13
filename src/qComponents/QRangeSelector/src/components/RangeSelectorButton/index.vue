<template>
  <div
    :tabindex="tabIndex"
    class="q-range-selector__button-wrapper focus-visible"
    :class="{ 'q-range-selector__button-wrapper_focused': isFocused }"
    :style="stylePosition"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown.left="onArrowDown"
    @keydown.right="onArrowDown"
    @keydown.down.prevent="onArrowDown"
    @keydown.up.prevent="onArrowDown"
    @mousedown.stop="handleButtonDrag"
  >
    <div class="q-range-selector__button" />
    <div
      v-if="$parent.showTooltip"
      class="q-range-selector__tooltip"
    >
      {{ value }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'RangeSelectorButton',

  props: {
    tabIndex: {
      type: Number,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    oppositeValue: {
      type: [Number, String],
      default: null
    }
  },

  data() {
    return {
      isFocused: false,
      position: null
    };
  },

  computed: {
    buttonStyle() {
      if (this.$parent.vertical) return { bottom: `${this.position}%` };

      return { left: `${this.position}%` };
    },

    stylePosition() {
      if (this.$parent.vertical) return { bottom: `${this.position}%` };

      return { left: `${this.position}%` };
    }
  },

  watch: {
    value: {
      handler(val) {
        this.position = val;
      },
      immediate: true
    }
  },

  methods: {
    emitChanges() {
      this.$emit('position-change', {
        newValue: this.position,
        tabIndex: this.tabIndex
      });
    },

    handleFocus() {
      this.isFocused = true;
    },

    handleBlur() {
      this.isFocused = false;
    },

    onArrowDown({ key }) {
      const step =
        key === 'ArrowLeft' || key === 'ArrowDown'
          ? this.$parent.step * -1
          : this.$parent.step;

      const newPosition = this.position + step;

      console.log(
        this.$parent.range,
        this.tabIndex === 0,
        newPosition > this.oppositeValue
      );

      if (
        (this.$parent.range &&
          this.tabIndex === 0 &&
          newPosition > this.oppositeValue) ||
        (this.tabIndex === 1 && newPosition < this.oppositeValue)
      )
        return;

      if (newPosition < this.$parent.min) {
        this.position = this.$parent.min;
      } else if (newPosition > this.$parent.max) {
        this.position = this.$parent.max;
      } else {
        this.position = newPosition;
      }

      this.emitChanges();
    },

    handleButtonDrag() {
      document.addEventListener('mousemove', this.handleButtonMoving);
      document.addEventListener('mouseup', this.handleButtonMovingEnd);
    },

    handleButtonMoving({ clientY, clientX }) {
      const { left, bottom, width, height } = this.$parent.getPathSize();

      const newPosition = this.$parent.vertical
        ? ((bottom - clientY) / height) * 100
        : ((clientX - left) / width) * 100;

      const targetValue = this.$parent.stickToSteps
        ? this.$parent.steps.reduce((a, b) => {
            return Math.abs(b - newPosition) < Math.abs(a - newPosition)
              ? b
              : a;
          })
        : newPosition;

      if (this.$parent.range) {
        if (
          (this.tabIndex === 0 && targetValue > this.oppositeValue) ||
          (this.tabIndex === 1 && targetValue < this.oppositeValue)
        )
          return;

        this.position =
          this.tabIndex === 0
            ? Math.max(this.$parent.min, targetValue)
            : Math.min(this.$parent.max, targetValue);

        this.$emit('drag-moving', {
          newValue: this.position,
          tabIndex: this.tabIndex
        });
        return;
      }

      if (targetValue < this.$parent.min) {
        this.position = this.$parent.min;
      } else if (targetValue > this.$parent.max) {
        this.position = this.$parent.max;
      } else {
        this.position = targetValue;
      }

      this.$emit('drag-moving', {
        newValue: this.position,
        tabIndex: this.tabIndex
      });
    },

    handleButtonMovingEnd() {
      document.removeEventListener('mousemove', this.handleButtonMoving);
      document.removeEventListener('mouseup', this.handleButtonMovingEnd);
      this.emitChanges();
    }
  }
};
</script>
