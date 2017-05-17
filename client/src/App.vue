<template>
  <div id="app" class="container">
    <app-header />
    <router-view :shows="shows" :files="files"></router-view>
    <app-footer :lastUpdated='lastUpdated' />
  </div>
</template>

<script>

import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
// import * as config from '../config/app'
// import Show from '@/models/dater'

export default {
  name: 'app',
  data () {
    return {
      globalData: 'bibi',
      loading: true,
      lastUpdated: null,
      shows: [],
      files: []
    }
  },
  components: {
    'app-header': AppHeader,
    'app-footer': AppFooter
  },
  created: function () {}
}
</script>

<style>
#app {
  width: 970px !important;
  padding-top: 20px;
  padding-bottom: 20px;
}
</style>
