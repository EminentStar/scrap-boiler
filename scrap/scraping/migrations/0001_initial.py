# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-08-28 15:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ScrapInformation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status_code', models.CharField(max_length=10)),
                ('og_url', models.CharField(max_length=500)),
                ('og_title', models.CharField(blank=True, max_length=50)),
                ('og_image', models.ImageField(blank=True, upload_to='og-images')),
                ('og_description', models.CharField(blank=True, max_length=100)),
            ],
        ),
    ]
