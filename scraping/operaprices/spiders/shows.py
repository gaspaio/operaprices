# -*- coding: utf-8 -*-
import scrapy
import re
from operaprices.items import Show
import datetime as dt
import logging

class ShowsSpider(scrapy.Spider):
    name = "shows"
    allowed_domains = ["www.operadeparis.fr"]
    start_urls = ['https://www.operadeparis.fr/saison-17-18/opera']

    months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

    def parse(self, response):
        # Get the featured items
        items = scrapy.Selector(response).css('body > div.content-wrapper > div.grid-container.grid-row-prefooter > ul.FeaturedList.FeaturedList--no-border-bottom.grid-row > li > div > div.FeaturedList__card-content')

        # Get show type
        types = [s.strip() for s in items.css('div.FeaturedList__card-title > p::text').extract()]

        # Get opera info
        titles = items.css('div.FeaturedList__card-title > a.title-oeuvre > span::text').extract()
        authors = items.css('div.FeaturedList__card-title > p > span::text').extract()

        # Get locations string
        locations =  [s.strip() for s in items.css('div.FeaturedList__card-content > div.FeaturedList__card-metadata > div::text').extract() if len(s.strip())]
        logging.info("Items found: {}/{}/{}/{}/{}".format(len(items), len(types), len(titles), len(authors),
                                                          len(locations)))

        for i in range(len(items)):
            # test if type not 'Opéra', ignore (académie, recital)
            if types[i] != 'Opéra': continue

            # If no link to tickets, ignore
            url = items[i].css('div.FeaturedList__card-content > a.FeaturedList__reserve-btn').xpath('@href').extract()
            if len(url) == 0: continue

            url = url[0]
            id = self.getIdFromUrls(url)
            [start, end, loc] = self.parseLocationStr(locations[i])

            request = scrapy.Request(url, callback=self.parseShowData)
            request.meta['item'] = Show(
                id=id[0],
                slug=id[1],
                title=titles[i],
                author=authors[i],
                location=loc,
                start_date=start,
                end_date=end
            )
            yield request

    def parseShowData(self, response):
        item = response.meta['item']

        # Chopper les dates de toutes les représentations
        perfs = scrapy.Selector(response).css('body > div.content-wrapper > section.grid-container > ul.PerformanceList > li')
        now = dt.datetime.now()
        data = {}
        for perf in perfs:
            day = perf.css('div.PerformanceList__item__metadata > div.PerformanceDate').xpath('@title').extract()
            hour = perf.css('div.PerformanceList__item__metadata > div.PerformanceDate__extra > p.PerformanceDate__hours::text').extract()

            date = self.parsePerfDate(day, hour)

            # ignore past perf
            if now > date: continue

            rows = perf.css('div.PerformanceList__item__table > div > ol > li.PerformanceTable__rows')
            availables = ['unavailable' not in s for s in rows.xpath('@class').extract()]
            cats = [cat.strip() for cat in rows.css('span.PerformanceTable__label::text').extract()]
            prices = [int(s[:-2]) for s in rows.css('span.PerformanceTable__price::text').extract()]

            perfInfo = []
            for i in range(len(rows)):
                perfInfo.append([cats[i], prices[i], availables[i]])

            data[date.isoformat()] = perfInfo

        item['prices'] = data
        yield item

    def getIdFromUrls(self, s):
        m = re.search(r'billetterie/(([0-9]+)-[^/]+)$', s)
        return [m.groups()[1], m.groups()[0]] if m else [None, None]

    def parsePerfDate(self, dayStr, hourStr):
        if (len(dayStr) != 1 or len(hourStr) != 1):
            return None

        parts = [s.strip() for s in dayStr[0].split(' ')]
        d = int(parts[1])
        if (parts[2] not in self.months):
            return None
        m = self.months.index(parts[2]) + 1
        y = int(parts[3])

        parts = [s.strip() for s in hourStr[0].split('h')]
        h = int(parts[0])
        mn = int(parts[1])

        return dt.datetime(y, m, d, h, mn)

    def parseLocationStr(self, str):
        """
        Examples:
        - du 14 octobre au 16 novembre 2016
        - du 19 au 28 novembre 2016
        """
        ret = [None, None, None]
        parts = str.split(' — ')
        if len(parts) != 2: return ret

        loc = parts[0].strip()
        ret[2] = loc

        mm = re.match(r'^du\s+(.+)\sau\s(.+)$', parts[1].strip())
        if not mm or len(mm.groups()) != 2: return ret

        months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        dates = [s.strip() for s in mm.groups()]

        [day, month, year] = dates[1].split(' ')
        dat = day.strip()
        month = month.strip()
        year = year.strip()

        if month not in months: return ret
        ret[1] = dt.date(int(year), months.index(month) + 1, int(day))

        parts = dates[0].split(' ')
        parts = [s.strip() for s in parts]
        if len(parts) < 1: return ret
        if len(parts) < 2:
            ret[0] = dt.date(ret[1].year, ret[1].month, int(parts[0]))
            return ret

        if parts[1] not in months: return ret
        month = months.index(parts[1]) + 1
        if len(parts) == 3: year = int(parts[2])
        else: year = ret[1].year

        ret[0] = dt.date(year, month, int(parts[0]))
        # print("Parsed {} into".format(str), ret)
        return ret

