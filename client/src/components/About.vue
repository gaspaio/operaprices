<template>
    <div class="row">
        <p>This projet is as a way for me to follow the evolution of Opera ticket prices (often quite expensive).</p>
        <p>Every day, my little <a href="https://scrapy.org/" title="scrapy.org">Scrappy</a> spider scrapes the Paris Opera website and extracts all the prices for
        all price categories for all performances for all available shows.<p>

        <p>The recurrent scraping jobs are handled via <a href="https://scrapinghub.com" title="ScrapingHub.com">ScrapingHub</a>.
        Many thanks to them for their generous free scrapy cloud plan.</p>

        <p>Scrapping started early march 2017, the datasets are quite small still. The OperaPrices project is therefore sort of incubating
        for a few months, until the datasets are large and varied enough for us to get some meaningful information
        out of them.</p>

        <p>To be continued ...</p>

        <hr />

        <p>If you wish to have your fun with this dataset, here it is, one <em>json</em> file per scrapped show:</p>

        <ol>
            <li v-for="file in urls"><a :href="file.url" :title="file.title">{{ file.title }}</a></li>
        </ol>
  </div>
</template>

<script>

import * as config from '../../config/app'

export default {
  name: 'about',
  props: ['files'],
  computed: {
    urls: function () {
      return this.files.map(file => {
        return {title: file, url: `${config.mainUrl}/${file}`}
      })
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
