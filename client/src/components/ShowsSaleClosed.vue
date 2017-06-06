<template>
  <div class="row">

    <table class="table show-list">
      <thead>
        <th><h3>Not yet on sale</h3></th><th /><th class='opens-on'>Sales open on</th>
      </thead>
      <tbody>
        <tr v-for="show in data">
          <td class="title">
            <a :href="show.link" target="_blank" class="title">{{ show.title }}</a>
            <br /><span class="author" v-if='show.author'>{{ show.author }}</span><span v-if='show.author'> |</span> {{ show.location }}
          </td>
          <td class="dates">
            {{ show.dates }}
          </td>
          <td class="opens-on">
            {{ show.opensOn }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { showDateString, singleDateString } from '@/lib/utils'
// TODO: display number of performances ?
// In API: get for each show the number of perfs

export default {
  name: 'ShowsSaleClosed',
  props: ['shows'],
  computed: {
    data: function () {
      const tmp = this.shows.map(s => {
        return {
          title: s.title,
          link: s.buyUrl,
          author: s.author,
          sale: s.saleStartDate,
          start: s.startDate,
          location: s.location,
          dates: showDateString(s.startDate, s.endDate),
          opensOn: singleDateString(s.saleStartDate, 'medium')
        }
      })

      tmp.sort((s1, s2) => {
        const dd = s1.sale - s2.sale
        if (dd !== 0) return dd
        return s1.start - s2.start
      })
      return tmp
    }
  }
}

</script>
<style scoped>
h4 {
  font-size: 22px;
  margin: 0.2em 0;
}
.title {
  font-weight: bold;
  font-size: 1.1em;
}
.author {
  font-weight: bold;
}
td.dates, td.opens-on {
  vertical-align: middle;
  text-align: center;
}
th.opens-on {
  vertical-align: bottom;
  text-align: center;
}
</style>
