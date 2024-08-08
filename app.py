import os
import json
from datetime import datetime, timedelta
import pytz
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from flask import Flask, jsonify, request
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)

# Load Firebase service account credentials from environment variables
service_account_info = os.getenv('FIREBASE_SERVICE_ACCOUNT')
if not service_account_info:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT environment variable is not set.")
else:
    print("FIREBASE_SERVICE_ACCOUNT is set successfully.")

try:
    service_account_info = json.loads(service_account_info)
except json.JSONDecodeError as e:
    raise ValueError(f"Error decoding JSON from FIREBASE_SERVICE_ACCOUNT: {e}")

# Initialize Firebase app
cred = credentials.Certificate(service_account_info)
firebase_admin.initialize_app(cred)
db = firestore.client()
firebase_auth = firebase_auth.client

# Set the timezone to your local timezone
local_tz = pytz.timezone('Africa/Lagos')  # Replace with your timezone, e.g., 'America/New_York'

def get_week_start_end():
    """Get the start and end dates of the current week."""
    now = datetime.now(local_tz)
    start = now - timedelta(days=now.weekday())  # Monday
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=6)  # Sunday
    end = end.replace(hour=23, minute=59, second=59, microsecond=999999)
    return start, end

def store_weekly_results():
    """Store the weekly results in the weeklyResults collection."""
    start, end = get_week_start_end()

    # Query all governors for the current week
    governors_ref = db.collection('governors')
    query = governors_ref.where('weekStartDate', '>=', start).where('weekStartDate', '<=', end)
    governors = query.get()

    weekly_results = []
    for gov in governors:
        data = gov.to_dict()
        weekly_results.append({
            'id': gov.id,
            'name': data.get('name'),
            'state': data.get('state'),
            'avatar': data.get('avatar'),
            'totalVotes': data.get('totalVotes', 0),
            'infrastructure': data.get('infrastructure', 0),
            'security': data.get('security', 0),
            'education': data.get('education', 0),
            'healthcare': data.get('healthcare', 0),
            'jobs': data.get('jobs', 0),
            'engagement': data.get('engagement', 0)
        })

    # Sort results by totalVotes
    weekly_results.sort(key=lambda x: x['totalVotes'], reverse=True)

    # Get the winner (governor with highest totalVotes)
    winner = weekly_results[0] if weekly_results else None

    # Store results in weeklyResults collection
    doc_id = start.strftime("%Y-%m-%d")
    db.collection('weeklyResults').document(doc_id).set({
        'weekStart': start,
        'weekEnd': end,
        'results': weekly_results,
        'winner': winner
    })

    print(f"Weekly results stored for week starting {doc_id}")

def reset_votes():
    now = datetime.now(local_tz)
    week_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    governors_ref = db.collection('governors')
    governors = governors_ref.get()

    for gov in governors:
        gov.reference.update({
            'infrastructure': 0,
            'security': 0,
            'education': 0,
            'healthcare': 0,
            'jobs': 0,
            'totalVotes': 0,
            'engagement': 0,
            'weekStartDate': week_start
        })

    print("Votes reset for all governors")

# Setup scheduler
scheduler = BackgroundScheduler(timezone=local_tz)
scheduler.add_job(store_weekly_results, 'cron', day_of_week='sun', hour=23, minute=59)
scheduler.add_job(reset_votes, 'cron', day_of_week='mon', hour=0, minute=0)
scheduler.start()

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data['email']
    password = data['password']

    try:
        user = firebase_auth.create_user_with_email_and_password(email, password)
        user.send_email_verification()
        return jsonify({'message': 'Registration successful. Please check your email for a verification link.'}), 200
    except firebase_auth.AuthError as e:
        return jsonify({'error': e.error['message']}), 400

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data['email']
    password = data['password']

    try:
        user = firebase_auth.sign_in_with_email_and_password(email, password)
        if user['emailVerified']:
            return jsonify({'message': 'Sign-in successful'}), 200
        else:
            return jsonify({'error': 'Please verify your email before signing in.'}), 401
    except firebase_auth.AuthError as e:
        return jsonify({'error': e.error['message']}), 400

@app.route('/api/governor-data')
def get_governor_data():
    print("Fetching governor data...")
    start, end = get_week_start_end()

    # Query all governors for the current week
    governors_ref = db.collection('governors')
    query = governors_ref.where('weekStartDate', '>=', start).where('weekStartDate', '<=', end)
    governors = query.get()

    governor_data = []
    for gov in governors:
        data = gov.to_dict()
        governor_data.append({
            'id': gov.id,
            'name': data.get('name'),
            'state': data.get('state'),
            'avatar': data.get('avatar'),
            'totalVotes': data.get('totalVotes', 0),
            'infrastructure': data.get('infrastructure', 0),
            'security': data.get('security', 0),
            'education': data.get('education', 0),
            'healthcare': data.get('healthcare', 0),
            'jobs': data.get('jobs', 0),
            'engagement': data.get('engagement', 0)
        })

    print(f"Governor data: {governor_data}")
    return jsonify(governor_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
