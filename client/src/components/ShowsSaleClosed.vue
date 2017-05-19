<template>
  <div class="row">
    <h3>Not yet on sale</h3>
    <table class="table show-list">
      <thead>
        <th></th><th></th><th class='sales'>Sales open on</th>
      </thead>
      <tbody>
        <tr v-for="show in data">
          <td>
            <a :href="show.link" target="_blank"><strong>{{ show.title }}</strong></a>
            <br />{{ show.author }}
          </td>
          <td>
            {{ show.dates }}<br/>
            {{ show.location }}
          </td>
          <td>
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
          link: s.buyLink,
          author: s.author,
          start: s.startDate,
          location: s.location,
          dates: showDateString(s.startDate, s.endDate),
          opensOn: singleDateString(s.saleStartDate)
        }
      })

      tmp.sort((s1, s2) => s1.start - s2.start)
      return tmp
    }
  }
}

</script>
<style scoped>

</style>
