<template>
    <footer class="footer">
        <p>Updated daily. Last update: {{ updatedStr }}</p>
    </footer>
</template>

<script>
import * as moment from 'moment-timezone'

export default {
  name: 'AppHeader',
  props: ['lastUpdated'],
  computed: {
    updatedStr: function () {
      return moment.tz(this.lastUpdated, 'UTC').format('DD MMMM YYYY, h[h]mm')
    }
  }
}
</script>

<style>
footer {
  padding-top: 20px;
  color: #777;
  border-top: 1px solid #e5e5e5;
}
</style>
