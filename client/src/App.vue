<template>
  <div id="app" class="container">
    <app-header />
    <router-view :shows="shows" :files="files"></router-view>
    <app-footer :lastUpdated='lastUpdated' />
  </div>
</template>

<script>

import Vue from 'vue'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'

export default {
  name: 'app',
  data () {
    return {
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
  created: function () {
    fetch(`${Vue.config.app.apiUrl}/shows?active=true&include=cheapest,tendency`, {mode: 'cors'})
      .then(res => res.json())
      .then(json => {
        this.$data.lastUpdated = json.meta.lastCrawl.startTime * 1000
        this.$data.shows = json.shows.map(s => {
          // convert all dates to JS dates from unix
          s.startDate *= 1000
          s.endDate *= 1000

          if (s.saleStartDate) {
            s.saleStartDate *= 1000
          }

          if ('cheapestPerformances' in s) {
            s.cheapestPerformances = s.cheapestPerformances.map(p => {
              p[0] *= 1000
              return p
            })
          }

          return s
        })
      })
      .catch(err => console.error(err))
  }
}
</script>

<style>
#app {
  width: 970px !important;
  padding-top: 20px;
  padding-bottom: 20px;
}
</style>
