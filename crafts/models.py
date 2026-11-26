
from django.conf import settings
from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Craft(models.Model):
    tags = models.ManyToManyField(Tag, blank=True, related_name='crafts')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                              on_delete=models.SET_NULL, related_name='crafts')
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    materials = models.CharField(max_length=200)
    weight = models.PositiveIntegerField(null=True, blank=True)

    image = models.ImageField(
        upload_to='crafts/',
        null=True,
        blank=True
    )

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name
