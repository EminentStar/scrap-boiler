# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-09-03 12:06
from __future__ import unicode_literals

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('scraping', '0003_scrapinformation_og_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='scrapinformation',
            name='request_url',
            field=models.CharField(default=datetime.datetime(2016, 9, 3, 12, 6, 15, 869857, tzinfo=utc), max_length=500),
            preserve_default=False,
        ),
    ]
