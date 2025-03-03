from django.urls import path
from .views import PageTitleView

urlpatterns = [
    path('title/', PageTitleView.as_view(), name='page_title'),
]
