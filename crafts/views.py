from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Craft
from .serializers import CraftSerializer


class CraftListView(ListAPIView):
    queryset = Craft.objects.order_by("pk")
    serializer_class = CraftSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        for field in ("category", "location"):
            value = self.request.query_params.get(field, "").strip()
            if value:
                queryset = queryset.filter(**{f"{field}__iexact": value})
        return queryset


class CraftDetailView(RetrieveAPIView):
    queryset = Craft.objects.all()
    serializer_class = CraftSerializer
