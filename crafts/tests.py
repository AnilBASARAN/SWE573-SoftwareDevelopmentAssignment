from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Craft


class CraftAPITests(APITestCase):
    fixtures = ["demo_crafts"]

    def test_list_keeps_existing_response_and_supports_combined_filters(self):
        url = reverse("craft-list")
        self.assertEqual(len(self.client.get(url).json()), 3)

        response = self.client.get(url, {"location": "Kadıköy", "category": "seramik"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual([craft["name"] for craft in response.json()], ["Moda Seramik Atölyesi"])

    def test_detail_supports_older_records_without_images(self):
        craft = Craft.objects.get(name="Moda Seramik Atölyesi")
        response = self.client.get(reverse("craft-detail", args=[craft.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], craft.pk)
        self.assertIsNone(response.json()["image"])

    def test_missing_detail_returns_404(self):
        response = self.client.get(reverse("craft-detail", args=[0]))
        self.assertEqual(response.status_code, 404)
