from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^index/$', views.index, name='index'),
    url(r'^scrap/$', views.scrap, name='scrap'),
    url(r'^expire/$', views.expire, name='expire'), 
]
