from flask import Flask, request, jsonify
import cv2
import pyperclip

from image_process import color_correct_image, draw_faces

app = Flask(__name__)

@app.route('/', methods=['GET'])
def handle_get():
    response_data = {"message": "This is a GET request"}
    print("|| GET RECEIVED")
    return jsonify(response_data)

@app.route('/', methods=['POST'])
def handle_post():
    # Get base64 string
    data = request.get_json()
    base64_string = data['image']
    pyperclip.copy(base64_string)
    print('Image Recieved - Base64 Copied!')

    # Color Correction & Draw Faces
    image = color_correct_image(base64_string, 0, False)
    draw_faces(image)
    cv2.imwrite('face_detect.png', image)
    
    response_data = {
        "message": "Image succesfully recieved.",
        "received_data": data
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
