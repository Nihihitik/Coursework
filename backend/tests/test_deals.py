import pytest

def test_create_deal(client, test_car, buyer_auth_header):
    """Тест создания новой сделки"""
    response = client.post(
        "/deals",
        params={"car_id": test_car.id},
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    result = response.json()
    assert "deal_id" in result
    assert result["message"] == "Заявка успешно создана"

def test_create_deal_duplicate(client, test_deal, buyer_auth_header):
    """Тест создания дублирующейся сделки"""
    response = client.post(
        "/deals",
        params={"car_id": test_deal.car_id},
        headers=buyer_auth_header
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "У вас уже есть заявка на этот автомобиль"

def test_create_deal_car_not_found(client, buyer_auth_header):
    """Тест создания сделки на несуществующий автомобиль"""
    response = client.post(
        "/deals",
        params={"car_id": 9999},
        headers=buyer_auth_header
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Автомобиль не найден"

def test_get_my_deals_buyer(client, test_deal, buyer_auth_header):
    """Тест получения списка сделок для покупателя"""
    response = client.get(
        "/deals/my",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    deals = response.json()
    assert len(deals) >= 1
    assert deals[0]["id"] == test_deal.id
    assert deals[0]["car"]["id"] == test_deal.car_id

def test_get_my_deals_seller(client, test_deal, seller_auth_header):
    """Тест получения списка сделок для продавца"""
    response = client.get(
        "/deals/my",
        headers=seller_auth_header
    )
    assert response.status_code == 200
    deals = response.json()
    assert len(deals) >= 1
    assert deals[0]["id"] == test_deal.id
    assert deals[0]["car"]["id"] == test_deal.car_id
    assert "buyer" in deals[0]

def test_update_deal_status(client, test_deal, seller_auth_header):
    """Тест обновления статуса сделки"""
    new_status = "approved"
    response = client.put(
        f"/deals/{test_deal.id}/status",
        params={"status": new_status},
        headers=seller_auth_header
    )
    assert response.status_code == 200
    assert response.json()["message"] == f"Статус сделки обновлен на {new_status}"

    # Проверяем, что статус действительно изменился
    response = client.get(
        "/deals/my",
        headers=seller_auth_header
    )
    assert response.status_code == 200
    deals = response.json()
    deal = next((d for d in deals if d["id"] == test_deal.id), None)
    assert deal is not None
    assert deal["status"] == new_status

def test_update_deal_status_invalid(client, test_deal, seller_auth_header):
    """Тест обновления статуса сделки с некорректным значением"""
    response = client.put(
        f"/deals/{test_deal.id}/status",
        params={"status": "invalid_status"},
        headers=seller_auth_header
    )
    assert response.status_code == 400
    assert "Недопустимый статус" in response.json()["detail"]

def test_update_deal_status_not_found(client, seller_auth_header):
    """Тест обновления статуса несуществующей сделки"""
    response = client.put(
        "/deals/9999/status",
        params={"status": "approved"},
        headers=seller_auth_header
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Сделка не найдена"