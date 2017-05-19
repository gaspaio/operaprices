<template>
    <footer class="footer">
        <div class="container">
        <p>Updated daily. Upward / downward arrows indicate if the direction of the last price change in the last 3 days.<br />
            <strong>Last update: {{ updatedStr  }} CET</strong>
        </p>
        </div>
    </footer>
</template>

<script>
import * as moment from 'moment-timezone'

export default {
  name: 'AppHeader',
  props: ['lastUpdated'],
  computed: {
    updatedStr: function () {
      return moment.tz(this.lastUpdated, 'Europe/Paris').format('DD MMMM YYYY, h[h]mm')
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
footer .container {
  width: 970px !important;
}
</style>
