from google import genai
from app.core.config import settings

print("1. Config loaded")

client = genai.Client(api_key=settings.GEMINI_API_KEY)

print("2. Client created")

print("3. Sending request...")

interaction = client.interactions.create(
    model="gemini-3.5-flash",
    input="Reply with exactly: OK",
)

print("4. Response received")

print(interaction.output_text)