from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

@app.route('/process', methods=['POST'])
def process_media():
    try:
        data = request.json
        if not data or 'image' not in data or 'sound' not in data or 'mode' not in data:
            return jsonify({'error': 'Missing required data'}), 400
        
        # Here you would process the image and sound based on the mode
        # For now, we'll just echo back a test sound
        # Replace this with your actual processing logic
        
        # Example response with a base64 audio file
        # In reality, you would generate/process this audio based on the input
        test_audio = data['sound']  # Just echoing back the same audio for testing
        
        return jsonify({
            'status': 'success',
            'sound': test_audio
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)