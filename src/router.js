import Vue from 'vue';
import Router from 'vue-router';
import WeatherTable from './components/WeatherTable.vue';
import FilterForm from './views/FilterForm.vue';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'WeatherTable',
      component: WeatherTable,
      props: true,
    },
    {
      path: '/filter',
      name: 'filter',
      component: FilterForm,
      props: true,
    },
  ],
});
