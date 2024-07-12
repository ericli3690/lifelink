from flask import Flask, request, jsonify
import cv2
import pyperclip

from image_process import color_correct_image, draw_faces
from lang_model import predict_diagnosis
from firestore_utils import createEmergencyEntry

app = Flask(__name__)

# For Testing
@app.route('/', methods=['GET'])
def handle_get():
    response_data = {"message": "This is a GET request"}
    print("|| GET RECEIVED")
    return jsonify(response_data)


# Main POST route that the ESP32 interacts with
@app.route('/', methods=['POST'])
def handle_post():

    # Get base64 string
    data = request.get_json()
    base64_string = data['image']
    symptoms = data['symptoms']

    # Debug Data
    pyperclip.copy(base64_string) 
    print(data)
    print("\n\n\n")

    # Color Correction & Draw Faces
    image = color_correct_image(base64_string, 90, False)
    draw_faces(image)
    cv2.imwrite('face_detect.png', image)

    # Get LLM Prediction
    diagnosis = predict_diagnosis(symptoms)

    # Send data to cloud firestore
    createEmergencyEntry(image, diagnosis, symptoms, data['latitude'], data['longitude'])
    
    response_data = {
        "message": "Image succesfully recieved.",
        "received_data": data
    }
    return jsonify(response_data)

if __name__ == '__main__':
    print("Flask Server Started! 🚀")
    app.run(host='0.0.0.0', port=5000, debug=True)
