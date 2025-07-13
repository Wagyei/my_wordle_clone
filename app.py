from flask import Flask, render_template, jsonify, request
import random
import time
from extract_words import extract_words

app = Flask(__name__)

WORDS_BY_LENGTH = extract_words("pride_and_prejudice")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-word')
def get_word():
    length = int(request.args.get("length", 5))
    words = WORDS_BY_LENGTH.get(length, set())
    if not words:
        return jsonify({'error': 'No words found'}), 404
    return jsonify({'word': random.choice(list(words))})

@app.route("/check-word")
def check_word():
    word = request.args.get("word", "").strip().lower()
    all_words = set().union(*WORDS_BY_LENGTH.values())
    is_valid = word in all_words
    return jsonify({"valid": is_valid})

if __name__ == "__main__":
    print(">>> Flask is starting...")
    app.run(debug=True)
