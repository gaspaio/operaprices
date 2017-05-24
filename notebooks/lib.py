CSVDIR = '../data/csv'
import pandas as pd
import datetime as dt
import math

def augment_data(data):
    # Shows
    data['show']['runlength'] = data['show'].endDate - data['show'].startDate
    perfCounts = data['performance'].showId.value_counts()
    data['show']['performances'] = data['show'].id.apply(lambda id: perfCounts[id])
    data['show']['presale_time'] = data['show'].startDate - data['show'].saleStartDate

    return data

def load_data():
    out = {}

    def int2bool(val):
        return True if val == '1' else False

    def ts2date(val):
        return dt.date.fromtimestamp(int(val)) if val != '' else None

    def ts2datetime(val):
        return dt.datetime.fromtimestamp(int(val)) if val != '' else None

    def strClean(val):
        ss = val.strip()
        return ss if ss != '' else None

    def crawlErr(val):
        return False if val == '[]' else True

    # Shows
    out['show'] = pd.read_csv(CSVDIR + '/show.csv', converters={
        'saleOpen': int2bool,
        'startDate': ts2date,
        'endDate': ts2date,
        'saleStartDate': ts2date,
        'author': strClean,
        'title': strClean
    }, usecols=[
        'id', 'slug', 'type', 'title', 'author', 'location', 'saleStartDate', 'saleOpen', 'startDate', 'endDate'
    ], encoding='utf-8')
    out['show'].sort_values(by=['type', 'startDate'], inplace=True)

    out['performance'] = pd.read_csv(CSVDIR + '/performance.csv', converters={
        'date': ts2datetime
    }, usecols=['id', 'showId', 'date'])
    out['performance'].sort_values(by='date', inplace=True)

    out['crawl'] = pd.read_csv(CSVDIR + '/crawl.csv', converters={
        'startTime': ts2datetime,
        'endTime': ts2datetime,
        'errors': crawlErr
    }, usecols=['id', 'startTime', 'endTime', 'errors'])
    out['crawl'].sort_values(by='startTime', inplace=True)

    out['price'] = pd.read_csv(CSVDIR + '/price.csv', converters={
        'available': int2bool
    })

    return augment_data(out)
