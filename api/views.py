from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PageTitle
from .serializers import PageTitleSerializer

class PageTitleView(APIView):
    def get(self, request):
        title = PageTitle.objects.first()
        serializer = PageTitleSerializer(title)
        return Response(serializer.data)
