from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core import serializers

from bs4 import BeautifulSoup

from scraping.models import ScrapInformation

import consistent_hashing
import sys

import ConfigParser

import urllib
import requests
import logging
import logging.handlers

import redis
import json

import consistent_hashing

# parsing config file

cfg = ConfigParser.ConfigParser()
cfg.read("/home/ubuntu/info.conf")

redis_s = cfg.get('cache', 'redis')
redis_list = redis_s.split(' ')

# create redis instance

replica = 2

kvlist = [("host%s" % (idx+1), redis.StrictRedis(x, port=6379)) for idx, x in enumerate(redis_list)]

ch = consistent_hashing.ConsistentHash(kvlist, replica)
block_redis_list = []

# create logger instance
logger = logging.getLogger('scraplogger')
# create formatter
formatter = logging.Formatter('%(asctime)s %(message)s', "%Y-%m-%d %H:%M:%S")

fileHandler = logging.FileHandler('/tmp/scrap.log')
fileHandler.setFormatter(formatter)
logger.addHandler(fileHandler)


def scrap(request):
    if request.method == 'GET':
        global ch
        global block_redis_list
        global kvlist
        global replica
        current_host_name = ''
        redis_context = {}
        exist_context = {}
        url = urllib.quote(request.GET.get('url', ''))
        decode_url = urllib.unquote(url)
        try:
            r = requests.get(decode_url)
        except requests.exceptions.RequestException as e:
            arg = "NOT FOUND: " + decode_url
            logger.error(arg)
            error_context = {'error_message': 'invalid request'} 
            return JsonResponse(error_context, safe=False)            

        status_code = r.status_code

        # priority function > exception handling 
        # check redis cache
        # database sharding
        # db mysql connection
        # redis connection refused handling
        # db error handling
        try:
            v = ch.get(decode_url)
            current_host_name = v[2]
            print 'v[0] = ', v[0]
            print 'v[1] = ', v[1]
            print 'v[2] = ', v[2]
            redis_context = v[1].get(decode_url)
            if redis_context is None:
                pass
            else:
                print 'hit redis cache'
                return JsonResponse(redis_context, safe=False)
            for idx, block in enumerate(block_redis_list):
                try:
                    print 'try connect to block redis instance'
                    result = block[1].get('test connection')
                    kvlist.append(block)
                    ch = consistent_hashing.ConsistentHash(kvlist, replica)
                    block_redis_list.pop(idx) 
                    print 'connect to revive redis instance'
                except:
                    pass
            
        except:
            print ' redis connection rebuilding...'
            try:
                print v[0]
                hostname = current_host_name
                index_list = [x for x, y in enumerate(kvlist) if y[0] == hostname]
                index = map(str, index_list)
                index = ''.join(index)
                index = int(index)
              
                if not kvlist: # if kvlist empty
                    pass
                else:
                    block_redis = kvlist.pop(index)
                    block_redis_list.append(block_redis)
                    ch = consistent_hashing.ConsistentHash(kvlist, replica)
            except:
                print 'not exist available redis cache server'

        # check mysql database
        try:
            row = ScrapInformation.objects.get(request_url=decode_url)
        except ObjectDoesNotExist:
            print 'mysql does not exist'
            row = None

        if row is None:
            new_context = {}
            row = ScrapInformation.objects.create(request_url = decode_url,
                                                  status_code = r.status_code)
            new_context.update({'request_url': decode_url})
            new_context.update({'status_code': r.status_code})
            print 'complete create object'
            print row
            
        else:
            try:
                request_url = row.get_request_url()
		exist_context.update({'request_url': decode_url})

		status_code = row.get_status_code()
		exist_context.update({'status_cocde': status_code}) 

		og_url = row.get_og_url()
		exist_context.update({'og_url': og_url})

		og_title = row.get_og_title()
		exist_context.update({'og_title': og_title})

		og_image = row.get_og_image()
		exist_context.update({'og_image': og_image})

		og_description = row.get_og_description()
		exist_context.update({'og_description': og_description})

		og_type = row.get_og_type()
		exist_context.update({'og_type': og_type})
                print exist_context
            except:
                print 'line 111 unexpected error. ', sys.exc_info()
          
            arg = "SUCCESS: " + decode_url
            logger.error(arg)

            return JsonResponse(exist_context, safe=False)

        plain_text = r.text
        print 'show plain_text'
        try:
            soup = BeautifulSoup(plain_text, 'lxml')
        except:
            print 'lxml error occur'
            arg = "FAIL: " + decode_url
            logger.error(arg)
            error_context = {'error_message': 'invalid request'}
            return JsonResponse(error_context, safe=False)


        print 'line 130'
        for og in soup.select('head > meta'):
            if og.get('property'):
                try:
                    if 'title' in og.get('property'):
                        print og.get('content')
                        new_context.update({'og_title': og.get('content')})
                        row.title_update(new_context['og_title'])

                    elif 'url' in og.get('property'):
                        new_context.update({'og_url': og.get('content')})
                        row.url_update(new_context['og_url'])


                    elif 'image' in og.get('property'):
                        new_context.update({'og_image': og.get('content')})
                        row.url_update(new_context['og_image'])


                    elif 'description' in og.get('property'):
                        new_context.update({'og_description': og.get('content')})
                        row.description_update(new_context['og_description'])

                    elif 'type' in og.get('property'):
                        new_context.update({'og_type': og.get('content')})
                        row.type_update(new_context['og_type'])
                except:
                    print 'line 161 unexpected error. ', sys.exc_info()

        # set context into redis cache, ttl
        try:
            v[1].set(decode_url, new_context)
            v[1].expire(decode_url, 64800) 
        except:
            print 'redis connection rebuilding...'
            try:
                print v[1]
                hostname = current_host_name
                index_list = [x for x, y in enumerate(kvlist) if y[0] == hostname]
                index = map(str, index_list)
                index = ''.join(index)
                index = int(index)
          
                if not kvlist: # if kvlist empty
                    pass
                else:
                    block_redis = kvlist.pop(index)
                    block_redis_list.append(block_redis)
                    ch = consistent_hashing.ConsistentHash(kvlist, replica)
            except:
                print 'not exist available redis cache server'
  

        print 'success save row'
        arg = "SUCCESS: " + decode_url
        try:
            logger.error(arg)
            print new_context
            return JsonResponse(new_context, safe=False)
        except:
            print 'json return unexpected error.', sys.exc_info()


