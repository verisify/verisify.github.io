# app.py
from flask import Flask, request, jsonify
import os
import json
from datetime import datetime, timedelta
import pytz
import firebase_admin
from firebase_admin import credentials, firestore

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

@app.route('/api/store_weekly_results', methods=['POST'])
def api_store_weekly_results():
    store_weekly_results()
    return jsonify({"message": "Weekly results stored successfully"})

@app.route('/api/reset_votes', methods=['POST'])
def api_reset_votes():
    reset_votes()
    return jsonify({"message": "Votes reset successfully"})

@app.route('/api/fetch_weekly_results', methods=['GET'])
def api_fetch_weekly_results():
    try:
        current_monday = get_previous_monday(datetime.now(local_tz))
        results = fetch_weekly_results(current_monday)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update_winner_profile', methods=['GET'])
def api_update_winner_profile():
    try:
        winner = update_winner_profile()
        return jsonify(winner)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/initialize_engagement', methods=['POST'])
def api_initialize_engagement():
    try:
        initialize_engagement()
        return jsonify({"message": "Engagement initialized successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_previous_monday(date):
    prev_monday = date - timedelta(days=(date.weekday() + 6) % 7)
    prev_monday = prev_monday.replace(hour=0, minute=0, second=0, microsecond=0)
    return prev_monday

def fetch_weekly_results(selected_date):
    monday_of_week = get_previous_monday(selected_date)
    governors_ref = db.collection('governors')
    query = governors_ref.where('weekStartDate', '>=', monday_of_week)
    snapshot = query.get()

    results = []
    for doc in snapshot:
        data = doc.to_dict()
        results.append({
            'id': doc.id,
            'name': data.get('name'),
            'state': data.get('state'),
            'avatar': data.get('avatar'),
            'totalVotes': data.get('totalVotes', 0),
            'infrastructure': data.get('infrastructure', 0),
            'security': data.get('security', 0),
            'education': data.get('education', 0),
            'healthcare': data.get('healthcare', 0),
            'jobs': data.get('jobs', 0),
            'engagement': data.get('engagement', 0),
            'weekStartDate': data.get('weekStartDate')
        })

    results.sort(key=lambda x: x['totalVotes'], reverse=True)
    return results

def update_winner_profile():
    latest_result = fetch_latest_weekly_result()
    if not latest_result or not latest_result.get('winner'):
        return {"error": "No winner data available"}
    winner = latest_result.get('winner')
    return winner

def fetch_latest_weekly_result():
    weekly_results_ref = db.collection('weeklyResults')
    query = weekly_results_ref.order_by('weekStart', direction='DESCENDING').limit(1)
    snapshot = query.get()

    if snapshot.empty:
        return None

    latest_result = snapshot.docs[0].to_dict()
    return latest_result

def initialize_engagement():
    governors_ref = db.collection('governors')
    snapshot = governors_ref.get()

    for doc in snapshot:
        data = doc.to_dict()
        if data.get('engagement') is None:
            # Initialize engagement as the sum of absolute values of all category votes
            engagement = sum(abs(data.get(category, 0)) for category in ['infrastructure', 'security', 'education', 'healthcare', 'jobs'])
            doc.reference.update({'engagement': engagement})

    print("Engagement initialization complete")

if __name__ == '__main__':
    app.run(debug=True)
