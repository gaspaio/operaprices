// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'whatwg-fetch'
import Promise from 'promise-polyfill'
import * as moment from 'moment-timezone'
moment.locale('en')

// To add to window
if (!window.Promise) {
  window.Promise = Promise
}

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

