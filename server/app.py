from flask import Flask, request, jsonify
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

@app.route('/', methods=['GET'])
def handle_get():
    response_data = {"message": "This is a GET request"}
    print("|| GET RECEIVED")
    return jsonify(response_data)

@app.route('/', methods=['POST'])
def handle_post():
    data = request.get_json()
    base64_string = data['image']
    image_data = base64.b64decode(base64_string)

    image = Image.open(BytesIO(image_data))
    image.show()
    
    response_data = {
        "message": "This is a POST request",
        "received_data": data
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
