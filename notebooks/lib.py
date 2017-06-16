CSVDIR = '../data/csv'
import pandas as pd
import datetime as dt
import math
import json

TMP = None

def augment_data(data):
    lastCrawl = data['crawl'].id.max()

    # Crawls
    cs = data['crawl']
    cs['comp_has_err'] = cs['errors'].apply(lambda x: bool(x))

    #
    # Prices
    #
    data['price'] = pd.merge(
        data['price'], data['crawl'][['id', 'startTime']], how='left', left_on='crawlId', right_on='id'
    )[['crawlId', 'startTime', 'performanceId', 'category', 'price', 'available']]
    data['price'].rename(columns = {'startTime': 'crawl_startTime'}, inplace=True)

    # Add showId to price table
    data['price'] = pd.merge(data['price'], data['performance'][['showId']], how='left', left_on='performanceId', right_index=True)

    #
    # Performances
    #
    data['performance']['comp_weekday'] = data['performance'].date.apply(lambda d: d.strftime('%a'))

    def perf_off_sale_fields(perf):
        # (off_sale_date (dt, None) | off_sale_abrupt (True, False, None)
        seen = data['price'][data['price'].performanceId == perf.id]
        if (len(seen) == 0): return (perf.id, None, True)

        last_seen = seen.crawlId.max()
        if (last_seen == lastCrawl): return (perf.id, None, False) # Still on sale

        off_date = data['crawl'].loc[last_seen].startTime
        return (perf.id, off_date, off_date.date() < perf.date.date())

    cmp_off_sale = pd.DataFrame(
        [perf_off_sale_fields(row) for row in data['performance'].itertuples()],
        columns=['id', 'comp_off_sale', 'comp_off_sale_abrupt']
    ).set_index('id')
    data['performance'] = data['performance'].join(cmp_off_sale)

    # get cats per performance
    cats_perf_crawl = data['price'].groupby(
        by=['performanceId', 'crawlId']
    ).category.apply(lambda x: ','.join(sorted(x.values)))

    counts = cats_perf_crawl.groupby(level=0).apply(lambda x: len(x.unique()))
    for pid in counts[counts > 1].index:
        print('WARNING: perf with categ variations - {}'.format(perf_info_str(data['performance'][pid])))

    data['performance']['comp_categories'] = cats_perf_crawl.groupby(level=0).agg('last')

    # Perf prices
    data['performance_prices'] = data['price'].groupby(['performanceId',
                                                        'category']).price.mean().to_frame().reset_index()
    data['generics'] = {}
    data['generics']['crawl_nb'] = len(cs)
    data['generics']['crawl_from'] = cs.startTime.min()
    data['generics']['crawl_to'] = cs.startTime.max()
    data['generics']['crawl_frame'] = data['generics']['crawl_to'] - data['generics']['crawl_from']
    data['generics']['crawl_err_nb'] = cs.comp_has_err.sum()

    # Shows
    data['show']['comp_runlength_days'] = data['show'].apply(lambda x: (x.endDate - x.startDate).days, axis=1)
    perfCounts = data['performance'].showId.value_counts()
    data['show']['comp_performance_nb'] = data['show'].id.apply(lambda id: perfCounts[id])
    data['show']['comp_presale_days'] = data['show'].apply(
        lambda x: (x.startDate - x.saleStartDate).days if x.saleStartDate is not None else 0, axis=1
    )
    data['show']['comp_opening_weekday'] = data['show'].startDate.apply(lambda d: d.strftime('%a'))

    show_cats = data['performance'].groupby(by='showId').comp_categories
    data['show']['comp_categories'] = show_cats.apply(lambda x: x.iloc[0])

    counts = show_cats.apply(lambda x: len(x.value_counts()))
    for sid in counts[counts > 1].index:
        print('WARNING: show with variable categories')
        show_info(data, show_id)

    data['show_cheapest'] = data['price'][data['price'].available == True].groupby(by=['showId', 'crawl_startTime']).apply(lambda x: x.price[x.price.idxmin()])

    return data

