function showSection(sectionName) {
    document.getElementById('surveyFormSection').style.display = 'none';
    document.getElementById('surveyResultsSection').style.display = 'none';

    if (sectionName === 'Form') {
        document.getElementById('surveyFormSection').style.display = 'block';
    } else if (sectionName === 'Results') {
        document.getElementById('surveyResultsSection').style.display = 'block';
        fetchSurveyResults();
    }

    document.querySelectorAll('.Nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchSurveyResults();
});

function fetchSurveyResults() {
    fetch('http://localhost:8000/api/surveys/results/')
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    if (data.message === 'No surveys available') {
                        document.getElementById('noDataMessage').style.display = 'block';
                        document.getElementById('resultsTable').style.display = 'none';
                        throw new Error('No surveys available');
                    } else {
                        throw new Error('Error fetching data');
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);

            document.getElementById('noDataMessage').style.display = 'none';
            document.getElementById('resultsTable').style.display = 'table';

            document.getElementById('totalSurveys').textContent = data.total_surveys;
            document.getElementById('avgAge').textContent = data.average_age;
            document.getElementById('maxAge').textContent = data.oldest_participant;
            document.getElementById('minAge').textContent = data.youngest_participant;
            document.getElementById('pizzaPct').textContent = data.pizza_percentage + '%';
            document.getElementById('pastaPct').textContent = data.pasta_percentage + '%';
            document.getElementById('papWorsPct').textContent = data.pap_and_wors_percentage + '%';
            document.getElementById('moviesAvg').textContent = data.avg_movies_rating;
            document.getElementById('radioAvg').textContent = data.avg_radio_rating;
            document.getElementById('eatOutAvg').textContent = data.avg_eat_out_rating;
            document.getElementById('tvAvg').textContent = data.avg_tv_rating;
        })
        .catch(error => {
            console.error('Error:', error.message);
            document.getElementById('noDataMessage').style.display = 'block';
            document.getElementById('resultsTable').style.display = 'none';
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('surveyForm');
    const nameInput = document.getElementById('names');
    const emailInput = document.getElementById('email');
    const dobInput = document.getElementById('dateOfBirth');
    const contactInput = document.getElementById('contactNumber');
    const foodCheckboxes = document.querySelectorAll('input[name="favouriteFood"]');
    const submitBtn = document.getElementById('submitBtn');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const dobError = document.getElementById('dobError');
    const contactError = document.getElementById('contactError');
    const foodError = document.getElementById('foodError');
    const ratingError = document.getElementById('ratingError');

    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    dobInput.addEventListener('change', validateDOB);
    contactInput.addEventListener('input', validateContact);

    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    const minDate = new Date(today);
    minDate.setFullYear(minDate.getFullYear() - 120);
    dobInput.setAttribute('max', maxDate);
    dobInput.setAttribute('min', minDate.toISOString().split('T')[0]);

    function validateName() {
        const nameValue = nameInput.value.trim();
        if (nameValue === '') {
            showError(nameInput, nameError, 'Name is required');
            return false;
        } else if (!/^[a-zA-Z\s]{2,}$/.test(nameValue)) {
            showError(nameInput, nameError, 'Name should contain at least 2 letters and only letters/spaces');
            return false;
        } else {
            clearError(nameInput, nameError);
            return true;
        }
    }

    function validateEmail() {
        const emailValue = emailInput.value.trim();
        if (emailValue === '') {
            showError(emailInput, emailError, 'Email is required');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            showError(emailInput, emailError, 'Please enter a valid email address');
            return false;
        } else {
            clearError(emailInput, emailError);
            return true;
        }
    }

    function validateDOB() {
        const dobValue = dobInput.value;
        if (!dobValue) {
            showError(dobInput, dobError, 'Date of Birth is required');
            return false;
        }

        const dobDate = new Date(dobValue);
        const today = new Date();
        const minAgeDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        const maxAgeDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());

        if (dobDate < minAgeDate) {
            showError(dobInput, dobError, 'Age cannot be more than 120 years');
            return false;
        } else if (dobDate > maxAgeDate) {
            showError(dobInput, dobError, 'Age must be at least 5 years');
            return false;
        } else if (dobDate > today) {
            showError(dobInput, dobError, 'Date of Birth cannot be in the future');
            return false;
        } else {
            clearError(dobInput, dobError);
            return true;
        }
    }

    function validateContact() {
        const contactValue = contactInput.value.trim();
        if (contactValue === '') {
            showError(contactInput, contactError, 'Contact number is required');
            return false;
        } else if (!/^0[0-9]{9}$/.test(contactValue)) {
            showError(contactInput, contactError, 'Please enter a valid 10-digit South African number starting with 0');
            return false;
        } else {
            clearError(contactInput, contactError);
            return true;
        }
    }

    function validateFood() {
        let checked = false;
        foodCheckboxes.forEach(cb => {
            if (cb.checked) checked = true;
        });

        if (!checked) {
            foodError.textContent = 'Please select at least one favorite food';
            return false;
        } else {
            foodError.textContent = '';
            return true;
        }
    }

    function validateRatings() {
        const requiredRatings = ['movies', 'radio', 'eat', 'tv'];
        for (let rating of requiredRatings) {
            if (!document.querySelector(`input[name="${rating}"]:checked`)) {
                ratingError.textContent = 'Please answer all rating questions';
                return false;
            }
        }
        ratingError.textContent = '';
        return true;
    }

    function showError(input, errorElement, message) {
        input.classList.add('invalid');
        errorElement.textContent = message;
    }

    function clearError(input, errorElement) {
        input.classList.remove('invalid');
        errorElement.textContent = '';
    }

    foodCheckboxes.forEach(cb => cb.addEventListener('change', validateFood));
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', validateRatings);
    });

    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        submitSurvey();
    });

    async function submitSurvey() {
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isDOBValid = validateDOB();
        const isContactValid = validateContact();
        const isFoodValid = validateFood();
        const isRatingsValid = validateRatings();

        if (!(isNameValid && isEmailValid && isDOBValid && isContactValid && isFoodValid && isRatingsValid)) {
            const firstError = document.querySelector('.invalid') || document.querySelector('.section-error:not(:empty)');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            dob: dobInput.value,
            contact: contactInput.value.trim(),
            foods: Array.from(document.querySelectorAll('input[name="favouriteFood"]:checked')).map(cb => cb.value),
            movies: document.querySelector('input[name="movies"]:checked').value,
            radio: document.querySelector('input[name="radio"]:checked').value,
            eat: document.querySelector('input[name="eat"]:checked').value,
            tv: document.querySelector('input[name="tv"]:checked').value
        };

        try {
            const response = await fetch('http://localhost:8000/api/surveys/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to submit');

            alert('Survey submitted successfully!');
            form.reset();
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Error submitting survey. Please try again.');
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
