import math
from rest_framework import serializers
from .models import Craft


class CraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Craft
        fields = '__all__'

    def validate_image(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Image must be at most 5 MB.')
        return value

    def validate(self, attrs):
        lat = attrs.get('latitude')
        lon = attrs.get('longitude')
        if (lat is None) != (lon is None):
            raise serializers.ValidationError('Provide both latitude and longitude.')
        if lat is not None and (not math.isfinite(lat) or not -85 <= lat <= 85):
            raise serializers.ValidationError({'latitude': 'Use a latitude between -85 and 85.'})
        if lon is not None and (not math.isfinite(lon) or not -180 <= lon <= 180):
            raise serializers.ValidationError({'longitude': 'Use a longitude between -180 and 180.'})
        return attrs
