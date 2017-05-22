import Vue from 'vue'
import Router from 'vue-router'
import Shows from '@/components/Shows'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'operas',
      component: Shows,
      props: true
    },
    {
      path: '/ballets',
      name: 'ballets',
      component: Shows,
      props: true
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      props: true
    }
  ]
})
