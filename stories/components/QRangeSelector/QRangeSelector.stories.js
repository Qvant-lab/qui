import QRangeSelector from '../../../src/qComponents/QRangeSelector';

import Default from './Default';
import Range from './Range';
import WithoutTooltip from './WithoutTooltip';
import Vertical from './Vertical';
import Breakpoints from './Breakpoints';
import StickToSteps from './StickToSteps';
import Captions from './Captions';

export default {
  title: 'Components/QRangeSelector',
  component: QRangeSelector,

  decorators: [
    () => ({ template: '<div style="width: 80vw;"><story /></div>' })
  ],

  argTypes: {
    value: {
      control: {
        type: 'text'
      }
    },
    min: {
      control: {
        type: 'number'
      }
    },
    max: {
      control: {
        type: 'number'
      }
    }
  },

  args: {
    value: [25, 75],
    captions: {
      10: '>10<',
      25: '!25!',
      60: '45+15',
      100: 'max'
    }
  }
};

export {
  Default,
  Range,
  WithoutTooltip,
  Vertical,
  Breakpoints,
  StickToSteps,
  Captions
};
