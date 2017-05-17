<template>
  <div class="row">
      <p>Our highly specialized team of code monkeys is working hard to build the next version of <em>Opera Prices</em></p>
      <p>In the meanwhile, go out, have a beer, call some friends, do something fun.</p>
  </div>
</template>

<script>

// import * as moment from 'moment-timezone'
// import * as config from '../../config/app'

export default {
  name: 'shows',
  props: ['shows']
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin-bottom: 0.2em;
  margin-top: 0.2em;
}

p.author {
  font-weight: bold;
  font-style: italic;
}

p.location {
  margin-bottom: 0.2em;
  font-size: 0.8em;
}

th.price {
  text-align: center;
}

th.perfs {
  padding-left: 20px;
}

td.show-price {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

td.show-price .price-info {
  font-size: 2em;
}

td.show-price .arrow {
  font-size: 1.8em;
  padding-left: 5px;
}

td.show-price .fa-long-arrow-up {
  color: #a94442;
}

td.show-price .fa-long-arrow-down {
  color: #50a942;
}

td.show-performances {
  vertical-align: middle;
  padding-left: 20px;
}

td.show-performances ul {
  padding-left: 10px;
}

td.show-performances ul li {
  margin: 0.4em 0;
}

</style>
