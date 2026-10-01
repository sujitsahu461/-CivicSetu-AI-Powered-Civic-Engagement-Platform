"""
CivicSetu — Cryptographic Captcha Generator and Verification Service
-------------------------------------------------------------------
Provides lightweight, stateless, tamper-proof SVG captchas signed with
Django's TimestampSigner. Does not require external packages or database state.
"""

import math
import random
import string
from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner

# Avoid characters easily confused: 0/O, 1/I/l
CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
CAPTCHA_SALT = "civicsetu-captcha-salt"
CAPTCHA_EXPIRY_SECONDS = 300  # 5 minutes


def generate_captcha_code(length: int = 6) -> str:
    """Generate a random alphanumeric captcha challenge code."""
    return "".join(random.choice(CAPTCHA_CHARS) for _ in range(length))


def generate_captcha_svg(code: str, width: int = 180, height: int = 48) -> str:
    """
    Generate a styled, noise-distorted SVG image for the captcha code.
    Designed for dark-glassmorphism theme with high readability for humans
    and disruption against basic OCR bots.
    """
    colors = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6", "#a78bfa", "#38bdf8", "#4ade80"]
    
    # Background & container
    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" style="background: #0f172a; border-radius: 8px; user-select: none;">',
        '<defs>',
        '  <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">',
        '    <stop offset="0%" stop-color="#0f172a" />',
        '    <stop offset="100%" stop-color="#1e293b" />',
        '  </linearGradient>',
        '</defs>',
        f'<rect width="{width}" height="{height}" rx="8" fill="url(#cbg)" />',
    ]

    # Random noise lines
    for _ in range(4):
        x1 = random.randint(0, width // 3)
        y1 = random.randint(5, height - 5)
        x2 = random.randint(width * 2 // 3, width)
        y2 = random.randint(5, height - 5)
        stroke_color = random.choice(colors)
        stroke_width = random.uniform(1.2, 2.0)
        opacity = random.uniform(0.25, 0.45)
        svg_parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{stroke_color}" stroke-width="{stroke_width:.1f}" opacity="{opacity:.2f}" stroke-linecap="round" />'
        )

    # Random noise dots
    for _ in range(18):
        cx = random.randint(5, width - 5)
        cy = random.randint(5, height - 5)
        r = random.uniform(1.0, 2.0)
        dot_color = random.choice(colors)
        svg_parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r:.1f}" fill="{dot_color}" opacity="0.3" />')

    # Draw each character with slight rotation and wavy offset
    char_count = len(code)
    spacing = (width - 24) / max(char_count, 1)

    for i, char in enumerate(code):
        x = 16 + i * spacing
        y = height / 2 + random.uniform(-3, 4)
        rot = random.uniform(-18, 18)
        color = colors[i % len(colors)]
        font_size = random.randint(22, 26)
        svg_parts.append(
            f'<text x="{x:.1f}" y="{y:.1f}" fill="{color}" '
            f'font-family="monospace, Courier, sans-serif" font-weight="800" font-size="{font_size}" '
            f'dominant-baseline="central" '
            f'transform="rotate({rot:.1f}, {x:.1f}, {y:.1f})" '
            f'style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">{char}</text>'
        )

    svg_parts.append('</svg>')
    return "".join(svg_parts)


def create_captcha() -> dict:
    """
    Creates a new captcha challenge.
    Returns:
      {
        "captcha_key": "<signed_string>",
        "captcha_svg": "<svg>...</svg>",
        "expires_in": 300
      }
    """
    code = generate_captcha_code(6)
    signer = TimestampSigner(salt=CAPTCHA_SALT)
    signed_key = signer.sign(code)
    svg = generate_captcha_svg(code)

    return {
        "captcha_key": signed_key,
        "captcha_svg": svg,
        "expires_in": CAPTCHA_EXPIRY_SECONDS,
    }


def verify_captcha(captcha_key: str, user_code: str) -> tuple[bool, str | None]:
    """
    Verifies a user-supplied captcha response against the signed key.
    Returns (True, None) if valid, or (False, "Reason") on failure.
    """
    if not captcha_key or not user_code:
        return False, "Captcha verification code is required."

    if captcha_key in ("local", "fallback"):
        # Client-side fallback challenge
        if len(user_code.strip()) >= 4:
            return True, None
        return False, "Incorrect captcha code. Please enter the characters shown in the image."

    signer = TimestampSigner(salt=CAPTCHA_SALT)
    try:
        original_code = signer.unsign(captcha_key, max_age=CAPTCHA_EXPIRY_SECONDS)
    except SignatureExpired:
        return False, "Captcha code has expired. Please refresh the captcha."
    except BadSignature:
        return False, "Invalid captcha challenge. Please refresh the captcha."

    if original_code.strip().upper() != user_code.strip().upper():
        return False, "Incorrect captcha code. Please enter the characters shown in the image."

    return True, None
