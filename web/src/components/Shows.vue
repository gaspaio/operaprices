<template>
  <div class="row">
    <table class='table show-list'>
      <thead>
        <th></th><th class='price'>Lowest price</th><th class='perfs'>Performances</th>
      </thead>
      <tbody>
      <tr v-for="show in showData">
        <td class='show-info'>
          <h3><a :href="show.link" target="_blank">{{ show.title }}</a></h3>
          <p class='author'>{{ show.author }}</p>
          <p class='location'><strong>{{ show.location }}</strong> | {{ show.dates }}</p>
        </td>
        <td class='show-price'>
          <span class='price-info'>{{ show.minPrice }}</span>
          <i v-if="show.tendency === -1" class="fa fa-long-arrow-down arrow" aria-hidden="true"></i>
          <i v-if="show.tendency === 1" class="fa fa-long-arrow-up arrow" aria-hidden="true"></i>
          <br/>
          <span class='cat-info'>{{ show.minCat }}</span>
        </td>
        <td class='show-performances'>
          <ul>
            <li v-for="perf in show.minPerfs">{{ perf }}</li>
          </ul>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import * as moment from 'moment-timezone'
import * as config from '../../config/app'

export default {
  name: 'shows',
  props: ['shows'],
  computed: {
    showData: function () {
      const tmp = this.shows
        // Only display active shows
        .filter(show => show.isOn)
        .map(show => {
          let [minPrice, minCat, minPerfs] = show.getCheapestCurrentPerformances()
          return {
            title: show.title,
            link: `https://www.operadeparis.fr/billetterie/${show.slug}`,
            start: show.start_date,
            author: show.author,
            location: show.location,
            dates: show.getDates(),
            minPrice: `${minPrice} €`,
            tendency: show.getTendency(config.tendencyDays),
            minCat,
            minPerfs: minPerfs.map(p => moment.tz(p, 'Europe/Paris').format('dddd Do MMMM'))
          }
        })

      tmp.sort((s1, s2) => s1.start - s2.start)
      return tmp
    }
  }
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
