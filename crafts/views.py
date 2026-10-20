
from rest_framework.generics import ListAPIView
from .models import Craft
from .serializers import CraftSerializer


class CraftListView(ListAPIView):
    queryset = Craft.objects.all()
    serializer_class = CraftSerializer
