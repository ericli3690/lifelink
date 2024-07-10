from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def handle_get():
    response_data = {"message": "This is a GET request"}
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)