"""
Telegram bot для клієнтів FITGYM.

Команди:
  /start     — вітання + інструкція як прив'язати акаунт
  /link CODE — прив'язати Telegram-чат до Member за 6-значним кодом
               (код видається у мобільному застосунку → /api/me/telegram-code/)
  /qr        — отримати PNG QR-перепустку клубу
  /schedule  — розклад занять на сьогодні у залі
  /my        — інфо про активний абонемент

Запуск: `python manage.py runbot` (long polling).
Для production — переключити на webhook.

Залежності:
  pip install python-telegram-bot==22.* qrcode[pil]
"""
from __future__ import annotations

import io
import json
import logging
import os
from datetime import date, datetime, timedelta

from django.db.models import Q
from django.utils import timezone

from telegram import Update
from telegram.ext import (
    Application, ApplicationBuilder, CommandHandler, ContextTypes,
)
import qrcode

from .models import (
    ClassSession, MembershipHistory, Member, TelegramLink,
)


log = logging.getLogger(__name__)


WELCOME_TEXT = (
    "👋 Вітаю у FITGYM!\n\n"
    "Я — твій кишеньковий помічник клубу. Через мене ти можеш:\n"
    "• отримати QR-перепустку для входу у зал — /qr\n"
    "• подивитись розклад на сьогодні — /schedule\n"
    "• перевірити свій абонемент — /my\n\n"
    "🔗 Спочатку прив'яжи свій акаунт:\n"
    "1. Відкрий мобільний додаток FITGYM → Кабінет → «Прив'язати Telegram»\n"
    "2. Скопіюй 6-значний код\n"
    "3. Надішли мені сюди: /link 123456"
)


def _get_member_by_chat(chat_id: int) -> Member | None:
    try:
        link = TelegramLink.objects.select_related('member__user', 'member__gym').get(
            chat_id=chat_id
        )
        return link.member
    except TelegramLink.DoesNotExist:
        return None


# ───────────────────────── Handlers ─────────────────────────

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(WELCOME_TEXT)


