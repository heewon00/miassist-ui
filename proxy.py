from flask import Flask, request, Response, jsonify
import requests
from flask_cors import CORS
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv(override=True)

# 환경변수에서 값 가져오기
API_BASE_URL = os.getenv('API_BASE_URL')  # FastAPI 서버 기본 URL
ALLOWED_ORIGIN = os.getenv('ALLOWED_ORIGIN')

app = Flask(__name__)
CORS(app, 
     resources={
         r"/*": {
             "origins": ALLOWED_ORIGIN,  # 모든 origin 허용
             "methods": ["GET", "POST", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "send_wildcard": True
         }
     }
)

@app.route('/create_session', methods=['POST'])
def create_session():
    try:
        # 요청 로깅
        print('Received create session request:', request.json)
        
        # FastAPI 서버로 요청 전달
        response = requests.post(
            f"{API_BASE_URL}/create_session",
            json=request.json,
            headers={'Content-Type': 'application/json'}
        )
        
        # 응답 로깅
        print('Server response status:', response.status_code)
        print('Server response:', response.json())
        
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f'Error in create_session: {str(e)}')
        return jsonify({'success': False}), 500

@app.route('/update_session', methods=['POST'])
def update_session():
    try:
        # 요청 로깅
        print('Received update session request:', request.json)
        
        # FastAPI 서버로 요청 전달
        response = requests.post(
            f"{API_BASE_URL}/update_session",
            json=request.json,
            headers={'Content-Type': 'application/json'}
        )
        
        # 응답 로깅
        print('Server response status:', response.status_code)
        print('Server response:', response.json())
        
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f'Error in update_session: {str(e)}')
        return jsonify({'answer': str(e)}), 500
    
@app.route('/delete_session', methods=['POST'])
def delete_session():
    try:
        # 요청 로깅
        print('Received delete session request:', request.json)
        
        # FastAPI 서버로 요청 전달
        response = requests.post(
            f"{API_BASE_URL}/delete_session",
            json=request.json,
            headers={'Content-Type': 'application/json'}
        )
        
        # 응답 로깅
        print('Server response status:', response.status_code)
        print('Server response:', response.json())
        
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f'Error in delete_session: {str(e)}')
        return jsonify({'success': False}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)