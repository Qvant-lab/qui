import QTable from './src/QTable.vue';

QTable.install = Vue => {
  Vue.component(QTable.name, QTable);
};

export default QTable;
