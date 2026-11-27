from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class CraftAPITests(APITestCase):
    def setUp(self):
        self.payload = {
            'name': 'Test craft', 'description': 'Handmade',
            'category': 'Textiles', 'location': 'Test region',
            'materials': 'Wool', 'latitude': 40, 'longitude': 29,
        }

    def test_public_listing(self):
        self.assertEqual(self.client.get('/api/crafts/').status_code, 200)

    def test_anonymous_creation_denied(self):
        self.assertEqual(self.client.post('/api/crafts/', self.payload).status_code, 401)

    def test_authenticated_creation(self):
        user = get_user_model().objects.create_user(username='tester', password='test-password-123')
        self.client.force_authenticate(user=user)
        response = self.client.post('/api/crafts/', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['name'], 'Test craft')

    def test_invalid_coordinates(self):
        user = get_user_model().objects.create_user(username='tester')
        self.client.force_authenticate(user=user)
        self.assertEqual(self.client.post('/api/crafts/', {**self.payload, 'latitude': 99}, format='json').status_code, 400)

    def test_registration_and_login(self):
        credentials = {'username': 'newcontributor', 'password': 'Strong-test-password-483!'}
        response = self.client.post('/api/auth/register/', credentials, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)
        self.assertEqual(self.client.post('/api/auth/login/', credentials, format='json').status_code, 200)

    def test_owner_permissions(self):
        User = get_user_model()
        owner = User.objects.create_user(username='owner')
        other = User.objects.create_user(username='other')
        self.client.force_authenticate(user=owner)
        created = self.client.post('/api/crafts/', self.payload, format='json')
        self.assertEqual(created.status_code, 201)
        self.assertTrue(created.data['can_edit'])
        url = f"/api/crafts/{created.data['id']}/"
        self.client.force_authenticate(user=other)
        self.assertFalse(self.client.get(url).data['can_edit'])
        self.assertEqual(self.client.patch(url, {'name': 'Unauthorized'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(url).status_code, 403)
        self.client.force_authenticate(user=owner)
        self.assertEqual(self.client.patch(url, {'name': 'Updated'}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(url).status_code, 204)

    def test_legacy_craft_cannot_be_claimed(self):
        from .models import Craft
        craft = Craft.objects.create(**{**self.payload, 'category': __import__('crafts.models', fromlist=['Category']).Category.objects.get(name=self.payload['category'])})
        user = get_user_model().objects.create_user(username='contributor')
        self.client.force_authenticate(user=user)
        url = f'/api/crafts/{craft.pk}/'
        self.assertEqual(self.client.patch(url, {'owner': user.pk}, format='json').status_code, 403)

    def test_logout_revokes_token(self):
        from rest_framework.authtoken.models import Token
        user = get_user_model().objects.create_user(username='logoutuser')
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        self.assertEqual(self.client.post('/api/auth/logout/').status_code, 204)
        self.assertFalse(Token.objects.filter(user=user).exists())
        self.assertEqual(self.client.post('/api/crafts/', self.payload).status_code, 401)

    def test_reusable_tags(self):
        from .models import Tag
        user = get_user_model().objects.create_user(username='tagger')
        self.client.force_authenticate(user=user)
        for name in ['First craft', 'Second craft']:
            response = self.client.post('/api/crafts/', {
                **self.payload, 'name': name, 'tag_names': 'Handmade, wool, handmade',
            }, format='json')
            self.assertEqual(response.status_code, 201)
            self.assertEqual(set(response.data['tags']), {'handmade', 'wool'})
        self.assertEqual(Tag.objects.count(), 2)
        url = f"/api/crafts/{response.data['id']}/"
        updated = self.client.patch(url, {'tag_names': ''}, format='json')
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data['tags'], [])

    def test_production_and_volume(self):
        user = get_user_model().objects.create_user(username='maker')
        self.client.force_authenticate(user=user)
        response = self.client.post('/api/crafts/', {
            **self.payload, 'production_process': 'Hand shaped', 'volume': '1.250',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['volume'], '1.250')
        self.assertEqual(response.data['production_process'], 'Hand shaped')
        self.assertEqual(self.client.post('/api/crafts/', {
            **self.payload, 'volume': '-1',
        }, format='json').status_code, 400)

    def test_category_suggestion_requires_approval(self):
        from .models import Category
        user = get_user_model().objects.create_user(username='suggestor')
        self.client.force_authenticate(user=user)
        response = self.client.post('/api/crafts/categories/suggest/', {'name': 'Metalwork'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('Metalwork', self.client.get('/api/crafts/categories/').data)
        payload = {**self.payload, 'category': 'Metalwork'}
        self.assertEqual(self.client.post('/api/crafts/', payload, format='json').status_code, 400)
        Category.objects.filter(name='Metalwork').update(approved=True)
        self.assertEqual(self.client.post('/api/crafts/', payload, format='json').status_code, 201)
