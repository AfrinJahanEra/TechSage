from django.db import models

class Badge:
    BADGE_THRESHOLDS = {
        "diamond": 500,
        "gold": 400,
        "silver": 300,
        "bronze": 200,
        "ruby": 100
    }

    BADGE_IMAGES = {
        "diamond": "/static/badges/diamond.png",
        "gold": "/static/badges/gold.png",
        "silver": "/static/badges/silver.png",
        "bronze": "/static/badges/bronze.png",
        "ruby": "/static/badges/ruby.png"
    }

    @classmethod
    def get_badge(cls, points):
        for badge, threshold in sorted(cls.BADGE_THRESHOLDS.items(), key=lambda x: -x[1]):
            if points >= threshold:
                return {
                    "name": badge,
                    "image_url": cls.BADGE_IMAGES[badge]
                }
        return None
