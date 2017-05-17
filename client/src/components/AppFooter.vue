<template>
    <footer class="footer navbar-fixed-bottom">
        <div class="container">
        <p>
            Updated daily.<br />
        </p>
        </div>
    </footer>
</template>

<script>
// import * as moment from 'moment-timezone'
// import * as config from '../../config/app'

export default {
  name: 'AppHeader',
  props: ['lastUpdated']
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
