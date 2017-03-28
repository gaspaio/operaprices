<template>
  <div class="row">
    <table class='table show-list'>
      <thead>
        <th></th><th>Lowest price</th><th>Performances</th>
      </thead>
      <tbody>
      <tr v-for="show in showData">
        <td class='show-info'>
          <h3><a :href="show.link" target="_blank">{{ show.title }}</a></h3>
          <p class='author'>{{ show.author }}</p>
          <p class='location'><strong>{{ show.location }}</strong> | {{ show.dates }}</p>
        </td>
        <td class='show-price'>{{ show.minPrice }}</td>
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

export default {
  name: 'shows',
  props: ['shows'],
  computed: {
    showData: function () {
      const tmp = this.shows.map(show => {
        let [minPrice, minPerfs] = show.getCheapestCurrentPerformances()

        return {
          title: show.title,
          link: `https://www.operadeparis.fr/billetterie/${show.slug}`,
          start: show.start_date,
          author: show.author,
          location: show.location,
          dates: show.getDates(),
          minPrice: `${minPrice} €`,
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

td.show-price {
  display: table-cell;
  vertical-align: middle;
  text-align: left;
  font-size: 2em;
}

td.show-performances {
  vertical-align: middle;
}

td.show-performances ul {
  padding-left: 10px;
}

td.show-performances ul li {
  margin: 0.4em 0;
}
</style>
