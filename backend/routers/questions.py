from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.schemas.database import get_db
from backend.schemas import Question, Car
from backend.auth import get_current_buyer, get_current_seller, get_current_user

router = APIRouter(tags=["questions"])

@router.post("", response_model=Dict[str, Any])
async def ask_question(
    car_id: int,
    question: str,
    current_user = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Задать вопрос по автомобилю (только для покупателей)"""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    q = Question(car_id=car_id, buyer_id=current_user.id, question=question)
    db.add(q)
    db.commit()
    db.refresh(q)

    return {"message": "Вопрос отправлен", "question_id": q.id}

@router.get("/my", response_model=List[Dict[str, Any]])
async def get_my_questions(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить список вопросов для текущего пользователя"""
    if hasattr(current_user, 'favorites'):  # покупатель
        questions = db.query(Question).filter(Question.buyer_id == current_user.id).all()
    else:  # продавец
        questions = db.query(Question).join(Car).filter(Car.seller_id == current_user.id).all()

    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "car_id": q.car_id,
            "question": q.question,
            "answer": q.answer,
            "created_at": q.created_at.isoformat(),
            "buyer_id": q.buyer_id
        })
    return result

@router.put("/{question_id}/answer", response_model=Dict[str, Any])
async def answer_question(
    question_id: int,
    answer: str,
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Ответить на вопрос покупателя (только для продавцов)"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")

    if question.car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="У вас нет прав на ответ на этот вопрос")

    question.answer = answer
    db.commit()

    return {"message": "Ответ сохранен"}
