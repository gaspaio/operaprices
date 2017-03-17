# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy

class Show(scrapy.Item):
    # define the fields for your item here like:
    id = scrapy.Field()
    slug = scrapy.Field()
    title = scrapy.Field()
    author = scrapy.Field()
    location = scrapy.Field()      # Opéra Bastille,
    start_date = scrapy.Field()
    end_date = scrapy.Field()
    prices = scrapy.Field()

    def is_valid(self):
        has_all_fields = [f is not None for f in self.keys()].count(True) == 8
        return has_all_fields and self.is_location_valid()

    def is_location_valid(self):
        return self['location'] in ['Opéra Bastille', 'Palais Garnier']

