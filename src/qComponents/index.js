/* eslint-disable no-underscore-dangle, global-require, no-param-reassign */
import 'focus-visible';
import { kebabCase, isString } from 'lodash-es';
import vClickOutside from 'v-click-outside';
import { version } from '../../package.json';
import { installI18n } from './constants/locales';

import QButton from './QButton';
import QBreadcrumbs from './QBreadcrumbs';
import QCascader from './QCascader';
import QDatePicker from './QDatePicker';
import QTimePicker from './QTimePicker';
import QCheckbox from './QCheckbox';
import QCheckboxGroup from './QCheckboxGroup';
import QRadio from './QRadio';
import QRadioGroup from './QRadioGroup';
import QRow from './QRow';
import QCol from './QCol';
import QCollapse from './QCollapse';
import QCollapseItem from './QCollapseItem';
import QColorPicker from './QColorPicker';
import QContextMenu from './QContextMenu';
import QForm from './QForm';
import QFormItem from './QFormItem';
import QInput from './QInput';
import QInputNumber from './QInputNumber';
import QPagination from './QPagination';
import QPopover from './QPopover';
import QRangeSelector from './QRangeSelector';
import QScrollbar from './QScrollbar';
import QSelect from './QSelect';
import QOption from './QOption';
import QTextarea from './QTextarea';
import QTabs from './QTabs';
import QTabPane from './QTabPane';
import QTag from './QTag';
import QDrawer from './QDrawer';
import QTable from './QTable';
import QUpload from './QUpload';
// modals
import QNotification from './QNotification';
import QDialog from './QDialog';
import QMessageBox from './QMessageBox';

const Components = {
  QBreadcrumbs,
  QButton,
  QCascader,
  QCheckbox,
  QCheckboxGroup,
  QCol,
  QCollapse,
  QCollapseItem,
  QColorPicker,
  QContextMenu,
  QDatePicker,
  QDialog,
  QDrawer,
  QForm,
  QFormItem,
  QInput,
  QInputNumber,
  QMessageBox,
  QNotification,
  QOption,
  QPagination,
  QPopover,
  QRadio,
  QRadioGroup,
  QRangeSelector,
  QRow,
  QScrollbar,
  QSelect,
  QTabPane,
  QTable,
  QTabs,
  QTag,
  QTextarea,
  QTimePicker,
  QUpload
};

const allComponents = Object.keys(Components);
const allComponentsExceptModals = allComponents.filter(
  name => !['QNotification', 'QMessageBox', 'QDialog'].includes(name)
);

// import styles
require('../fonts/index.scss');
require('../icons/index.scss');
require('../main.scss');

allComponents.forEach(component => {
  const kebabCaseComponent = kebabCase(component);
  try {
    // eslint-disable-next-line import/no-dynamic-require
    require(`../qComponents/${component}/src/${kebabCaseComponent}.scss`);
  } catch (err) {
    console.warn(err);
  }
});

// install
const install = (
  Vue,
  {
    localization: { locale = 'ru', customI18nMessages = {} } = {},
    zIndexCounter = 2000,
    prefix = ''
  } = {}
) => {
  Vue.prototype.$Q = {};
  // define plugins
  Object.defineProperties(Vue.prototype.$Q, {
    zIndex: {
      get() {
        zIndexCounter += 1;
        return zIndexCounter;
      }
    },
    locale: {
      get: () => locale,
      set(newLocale) {
        locale = newLocale;
      }
    }
  });

  Vue.use(vClickOutside);
  installI18n({ locale, customI18nMessages });

  // setup modals
  if (!Vue.prototype.$notify) {
    Vue.prototype.$notify = options =>
      QNotification({
        duration: 3000, // - ms
        ...options
      });
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`$notify hasn't been registered, it has existed before`);
  }

  if (!Vue.prototype.$message) {
    Vue.prototype.$message = QMessageBox;
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`$message hasn't been registered, it has existed before`);
  }

  if (!Vue.prototype.$dialog) {
    Vue.prototype.$dialog = QDialog;
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`$dialog hasn't been registered, it has existed before`);
  }

  allComponentsExceptModals.forEach(name => {
    const newName =
      prefix && isString(prefix) ? name.replace(/^Q/, prefix) : name;
    Vue.component(newName, Components[name]);
  });
};

const Qui = {
  version,
  install
};

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(Qui);
}

export default Qui;
export {
  QBreadcrumbs,
  QButton,
  QCascader,
  QCheckbox,
  QCheckboxGroup,
  QCol,
  QCollapse,
  QCollapseItem,
  QColorPicker,
  QContextMenu,
  QDatePicker,
  QDialog,
  QDrawer,
  QForm,
  QFormItem,
  QInput,
  QInputNumber,
  QMessageBox,
  QNotification,
  QOption,
  QPagination,
  QPopover,
  QRadio,
  QRadioGroup,
  QRangeSelector,
  QRow,
  QScrollbar,
  QSelect,
  QTabPane,
  QTable,
  QTabs,
  QTag,
  QTextarea,
  QTimePicker,
  QUpload
};
