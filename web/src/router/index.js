import Vue from 'vue'
import Router from 'vue-router'
import Shows from '@/components/Shows'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Shows',
      component: Shows,
      props: true
    },
    {
      path: '/about',
      name: 'About',
      component: About,
      props: true
    }
  ]
})
