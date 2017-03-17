# -*- coding: utf-8 -*-
from scrapy.exceptions import DropItem
from scrapy import signals
from scrapy.conf import settings
import boto3
import botocore.exceptions as botoExceptions
import io
import json
import datetime as dt

class OperapricesPipeline(object):

    def process_item(self, item, spider):
        if not item.is_valid():
            raise DropItem('Incomplete item {}'.format(item))

        return item

class S3ExportPipeline(object):
    def __init__(self):
        self.files = set()
        self.bucketname = settings['AWS_BUCKET_NAME']
        self.rootpath = 'op/'
        self.nowts = round(dt.datetime.utcnow().timestamp())
        self.s3 = boto3.client(
            's3',
            settings['AWS_REGION'],
            aws_access_key_id=settings['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=settings['AWS_SECRET_ACCESS_KEY']
        )
        return

    @classmethod
    def from_crawler(cls, crawler):
        pipeline=cls()
        crawler.signals.connect(pipeline.spider_opened, signals.spider_opened)
        crawler.signals.connect(pipeline.spider_closed, signals.spider_closed)
        return pipeline

    def spider_opened(self, spider):
        data = self.s3_load('index')
        if data is not None:
            self.files = set(data['files'])

    def spider_closed(self, spider):
        self.s3_save({'files': list(self.files), 'last_update': self.nowts, 'name': 'Opera prices'}, 'index')
        return

    def process_item(self, item, spider):
        data = self.s3_load(item['slug'])
        if data is None:
            data = {}
            for f in ['id', 'slug', 'title', 'author', 'location']: data[f] = item[f]
            data['performances'] = {}

        data['start_date'] = item['start_date'].isoformat()
        data['end_date'] = item['end_date'].isoformat()
        data['last_update'] = self.nowts

        for perf_date in item['prices'].keys():
            if perf_date not in data['performances']:
                data['performances'][perf_date] = []
            data['performances'][perf_date].append([self.nowts] + item['prices'][perf_date])

        self.s3_save(data, item['slug'])
        return item

    def s3_save(self, data, name):
        if settings['S3_UPLOAD']:
            filename = self.rootpath + name + '.json'
            buf = io.BytesIO(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            self.s3.upload_fileobj(buf, self.bucketname, filename)
            self.s3.put_object_acl(Bucket=self.bucketname, Key=filename, ACL='public-read')
        else:
            print('Saving file "{}"'.format(name), data)

        self.files.add(name + '.json')

    def s3_load(self, filename):
        try:
            buf = io.BytesIO()
            self.s3.download_fileobj(self.bucketname, self.rootpath + filename + '.json', buf)
            data = json.loads(buf.getvalue().decode('utf-8'), encoding='utf-8')
        except botoExceptions.ClientError as err:
            if err.response['Error']['Code'] != '404': raise err
            data = None

        return data

