<template>
    <footer class="footer row">
      <p>Updated daily. Upward / downward arrows indicate if the direction of the last price change in the last 3 days.</p>
      <p v-if='updatedStr !== null' ><strong>Last update: {{ updatedStr  }} CET</strong></p>
    </footer>
</template>

<script>
import * as moment from 'moment-timezone'

export default {
  name: 'AppHeader',
  props: ['lastUpdated'],
  computed: {
    updatedStr: function () {
      return this.lastUpdated ? moment.tz(this.lastUpdated, 'Europe/Paris').format('DD MMMM YYYY, HH[h]mm') : null
    }
  }
}
</script>

<style>
footer {
  padding-top: 20px;
  color: #777;
  border-top: 1px solid #e5e5e5;
  margin-top: 30px;
}
footer .container {
  width: 970px !important;
}
</style>
