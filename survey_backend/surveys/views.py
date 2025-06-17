from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Survey
import json
import pandas as pd
from datetime import datetime
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def submit_survey(request):
    if request.method == 'POST':
        try:
            logger.info(f"Raw request data: {request.body}")
            data = json.loads(request.body)
            logger.info(f"Parsed data: {data}")
            
            # Validate required fields
            required_fields = ['name', 'email', 'dob', 'contact', 'foods', 'movies', 'radio', 'eat', 'tv']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'status': 'error', 'message': f'Missing field: {field}'}, status=400)

            survey = Survey(
                name=data['name'],
                email=data['email'],
                dob=datetime.strptime(data['dob'], '%Y-%m-%d').date(),
                contact_number=data['contact'],
                favorite_foods=data['foods'],  # Expecting a list
                movies_rating=int(data['movies']),
                radio_rating=int(data['radio']),
                eat_out_rating=int(data['eat']),
                tv_rating=int(data['tv'])
            )
            
            survey.full_clean()
            survey.save()
            logger.info(f"Survey saved with ID: {survey.id}")
            
            return JsonResponse({'status': 'success', 'id': survey.id})
            
        except ValidationError as e:
            logger.error("Validation error", exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'Validation error', 'errors': e.message_dict}, status=400)
        except Exception as e:
            logger.error(f"Error saving survey: {str(e)}", exc_info=True)
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Only POST method allowed'}, status=405)


def survey_results(request):
    try:
        surveys = Survey.objects.all()
        
        if not surveys.exists():
            return JsonResponse({'message': 'No surveys available'}, status=404)
        
        survey_data = []
        for survey in surveys:
            survey_data.append({
                'age': survey.age,
                'favorite_foods': survey.favorite_foods,
                'movies_rating': survey.movies_rating,
                'radio_rating': survey.radio_rating,
                'eat_out_rating': survey.eat_out_rating,
                'tv_rating': survey.tv_rating
            })
        
        df = pd.DataFrame(survey_data)

        def calculate_food_pct(food_item):
            return round((df['favorite_foods'].apply(lambda foods: food_item in foods).mean() * 100), 1)
        
        results = {
            'total_surveys': len(df),
            'average_age': round(df['age'].mean(), 1),
            'oldest_participant': int(df['age'].max()),
            'youngest_participant': int(df['age'].min()),
            'pizza_percentage': calculate_food_pct('Pizza'),
            'pasta_percentage': calculate_food_pct('Pasta'),
            'pap_and_wors_percentage': calculate_food_pct('Pap and Wors'),
            'avg_movies_rating': round(df['movies_rating'].mean(), 1),
            'avg_radio_rating': round(df['radio_rating'].mean(), 1),
            'avg_eat_out_rating': round(df['eat_out_rating'].mean(), 1),
            'avg_tv_rating': round(df['tv_rating'].mean(), 1),
        }
        
        return JsonResponse(results)
        
    except Exception as e:
        logger.error("Error generating survey results", exc_info=True)
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
