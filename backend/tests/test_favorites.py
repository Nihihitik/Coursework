import pytest

def test_get_favorites(client, test_favorite, buyer_auth_header):
    """Тест получения списка избранных автомобилей"""
    response = client.get(
        "/favorites",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    favorites = response.json()
    assert len(favorites) >= 1
    assert favorites[0]["id"] == test_favorite.car_id

def test_get_favorites_unauthorized(client):
    """Тест получения избранного без авторизации"""
    response = client.get("/favorites")
    assert response.status_code == 401

def test_add_to_favorites(client, buyer_auth_header, test_car):
    """Тест добавления автомобиля в избранное"""
    # Сначала удаляем существующее избранное, если есть
    client.delete(
        f"/favorites/{test_car.id}",
        headers=buyer_auth_header
    )

    # Теперь добавляем в избранное
    response = client.post(
        f"/favorites/{test_car.id}",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Автомобиль добавлен в избранное"

    # Проверяем, что автомобиль появился в списке избранного
    response = client.get(
        "/favorites",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    favorites = response.json()
    assert any(fav["id"] == test_car.id for fav in favorites)

def test_add_to_favorites_duplicate(client, test_favorite, buyer_auth_header):
    """Тест добавления автомобиля, который уже в избранном"""
    response = client.post(
        f"/favorites/{test_favorite.car_id}",
        headers=buyer_auth_header
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Автомобиль уже в избранном"

def test_add_to_favorites_car_not_found(client, buyer_auth_header):
    """Тест добавления несуществующего автомобиля в избранное"""
    response = client.post(
        "/favorites/9999",
        headers=buyer_auth_header
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Автомобиль не найден"

def test_remove_from_favorites(client, test_favorite, buyer_auth_header):
    """Тест удаления автомобиля из избранного"""
    response = client.delete(
        f"/favorites/{test_favorite.car_id}",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Автомобиль удален из избранного"

    # Проверяем, что автомобиль удален из избранного
    response = client.get(
        "/favorites",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    favorites = response.json()
    assert not any(fav["id"] == test_favorite.car_id for fav in favorites)

def test_remove_from_favorites_not_in_favorites(client, buyer_auth_header):
    """Тест удаления автомобиля, которого нет в избранном"""
    response = client.delete(
        "/favorites/9999",
        headers=buyer_auth_header
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Автомобиль не в избранном"