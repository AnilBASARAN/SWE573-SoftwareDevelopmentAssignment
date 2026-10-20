
from django.db import models


class Craft(models.Model):
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

    def __str__(self):
        return self.name
