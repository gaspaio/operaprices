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

const TZ = 'Europe/Paris'

const getShowDates = show => {
  let duFormat = 'dddd Do'
  const auFormat = 'dddd Do MMMM YYYY'

  const sd = moment.tz(show.startDate, TZ)
  const ed = moment.tz(show.endDate, TZ)

  if (sd.year() !== ed.year()) {
    duFormat += ' MMMM YYYY'
  } else if (sd.month() !== ed.month()) {
    duFormat += ' MMMM'
  }

  return `From ${sd.format(duFormat)} to ${ed.format(auFormat)}`
}

export default {
  name: 'shows',
  props: ['shows'],
  computed: {
    showData: function () {
      const tmp = this.shows.map(show => {
        return {
          title: show.title,
          link: show.buyUrl,
          start: show.startDate,
          author: show.author,
          location: show.location,
          dates: getShowDates(show),
          minPrice: `${show.cheapestPrice} €`,
          tendency: show.tendency,
          minPerfs: show.cheapestPerformances.map(p => {
            const d = moment.tz(p[0], TZ).format('dddd Do MMMM')
            return `${d} (${p[2]})`
          })
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
