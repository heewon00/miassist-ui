from flask import Flask, request, Response
import requests
from flask_cors import CORS
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경변수에서 값 가져오기
BACKEND_API_URL = os.getenv('BACKEND_API_URL')
ALLOWED_ORIGIN = os.getenv('ALLOWED_ORIGIN')

app = Flask(__name__)
CORS(app, resources={
    r"/proxy": {
        "origins": [ALLOWED_ORIGIN],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/proxy', methods=['POST'])
def proxy():
    try:
        # 요청 로깅
        print('Received request:', request.json)
        
        # 원본 서버로 요청 전달
        response = requests.post(
            BACKEND_API_URL,
            json=request.json,
            headers={'Content-Type': 'application/json'}
        )
        
        # 응답 로깅
        print('Server response status:', response.status_code)
        print('Server response text:', response.text)
        
        # JSON 응답 처리
        try:
            data = response.json()
            result = data.get('answer', '')
        except:
            result = response.text
            
        print('Sending back:', result)
        return Response(result, status=200)
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(port=3001)
