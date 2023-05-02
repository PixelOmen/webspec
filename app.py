import json
import uuid
import logging
import mimetypes
from typing import TYPE_CHECKING, Callable

from gevent import pywsgi
from flask import Flask, render_template, request
from geventwebsocket import WebSocketError
from geventwebsocket.handler import WebSocketHandler

if TYPE_CHECKING:
    from geventwebsocket.websocket import WebSocket

# Attempts to force clients to pull new static files
# whenever server restarts
APPVERSION = uuid.uuid4()
CONNECTIONS: dict[tuple[str, str], "WebSocket"] = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mimetypes.add_type("application/javascript", ".js", True)
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def handle_request(environ: dict, start_response: Callable):
    if environ["PATH_INFO"] == "/connect":
        ws = create_session(environ)
        websocket_app(ws)
        return []
    else:
        return app(environ, start_response)
    
def create_session(environ: dict) -> "WebSocket":
    ws = environ.get("wsgi.websocket")
    if ws is None:
        raise WebSocketError("WebSocket not found in environment")
    sessionid = str(uuid.uuid4())
    CONNECTIONS[(ws.environ.get("REMOTE_ADDR"), sessionid)] = ws
    ws.send(json.dumps({"type": "sessionID", "sessionID": sessionid}))
    return ws

def websocket_from_sessionid(sessionid: str) -> "WebSocket":
    address = request.remote_addr
    if address is None:
        raise WebSocketError("Remote address not found in environment")
    key = (address, sessionid)
    ws = CONNECTIONS.get(key)
    if ws is None:
        raise WebSocketError("Session ID not found in connections")
    return ws

def websocket_app(ws: "WebSocket"):
    while not ws.closed:
        msg = ws.receive()
        if msg:
            form = request.environ['werkzeug.request_form']
            print(form['test'])



@app.route('/')
def index():
    return render_template('index.html', APPVERSION=APPVERSION)

@app.route('/upload', methods=['POST'])
def upload():
    data = request.form['jsonData']
    jsondata = json.loads(data)
    files = request.files
    ws = websocket_from_sessionid(jsondata['sessionID'])
    print(data)
    print(files)
    ws.send(json.dumps({"type": "upload", "msg": "Websocket connection through route successful"}))
    return json.dumps({'success':True})


if __name__ == '__main__':
    server = pywsgi.WSGIServer(('0.0.0.0', 80), handle_request, handler_class=WebSocketHandler)
    server.serve_forever()