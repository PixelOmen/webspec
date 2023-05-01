import json
import uuid
import logging
import mimetypes
from typing import TYPE_CHECKING

from gevent import pywsgi
from flask import Flask, render_template
from geventwebsocket import WebSocketError
from geventwebsocket.handler import WebSocketHandler

if TYPE_CHECKING:
    from geventwebsocket.websocket import WebSocket

# Attempts to force clients to pull new static files
# whenever server restarts
APPVERSION = uuid.uuid4()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mimetypes.add_type("application/javascript", ".js", True)
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/')
def index():
    return render_template('index.html', APPVERSION=APPVERSION)

def websocket_app(ws: "WebSocket"):
    while not ws.closed:
        msg = ws.receive()
        if msg:
            msg = json.loads(msg)

def handle_request(environ: dict, start_response):
    path = environ["PATH_INFO"]
    if path == "/connect":
        ws = environ.get("wsgi.websocket")
        if ws is None:
            raise WebSocketError("WebSocket not found in environment")
        websocket_app(ws)
        return []
    else:
        return app(environ, start_response)

if __name__ == '__main__':
    server = pywsgi.WSGIServer(('0.0.0.0', 80), handle_request, handler_class=WebSocketHandler)
    server.serve_forever()