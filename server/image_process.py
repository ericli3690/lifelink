import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np

from datetime import datetime 

def increase_exposure(img, factor):
    img = cv2.convertScaleAbs(img, alpha=factor, beta=0)
    return img

def adjust_white_balance(image, factor):
    result = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)  # Convert image to LAB color space
    avg_a = np.average(result[:, :, 1])  # Compute the average of the a channel
    avg_b = np.average(result[:, :, 2])  # Compute the average of the b channel
    result[:, :, 1] = result[:, :, 1] - ((avg_a - 128) * (result[:, :, 0] / 255.0) * factor)  # Adjust a channel
    result[:, :, 2] = result[:, :, 2] - ((avg_b - 128) * (result[:, :, 0] / 255.0) * factor)  # Adjust b channel
    result = cv2.cvtColor(result, cv2.COLOR_LAB2BGR)  # Convert back to BGR color space
    return result

def increase_saturation(img, value):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)  # Convert to HSV
    h, s, v = cv2.split(hsv)  # Split the channels
    s = cv2.add(s, value)  # Increase the S channel
    s[s > 255] = 255  # Cap at 255
    s[s < 0] = 0  # Cap at 0
    final_hsv = cv2.merge((h, s, v))  # Merge channels back
    img = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)  # Convert back to BGR
    return img

def rotate_image(image, angle):
    (h, w) = image.shape[:2]  # Get the image dimensions
    center = (w // 2, h // 2)  # Calculate the center of the image

    # Calculate the rotation matrix
    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    # Calculate the cosine and sine of the rotation matrix
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])

    # Compute the new bounding dimensions of the image
    new_w = int((h * sin) + (w * cos))
    new_h = int((h * cos) + (w * sin))

    # Adjust the rotation matrix to take into account translation
    M[0, 2] += (new_w / 2) - center[0]
    M[1, 2] += (new_h / 2) - center[1]

    # Perform the actual rotation and return the image
    rotated = cv2.warpAffine(image, M, (new_w, new_h))
    return rotated

def draw_faces(image):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale

    faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    # Draw bounding boxes around detected faces
    for (x, y, w, h) in faces:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Green bounding box



def color_correct_image(base64_string, rotation=0, debug=False):

    # Convert to correct colorspace
    image_data = base64.b64decode(base64_string)
    image_rbg = np.array(Image.open(BytesIO(image_data)))
    image_bgr = cv2.cvtColor(image_rbg, cv2.COLOR_RGB2BGR)

    # Temp - rotate image
    if(rotation != 0):
        image_bgr = rotate_image(image_bgr, rotation)

    # Add Brightness, Adjust White Balance, Increase Saturation
    image_brightened = increase_exposure(image_bgr, 2.0)
    image_white_balanced = adjust_white_balance(image_brightened, 3.5)
    image_saturated = adjust_white_balance(image_white_balanced, 30)
    
    # Display for Debug
    if(debug):
        cv2.imwrite(f'face.png', image_saturated)
        # cv2.imshow('Image', image_bgr)
        # cv2.imshow('Bright', image_brightened)
        # cv2.imshow('WB', image_white_balanced)
        # cv2.imshow('Saturated', image_saturated)

    return image_saturated

# cv2.waitKey(0)