def load():
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
        return json.loads(val)

    def locationClean(val):
        v = strClean(val)
        return {
            'Opéra Bastille': 'bastille',
            'Palais Garnier': 'garnier',
            'Amphithéâtre Bastille': 'amphi_bastille'
        }.get(v, v)

    # Shows
    out['show'] = pd.read_csv(CSVDIR + '/show.csv', converters={
        'saleOpen': int2bool,
        'startDate': ts2date,
        'endDate': ts2date,
        'saleStartDate': ts2date,
        'author': strClean,
        'title': strClean,
        'location': locationClean
    }, usecols=[
        'id', 'slug', 'type', 'title', 'author', 'location', 'saleStartDate', 'saleOpen', 'startDate', 'endDate'
    ], encoding='utf-8')
    out['show'].sort_values(by=['type', 'startDate'], inplace=True)
    out['show'].set_index('id', drop=False, inplace=True)

    out['performance'] = pd.read_csv(CSVDIR + '/performance.csv', converters={
        'date': ts2datetime
    }, usecols=['id', 'showId', 'date'])
    out['performance'].sort_values(by='date', inplace=True)
    out['performance'].set_index('id', drop=False, inplace=True)

    out['crawl'] = pd.read_csv(CSVDIR + '/crawl.csv', converters={
        'startTime': ts2datetime,
        'endTime': ts2datetime,
        'errors': crawlErr
    }, usecols=['id', 'startTime', 'endTime', 'errors'])
    out['crawl'].sort_values(by='startTime', inplace=True)
    out['crawl'].set_index('id', drop=False, inplace=True)

    out['price'] = pd.read_csv(CSVDIR + '/price.csv', converters={
        'available': int2bool
    })

    # Correct data
    # Data from crawl 293 is incomplete => the demo issue
    # [293] 2017-05-30 13:28:00 :: 1 errs
    # - SQLITE_BUSY: database is locked

    # Remove prices crawled on this date
    out['price'] = out['price'][out['price'].crawlId != 293].copy()

    # Performances 334 and 396 have some duplicated prices

    def todrop_dup_prices(perfId):
        todrop = []
        perf_dups = out['price'][out['price'].performanceId == perfId].groupby(by=['crawlId', 'category'])
        for g in perf_dups.groups.items():
            if len(g[1]) < 2: continue
            i1 = out['price'].loc[g[1][0]]
            i2 = out['price'].loc[g[1][1]]
            if i1.available == i2.available: todrop.append(g[1][0])
            else: todrop.append(g[1][0] if not i1.available else g[1][1])
        return todrop

    drops = todrop_dup_prices(334) + todrop_dup_prices(396)
    out['price'].drop(drops, inplace=True)

    return augment_data(out)

# Display info

def crawl_info(data):
    dgs = data['generics']
    print("CRAWL INFO:\n- {} crawls\n- From {} to {} ({})\n- {} errors".format(
        dgs['crawl_nb'],
        dgs['crawl_from'],
        dgs['crawl_to'],#
        dgf['crawl_frame'],
        dgs['crawl_err_nb'])
    )

show_info_str = lambda info: '[{:02d}] {} | {}, {}, {} ({} to {}, {} perfs)'.format(
    info.id, info.type, info.title, info.author, info.location, info.startDate, info.endDate, info.comp_performance_nb)

def perf_info_str(info):
    base = '[{:03d}] {}, {}'.format(info.id, info.date.strftime('%a'), info.date)
    if not info.comp_off_sale_abrupt: return base

    if not info.comp_off_sale: return base + ' - Never opened'
    return '{} - Closed abruptly at {}'.format(base, info.comp_off_sale)

def show_list(data, type=None):
    shows = data['show'] if type is None else data['show'][data['show'].type == type]
    shows = shows.sort_values(by=['type', 'startDate'])
    for s in shows.itertuples():
        show_info(data, s.id);


def show_info(data, show_id, display=True):
    info = data['show'].loc[show_id]
    if display:
        perfs = data['performance'][data['performance'].showId == info.id].sort_values(by='date')
        print(show_info_str(info))
        print('     ' + 'Cats: ' + info.comp_categories)
        print('     ' + 'Performances:')
        for p in perfs.itertuples():
            print('       ' + perf_info_str(p))
    return info

def perf_info(data, perf_id, display=True):
    perf = data['performance'].loc[perf_id]
    if display:
        show = show_info(data, perf.showId, False)
        print(perf_info_str(perf))
        print('      cats: ' + perf.comp_categories)
        print('      show: ' + show_info_str(show))
    return perf

def error_info(crawl, start=None):
    if start: sel = crawl.comp_has_err & (crawl.startTime >= start)
    else: sel = crawl.comp_has_err

    cs_err = crawl[sel]

    for i in cs_err.itertuples():
        print("\n[{}] {} :: {} errs".format(i.id, i.startTime, len(i.errors)))
        for e in i.errors:
            msg = e if type(e) == str else e['message']
            print("- {}".format(msg[:150].strip().replace("\n", '')))


