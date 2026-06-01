from __future__ import annotations
from typing import Optional
from .models import Gym


def get_gym_from_request(request) -> Optional[Gym]:
    """
    Повертає Gym поточного автентифікованого користувача.
    SuperAdmin (is_superuser=True) не прив'язаний до gym — повертає None.
    """
    if request.user.is_superuser:
        return None

    member = getattr(request.user, 'member', None)
    if member and member.gym_id:
        return member.gym

    instructor = getattr(request.user, 'instructor', None)
    if instructor and instructor.gym_id:
        return instructor.gym

    return None
