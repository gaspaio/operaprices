<template>
  <div class='row'>
    <shows-sale-open :shows='openShows' />
    <shows-sale-closed :shows='closedShows' />
  </div>
</template>

<script>

import ShowsSaleOpen from '@/components/ShowsSaleOpen'
import ShowsSaleClosed from '@/components/ShowsSaleClosed'

export default {
  name: 'Shows',
  props: ['shows'],
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
