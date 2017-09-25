<template>
  <div class="row shows-sale-open">

    <table class='table show-list'>
      <thead>
        <th><h3>Currently on sale</h3></th><th class='price'>Lowest price</th><th class='perfs'>Performances</th>
      </thead>
      <tbody>
      <tr v-for="show in showData">
        <td class='show-info'>
          <h4><a :href="show.link" target="_blank">{{ show.title }}</a></h4>
          <p class='author' v-if='show.author'>{{ show.author }}</p>
          <p class='location'> {{ show.dates }} | <strong>{{ show.location }}</strong></p>
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
          <p v-if="show.extraMinPerfsStr" class="extra-perfs-str">{{ show.extraMinPerfsStr }}</p>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { showDateString, singleDateString } from '@/lib/utils'

const morePerfsStr = nb => {
  return `${nb} more date${nb > 1 ? 's' : ''} available at this price`
}

export default {
  name: 'ShowsSaleOpen',
  props: ['shows'],
  computed: {
    showData: function () {
      const tmp = this.shows
        .filter(show => show.cheapestPerformances.length > 0)  // Filter out sold out shows
        .map(show => {
          return {
            title: show.title,
            link: show.buyUrl,
            start: show.startDate,
            author: show.author,
            location: show.location,
            dates: showDateString(show.startDate, show.endDate),
            minPrice: `${show.cheapestPrice} €`,
            tendency: show.tendency,
            minPerfs: show.cheapestPerformances.slice(0, 3).map(p => `${singleDateString(p[0], 'long')} (${p[2]})`),
            extraMinPerfsStr: show.cheapestPerformances.length - 3 > 0 ? morePerfsStr(show.cheapestPerformances.length - 3) : false
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
h4 {
  font-size: 22px;
  margin-bottom: 0.2em;
  margin-top: 0.2em;
}

div.shows-sale-open {
  margin-top: 20px;
}

p.author {
  font-weight: bold;
}

p.location {
  margin-bottom: 0.2em;
  font-size: 0.8em;
}

p.extra-perfs-str {
  font-size: 0.9em;
  font-style: italic;
}

th.price {
  text-align: center;
  vertical-align: bottom;
}

th.perfs {
  padding-left: 20px;
  width: 250px;
  vertical-align: bottom;
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
