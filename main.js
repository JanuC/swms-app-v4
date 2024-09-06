import Vue from 'vue';
import App from './App';
import store from '@/store';
import config from '@/config';
import db from '@/utils/db.js';
import utils from '@/utils/index.js';
import request from '@/utils/request.js';
import * as filters from '@/utils/filters.js';

Vue.config.productionTip = false;

App.mpType = 'app';
Vue.prototype.$config = config;
Vue.prototype.$db = db;
Vue.prototype.$utils = utils;
Vue.prototype.$request = request;
Object.keys(filters).forEach(key => {
	Vue.filter(key, filters[key])
});

const app = new Vue({
	store,
	...App
})
app.$mount()
