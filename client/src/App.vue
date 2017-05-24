<template>
  <div id="app" class="container">
    <app-header />
    <router-view :shows="shows" :loading="loading"></router-view>
    <app-footer :lastUpdated='lastUpdated' />
  </div>
</template>

<script>

// import Vue from 'vue'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'

export default {
  name: 'app',
  data () {
    return {
      loading: true,
      lastUpdated: null,
      operas: [],
      ballets: []
    }
  },
  components: {
    'app-header': AppHeader,
    'app-footer': AppFooter
  },
  created: function () {
    fetch(`/static/json/shows.json`)
      .then(res => res.json())
      .then(json => {
        this.$data.lastUpdated = json.meta.lastCrawl.startTime * 1000
        const shows = json.shows.map(s => {
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
        this.$data.operas = shows.filter(s => s.type === 'opera')
        this.$data.ballets = shows.filter(s => s.type === 'ballet')
        this.$data.loading = false
      })
      .catch(err => console.error(err))
  },
  computed: {
    shows: function () {
      if (this.$route.name === 'operas') return this.$data.operas
      if (this.$route.name === 'ballets') return this.$data.ballets
      return []
    }
  }
}
</script>

<style>
#app {
  width: 970px !important;
  padding-bottom: 20px;
}
</style>
