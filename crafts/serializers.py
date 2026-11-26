import math
from rest_framework import serializers
from .models import Craft, Tag
from django.db import transaction


class CraftSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(slug_field='name', many=True, read_only=True)
    tag_names = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=510)

    def validate_tag_names(self, value):
        names = list(dict.fromkeys(name.strip().lower() for name in value.split(',') if name.strip()))
        if len(names) > 10 or any(len(name) > 50 for name in names):
            raise serializers.ValidationError('Use up to 10 tags, each at most 50 characters.')
        return names

    @transaction.atomic
    def create(self, validated_data):
        names = validated_data.pop('tag_names', [])
        craft = super().create(validated_data)
        craft.tags.set([Tag.objects.get_or_create(name=name)[0] for name in names])
        return craft

    @transaction.atomic
    def update(self, instance, validated_data):
        names = validated_data.pop('tag_names', None)
        craft = super().update(instance, validated_data)
        if names is not None:
            craft.tags.set([Tag.objects.get_or_create(name=name)[0] for name in names])
        return craft

    can_edit = serializers.SerializerMethodField()

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.owner_id == request.user.pk)

    class Meta:
        model = Craft
        fields = ['id', 'name', 'description', 'category', 'location', 'materials',
                  'weight', 'image', 'latitude', 'longitude', 'can_edit', 'tags', 'tag_names']

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
