<template>
    <footer class="footer">
        <p>
            Updated daily. Upward / downward arrows indicate if the price went up / down in the last {{ days }} days.<br />
            Last update: {{ updatedStr }}
        </p>
    </footer>
</template>

<script>
import * as moment from 'moment-timezone'
import * as config from '../../config/app'

export default {
  name: 'AppHeader',
  props: ['lastUpdated'],
  computed: {
    updatedStr: function () {
      return moment.tz(this.lastUpdated, 'UTC').format('DD MMMM YYYY, h[h]mm')
    },
    days: function () {
      return config.tendencyDays
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
