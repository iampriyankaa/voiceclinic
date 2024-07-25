import base64
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS # type: ignore
from flask_bcrypt import Bcrypt # type: ignore
from werkzeug.utils import secure_filename
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

UPLOAD_FOLDER = 'C:/Users/nepal/voiceclinic/flask-server/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

USERS_FILE = os.path.join(app.root_path, 'users.txt')
ADMINS_FILE = os.path.join(app.root_path, 'admins.txt')

def initialize_files():
    for file in [USERS_FILE, ADMINS_FILE]:
        if not os.path.exists(file):
            with open(file, 'w') as f:
                f.write('')

initialize_files()

def read_users(file):
    users = {}
    with open(file, 'r') as f:
        lines = f.readlines()
        for line in lines:
            parts = line.strip().split(',')
            if len(parts) >= 3:
                username = parts[0]
                password_hash = ','.join(parts[1:-1])
                role = parts[-1]
                if role == 'admin':
                    users[username] = {'password_hash': password_hash, 'role': 'admin'}
                else:
                    users[username] = {'password_hash': password_hash, 'role': 'user'}
            else:
                print(f"Ignoring invalid line: {line}")
    return users

def write_users(users, file):
    with open(file, 'w') as f:
        for username, data in users.items():
            f.write(f'{username},{data["password_hash"]},{data["role"]}\n')

users = read_users(USERS_FILE)
admins = read_users(ADMINS_FILE)

@app.route('/')
def index():
    return "Flask server is running", 200

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Missing fields"}), 400

    if username in users or username in admins:
        return jsonify({"message": "User already exists"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    users[username] = {'password_hash': password_hash, 'role': 'user'}
    write_users(users, USERS_FILE)

    return jsonify({"message": "Registration successful"}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username not in users:
        return jsonify({"message": "Invalid username"}), 401

    user_data = users[username]
    if bcrypt.check_password_hash(user_data['password_hash'], password):
        session['user'] = username
        session['role'] = user_data['role']
        return jsonify({"message": "Login successful", "user": username, "role": user_data['role']}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    session.pop('role', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/current_user', methods=['GET'])
def current_user():
    if 'user' in session:
        if session['user'] in users:
            user_info = users.get(session['user'])
        elif session['user'] in admins:
            user_info = admins.get(session['user'])
        return jsonify({'user': session['user'], 'role': user_info['role']}), 200
    else:
        return jsonify({'user': None}), 200

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username not in admins:
        return jsonify({"message": "Invalid admin username"}), 401

    admin_data = admins[username]
    if bcrypt.check_password_hash(admin_data['password_hash'], password):
        session['user'] = username
        session['role'] = 'admin'
        return jsonify({"message": "Admin login successful", "user": username, "role": 'admin'}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/admin/register', methods=['POST'])
def admin_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    pin = data.get('pin')
    ADMIN_PIN = '4281'

    if not username or not password or not pin:
        return jsonify({"message": "Missing fields"}), 400

    if pin != ADMIN_PIN:
        return jsonify({"message": "Invalid admin pin"}), 400

    if username in admins or username in users:
        return jsonify({"message": "User already exists"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    admins[username] = {'password_hash': password_hash, 'role': 'admin'}
    write_users(admins, ADMINS_FILE)

    return jsonify({"message": "Registration successful"}), 200

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        socketio.emit('voice_message', {'message': 'New recording available'})
        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200

    return jsonify({'error': 'Unknown error occurred'}), 500

@app.route('/admin/recordings', methods=['GET'])
def list_recordings():
    try:
        recordings = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.wav') and os.path.isfile(os.path.join(UPLOAD_FOLDER, f))]
        return jsonify({'recordings': recordings}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/uploads/<path:filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on("offer")
def handle_offer(offer):
    emit("offer", offer, broadcast=True)

@socketio.on("answer")
def handle_answer(answer):
    emit("answer", answer, broadcast=True)

@socketio.on("ice-candidate")
def handle_ice_candidate(candidate):
    emit("ice-candidate", candidate, broadcast=True)

@socketio.on('upload')
def handle_file_upload(data):
    try:
        file = data.get('file')
        if not file:
            raise Exception("No file received.")

        filename = secure_filename(file.filename)

        # Read the binary audio data
        audio_data = file.read()

        # Broadcast the base64 encoded audio data
        encoded_audio = base64.b64encode(audio_data).decode('utf-8')
        socketio.emit('voice_message', encoded_audio, broadcast=True)

        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    context = ('C:/Users/nepal/cert.pem', 'C:/Users/nepal//key.pem')
    socketio.run(app, debug=True, host='127.0.0.1', port=5000,ssl_context=context)
    # , ssl_context=context