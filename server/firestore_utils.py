import cv2
import base64

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def createEmergencyEntry(image, diagnosis, symptoms, latitude, longitude):

    # Encode Image
    _, buffer = cv2.imencode('.jpg', image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    # Setup Credentials
    cred = credentials.Certificate("./credentials.json")
    firebase_admin.initialize_app(cred)

    db = firestore.client()
    doc_ref = db.collection(u'emergencies').document(u'most-recent')

    # Setup new data
    data = {
        u'image': image_base64,
        u'diagnosis': diagnosis,

        u'latitude': latitude,
        u'longitude': longitude,

        u'symptoms': symptoms,
        u'timeOccured': datetime.now(),
    }

    doc_ref.set(data)

    print("Document succesfully written to.")

