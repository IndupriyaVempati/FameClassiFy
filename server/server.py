from flask import Flask, request, jsonify
import util
import os
from flask_cors import CORS
app = Flask(__name__, static_folder='./ui', static_url_path='/')


CORS(app)

@app.route('/')
def index():
    return "Welcome to the Flask app!"

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    image_data = request.form['image_data']

    response = jsonify(util.classify_image(image_data))

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Celebrity Image Classification")
    util.load_saved_artifacts()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
   
