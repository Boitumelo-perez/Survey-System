from django.db import models

class Survey(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    dob = models.DateField()
    contact_number = models.CharField(max_length=15)

    favorite_foods = models.CharField(max_length=100)
        # Ratings (1-5)
    movies_rating = models.IntegerField()
    radio_rating = models.IntegerField()
    eat_out_rating = models.IntegerField()
    tv_rating = models.IntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))