def expire(request):
    if request.method == 'GET': 
        global ch
        global block_redis_list
        global kvlist
        global replica

        current_host_name
        url = urllib.quote(request.GET.get('url', ''))
        decode_url = urllib.unquote(url)
        try:
            r = requests.get(decode_url)
        
        except requests.exceptions.RequestException as e:
            arg = "NOT FOUND: " + decode_url
            logger.error(arg)
            error_context = {'error_message': 'invalid request'}
            return JsonResponse(error_context, safe=False)

        # try redis key expire 
        try:
            v = ch.get(decode_url)
            current_host_name = v[2]
            print 'v[0] = ', v[0]
            print 'v[1] = ', v[1]
            print 'v[2] = ', v[2]

            if v[1].get(decode_url):
                v[1].expire(decode_url, 1)
                print 'expire success'
            else:
                print 'key not exist' 
            for idx, block in enumerate(block_redis_list):
                try:
                    print 'try connect to block redis instance'
                    result = block[1].get('test connection')
                    kvlist.append(block)
                    ch = consistent_hashing.ConsistentHash(kvlist, replica)
                    block_redis_list.pop(idx)
                    print 'connect to revive redis instance'
                except:
                    pass

        except:
            print 'redis connection rebuilding...'
            try:
                print v[0]
                hostname = current_host_name
                index_list = [x for x, y in enumerate(kvlist) if y[0] == hostname]
                index = map(str, index_list)
                index = ''.join(index)
                index = int(index)
        
                if not kvlist:
                    pass
                else:
                    block_redis = kvlist.pop(index)
                    block_redis_list.append(block_redis)
                    ch = consistent_hashing.ConsistentHash(kvlist, replica)
            except:
                print 'not exist available redis cache server'  

            print 'occur unexpected error when redis key expire', sys.exc_info() 
 

        # try mysql row expire
        try:
            row = ScrapInformation.objects.get(request_url=decode_url)
        except ObjectDoesNotExist:
            row = None

        if row is None:
            print 'row does not exist' 
            error_context = {'error_message': 'row does not exist'}
            return JsonResponse(error_context, safe=False)

        else:
            delete_context = {}
            request_url = row.get_request_url()
	    delete_context.update({'request_url': decode_url})

	    status_code = row.get_status_code()
	    delete_context.update({'status_cocde': status_code}) 

	    og_url = row.get_og_url()
	    delete_context.update({'og_url': og_url})

	    og_title = row.get_og_title()
	    delete_context.update({'og_title': og_title})

	    og_image = row.get_og_image()
	    delete_context.update({'og_image': og_image})

	    og_description = row.get_og_description()
	    delete_context.update({'og_description': og_description})

	    og_type = row.get_og_type()
	    delete_context.update({'og_type': og_type})
                
            row.delete()
            print 'success row delete' 
            return JsonResponse(delete_context, safe=False)
    

        return HttpResponse("hello expire api world")



def index(request):
    if request.method == 'GET':
        return render(request, 'scraping/index.html')

