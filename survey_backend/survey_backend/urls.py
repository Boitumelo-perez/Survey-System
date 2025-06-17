from django.contrib import admin
from django.urls import path
from surveys import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/surveys/', views.submit_survey, name='submit_survey'),
   path('api/surveys/results/', views.survey_results, name='survey_results'),
]
