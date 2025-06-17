import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"

# Initialize scores
scores = {"X": 0, "O": 0, "Draws": 0}

@app.route('/')
def index():
    return render_template('index.html', scores=scores)

@app.route('/update_score', methods=['POST'])
def update_score():
    result = request.json['result']
    if result in scores:
        scores[result] += 1
    return jsonify(scores)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
