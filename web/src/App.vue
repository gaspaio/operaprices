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
import * as config from '../config/app'
import Show from '@/models/dater'

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
  created: function () {
    fetch(`${config.mainUrl}/index.json`, {mode: 'cors'})
      .then(res => res.json())
      .then(json => {
        this.$data.lastUpdated = json.last_update * 1000
        this.$data.files = json.files
        return Promise.all(json.files.map(
          file => fetch(`${config.mainUrl}/${file}`, {mode: 'cors'}).then(res => res.json())
        ))
      })
      .then(shows => {
        this.$data.shows = shows
          .map(data => {
            try {
              return new Show(data)
            } catch (err) {
              console.error(err.message)
              return null
            }
          })
          .filter(show => show != null)
        return
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
