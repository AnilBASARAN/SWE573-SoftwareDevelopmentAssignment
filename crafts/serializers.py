import math
from rest_framework import serializers
from .models import Craft


class CraftSerializer(serializers.ModelSerializer):
    can_edit = serializers.SerializerMethodField()

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.owner_id == request.user.pk)

    class Meta:
        model = Craft
        fields = ['id', 'name', 'description', 'category', 'location', 'materials',
                  'weight', 'image', 'latitude', 'longitude', 'can_edit']

    def validate_image(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Image must be at most 5 MB.')
        return value

    def validate(self, attrs):
        lat = attrs.get('latitude', getattr(self.instance, 'latitude', None))
        lon = attrs.get('longitude', getattr(self.instance, 'longitude', None))
        if (lat is None) != (lon is None):
            raise serializers.ValidationError('Provide both latitude and longitude.')
        if lat is not None and (not math.isfinite(lat) or not -85 <= lat <= 85):
            raise serializers.ValidationError({'latitude': 'Use a latitude between -85 and 85.'})
        if lon is not None and (not math.isfinite(lon) or not -180 <= lon <= 180):
            raise serializers.ValidationError({'longitude': 'Use a longitude between -180 and 180.'})
        return attrs
