from openai import OpenAI
import base64
from io import BytesIO
from PIL import Image

API_KEY = "51799a71-19b4-4c6a-9efe-87a2c971ad7f"
MODEL = "pixtral-12b-2409"

client = OpenAI(
    base_url="https://api.scaleway.ai/b722dfe7-d92b-4f1b-8c60-cf56b6f7ba5f/v1",
    api_key=API_KEY,
)