#register_test.py

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_user_registration():
    client = APIClient()
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    url = reverse('register')
    response = client.post(url, data, format='json')
    assert response.status_code == 201
