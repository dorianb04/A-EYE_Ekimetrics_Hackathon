import requests, time, base64
from PIL import Image
from io import BytesIO
import os

def encode_image(image):
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def get_base64_images(image_path):
    base64_imgs = []
    for filename in os.listdir(image_path):
        if filename.endswith(".jpg"):
            img = Image.open(os.path.join(image_path, filename))
            base64_imgs.append(encode_image(img))
    return base64_imgs

# Client makes a POST request with an image and a folder
url = 'http://127.0.0.1:5000/instruct'
image_path = 'examples/img'
sound_path = 'examples/audio/test.wav'
mode = 'instruct'

base64_imgs = get_base64_images(image_path)

with open(sound_path, "rb") as file:
    wav_data = file.read()
    sound_b64 = base64.b64encode(wav_data).decode('utf-8')  # Correct encoding to string

data = {    
    'images': base64_imgs,
    'sound': sound_b64,
    'mode': mode,
}

headers = {'Content-Type': 'application/json'}  # Specify JSON content type

start = time.time()
response = requests.post(url, json=data, headers=headers)  # Use `json` argument

print(time.time() - start, "\nGeneration:\n", response.json()["text"])  # This will print the result from the server

sound_data = base64.b64decode(response.json()['audio_b64'])
text_response = response.json()['text']

with open("examples/output/final_sound.wav", "wb") as sound_file:
    sound_file.write(sound_data)

with open("examples/output/final_text.txt", "w") as text_file:
    text_file.write(text_response)
