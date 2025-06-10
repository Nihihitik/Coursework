import pytest


def test_create_question(client, test_car, buyer_auth_header):
    response = client.post(
        "/questions",
        params={"car_id": test_car.id, "question": "Есть ли торг?"},
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert "question_id" in data
    assert data["message"] == "Вопрос отправлен"


def test_get_my_questions_buyer(client, test_question, buyer_auth_header):
    response = client.get("/questions/my", headers=buyer_auth_header)
    assert response.status_code == 200
    questions = response.json()
    assert any(q["id"] == test_question.id for q in questions)


def test_get_my_questions_seller(client, test_question, seller_auth_header):
    response = client.get("/questions/my", headers=seller_auth_header)
    assert response.status_code == 200
    questions = response.json()
    assert any(q["id"] == test_question.id for q in questions)


def test_answer_question(client, test_question, seller_auth_header, buyer_auth_header):
    response = client.put(
        f"/questions/{test_question.id}/answer",
        params={"answer": "Да, возможен."},
        headers=seller_auth_header
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Ответ сохранен"

    # Проверяем, что ответ сохранился и покупатель его видит
    response = client.get("/questions/my", headers=buyer_auth_header)
    assert response.status_code == 200
    questions = response.json()
    q = next((item for item in questions if item["id"] == test_question.id), None)
    assert q is not None
    assert q["answer"] == "Да, возможен."