async def cmd_link(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text(
            "Введи код у форматі: /link 123456\n\n"
            "Код можна отримати у мобільному застосунку FITGYM → Кабінет → «Прив'язати Telegram»."
        )
        return

    code = context.args[0].strip()
    if len(code) != 6 or not code.isdigit():
        await update.message.reply_text("❌ Код має бути 6 цифр. Спробуй ще раз.")
        return

    chat_id = update.effective_chat.id
    username = update.effective_user.username or ""

    # Шукаємо TelegramLink з таким link_code (pending)
    from asgiref.sync import sync_to_async

    @sync_to_async
    def find_and_link():
        link = TelegramLink.objects.select_related('member__user').filter(
            link_code=code,
            link_code_expires_at__gte=timezone.now(),
        ).first()
        if not link:
            return None, 'expired_or_not_found'

        # Чи цей chat вже прив'язаний до іншого Member?
        existing = TelegramLink.objects.filter(chat_id=chat_id).exclude(pk=link.pk).first()
        if existing:
            return None, 'chat_already_linked'

        link.chat_id = chat_id
        link.telegram_username = username
        link.linked_at = timezone.now()
        link.link_code = None
        link.link_code_expires_at = None
        link.save()
        return link.member, 'ok'

    member, status = await find_and_link()

    if status == 'expired_or_not_found':
        await update.message.reply_text(
            "❌ Код невалідний або застарів. Згенеруй новий у мобільному застосунку."
        )
        return
    if status == 'chat_already_linked':
        await update.message.reply_text(
            "❌ Цей Telegram-акаунт вже прив'язаний до іншого клієнта."
        )
        return

    name = member.user.get_full_name() or member.user.username
    await update.message.reply_text(
        f"✅ Готово! Telegram прив'язано до акаунту {name}.\n\n"
        "Тепер можеш користуватись усіма командами. Спробуй /qr"
    )


async def cmd_qr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    from asgiref.sync import sync_to_async

    chat_id = update.effective_chat.id
    member = await sync_to_async(_get_member_by_chat)(chat_id)

    if not member:
        await update.message.reply_text(
            "❗ Спочатку прив'яжи акаунт командою /link <КОД>.\n"
            "Код отримуєш у мобільному застосунку → Кабінет → «Прив'язати Telegram»."
        )
        return

    payload = json.dumps({
        "member_id": member.pk,
        "gym_id": member.gym_id,
    })

    # Генеруємо QR PNG у пам'яті
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    name = member.user.get_full_name() or member.user.username
    await update.message.reply_photo(
        photo=buf,
        caption=(
            f"🎫 Твоя FITGYM-перепустка\n"
            f"Власник: {name}\n\n"
            "Покажи цей QR на ресепшн або скануй на турнікеті."
        ),
    )


async def cmd_schedule(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    from asgiref.sync import sync_to_async

    chat_id = update.effective_chat.id
    member = await sync_to_async(_get_member_by_chat)(chat_id)

    if not member or not member.gym_id:
        await update.message.reply_text(
            "❗ Спочатку прив'яжи акаунт командою /link <КОД>."
        )
        return

    today = date.today()
    start_dt = datetime.combine(today, datetime.min.time())
    end_dt = start_dt + timedelta(days=1)

    @sync_to_async
    def fetch_sessions():
        return list(
            ClassSession.objects.filter(
                gym_id=member.gym_id,
                start_at__gte=start_dt,
                start_at__lt=end_dt,
            ).select_related('class_type', 'instructor__user').order_by('start_at')
        )

    sessions = await fetch_sessions()

    if not sessions:
        await update.message.reply_text(f"📅 На сьогодні ({today.strftime('%d.%m.%Y')}) занять не заплановано.")
        return

    lines = [f"📅 Розклад на {today.strftime('%d.%m.%Y')}:\n"]
    for s in sessions:
        time = s.start_at.strftime('%H:%M')
        cname = s.class_type.name if s.class_type else 'Заняття'
        inst = ''
        if s.instructor_id:
            inst = f' · 👤 {s.instructor.user.get_full_name() or s.instructor.user.username}'
        lines.append(f"⏱ {time} — {cname}{inst}")

    await update.message.reply_text('\n'.join(lines))


async def cmd_my(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    from asgiref.sync import sync_to_async

    chat_id = update.effective_chat.id
    member = await sync_to_async(_get_member_by_chat)(chat_id)

    if not member:
        await update.message.reply_text("❗ Спочатку прив'яжи акаунт командою /link <КОД>.")
        return

    @sync_to_async
    def fetch_active():
        return MembershipHistory.objects.filter(
            member=member,
            status='active',
            end_date__gte=date.today(),
        ).select_related('membership_type').order_by('-end_date').first()

    active = await fetch_active()
    name = member.user.get_full_name() or member.user.username

    if not active:
        await update.message.reply_text(
            f"👤 {name}\n\n"
            "❌ У тебе немає активного абонементу.\n"
            "Купи у мобільному застосунку → Абонементи."
        )
        return

    days_left = (active.end_date - date.today()).days
    warning = ''
    if days_left <= 7:
        warning = '\n\n⚠️ Час оновити підписку! Залишилось менш як тиждень.'

    tariff = active.membership_type.name
    await update.message.reply_text(
        f"👤 {name}\n\n"
        f"💳 Тариф: {tariff}\n"
        f"📆 Дійсний до: {active.end_date.strftime('%d.%m.%Y')}\n"
        f"⏳ Залишилось: {days_left} дн.{warning}"
    )


# ───────────────────────── Bootstrap ─────────────────────────

def build_application() -> Application:
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not token:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN не встановлено. Створи бота через @BotFather, "
            "встанови токен у .env: TELEGRAM_BOT_TOKEN=...:..."
        )

    app = ApplicationBuilder().token(token).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("link", cmd_link))
    app.add_handler(CommandHandler("qr", cmd_qr))
    app.add_handler(CommandHandler("schedule", cmd_schedule))
    app.add_handler(CommandHandler("my", cmd_my))
    return app


def run_polling() -> None:
    logging.basicConfig(
        format='%(asctime)s · %(name)s · %(levelname)s · %(message)s',
        level=logging.INFO,
    )
    app = build_application()
    log.info("FITGYM bot starting (long polling)...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)
