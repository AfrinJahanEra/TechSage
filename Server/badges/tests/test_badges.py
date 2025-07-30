import pytest
from badges.models import Badge

@pytest.mark.parametrize("points,expected_name", [
    (0, None),
    (99, None),
    (100, "ruby"),
    (200, "bronze"),
    (299, "bronze"),
    (300, "silver"),
    (349, "silver"),
    (350, "sapphire"),
    (399, "sapphire"),
    (400, "gold"),
    (499, "gold"),
    (500, "diamond"),
    (700, "diamond"),
])
def test_get_badge(points, expected_name):
    badge = Badge.get_badge(points)
    if expected_name is None:
        assert badge is None
    else:
        assert badge["name"] == expected_name
        assert badge["image_url"].endswith(f"{expected_name}.png")


# run with pytest -v badges/tests/test_badges.py


def test_badge_just_below_threshold(points, expected_name):
    badge = Badge.get_badge(points)
    if expected_name is None:
        assert badge is None
    else:
        assert badge["name"] == expected_name


def test_badge_above_max():
    badge = Badge.get_badge(1000)
    assert badge["name"] == "diamond"
    assert badge["image_url"].endswith("diamond.png")


