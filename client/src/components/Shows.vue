<template>
  <div class="shows-wrapper" >
    <shows-sale-open :shows='openShows' v-if="!loading"/>
    <shows-sale-closed :shows='closedShows' v-if="!loading"/>
    <p class="loading" v-if="loading">Loading data ...</p>
  </div>
</template>

<script>

import ShowsSaleOpen from '@/components/ShowsSaleOpen'
import ShowsSaleClosed from '@/components/ShowsSaleClosed'

export default {
  name: 'Shows',
  props: ['shows', 'loading'],
  computed: {
    openShows: function () {
      return this.shows.filter(s => s.saleOpen)
    },
    closedShows: function () {
      return this.shows.filter(s => !s.saleOpen)
    }
  },
  components: {
    'shows-sale-open': ShowsSaleOpen,
    'shows-sale-closed': ShowsSaleClosed
  }
}

</script>

<style scoped>
div.shows-wrapper {
  margin-top: 30px;
}
p.loading {
  font-style: italic;
  font-weight: bold;
}
</style>
