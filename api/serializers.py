from rest_framework import serializers
from .models import PageTitle

class PageTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageTitle
        fields = ['title']
