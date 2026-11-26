from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Craft
from .serializers import CraftSerializer


class CraftListView(ListCreateAPIView):
    queryset = Craft.objects.all()
    serializer_class = CraftSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS or (
            request.user.is_authenticated and obj.owner_id == request.user.pk
        )


class CraftDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Craft.objects.all()
    serializer_class = CraftSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        User = get_user_model()
        username = serializers.CharField(max_length=150)
        password = serializers.CharField(trim_whitespace=False, write_only=True)
        try:
            name = username.run_validation(request.data.get('username'))
            secret = password.run_validation(request.data.get('password'))
            user = User(username=name)
            user.full_clean(exclude=['password'])
            validate_password(secret, user)
            with transaction.atomic():
                user.set_password(secret)
                user.save()
                token = Token.objects.create(user=user)
        except ValidationError as exc:
            return Response({'detail': exc.messages}, status=400)
        except IntegrityError:
            return Response({'detail': 'Username already exists.'}, status=400)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)
