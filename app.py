import json
import uuid
import logging
import mimetypes
import urllib.parse
from typing import TYPE_CHECKING, Callable, Any

from gevent import pywsgi
from flask import Flask, render_template, request
from geventwebsocket import WebSocketError
from geventwebsocket.handler import WebSocketHandler

from backend import BackEndResponse
from backend.db.utils import init_db
from backend.handlers import UploadHandler, QueryHandler

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

init_db()


def handle_request(environ: dict, start_response: Callable):
    if environ["PATH_INFO"] == "/connect":
        ws, address, sessionid = create_session(environ)
        websocket_app(ws, address, sessionid)
        return []
    else:
        return app(environ, start_response)
    
def create_session(environ: dict) -> tuple["WebSocket", str, str]:
    ws = environ.get("wsgi.websocket")
    if ws is None:
        raise WebSocketError("WebSocket not found in environment")
    address: str | None = environ.get("REMOTE_ADDR")
    if address is None:
        raise WebSocketError("Remote address not found in environment")
    sessionid = str(uuid.uuid4())
    CONNECTIONS[(address, sessionid)] = ws
    ws.send(json.dumps({"type": "sessionID", "sessionID": sessionid}))
    return (ws, address, sessionid)

def websocket_from_sessionid(sessionid: str) -> "WebSocket":
    address = request.remote_addr
    if address is None:
        raise WebSocketError("Remote address not found in environment")
    key = (address, sessionid)
    ws = CONNECTIONS.get(key)
    if ws is None:
        raise WebSocketError("Session ID not found in connections")
    return ws

def websocket_app(ws: "WebSocket", remote_addr: str, sessionid: str):
    while not ws.closed:
        msg = ws.receive()
        if msg:
            pass
    try:
        print(f"Closing websocket connection for ({remote_addr}, {sessionid})")
        del CONNECTIONS[(remote_addr, sessionid)]
    except KeyError:
        pass


@app.route('/')
def index():
    return render_template(f'_home.html', APPVERSION=APPVERSION)

@app.route('/nav/<string:page>')
def nav(page: str):
    return render_template(f'_{page}.html', APPVERSION=APPVERSION)

@app.route('/upload/<string:uploadtype>', methods=['POST'])
def upload(uploadtype: str):
    data = request.form['jsonData']
    files = request.files
    jsondata: dict[str, Any] = json.loads(data)
    ws = websocket_from_sessionid(jsondata['sessionID'])
    ws.send(json.dumps({"type": "debug", "msg": "Websocket connection through sessionID successfull (upload)"}))
    edit = True if uploadtype.lower() == "edit" else False
    handler = UploadHandler(jsondata, files, edit)
    handler.send()
    return handler.status().json()

@app.route('/query/<string:table>/<string:query>', methods=['GET'])
def query(table: str, query: str):
    if table.lower() not in QueryHandler.TABLES:
        return BackEndResponse(type="query", status="error", error=f"Invalid table name: {table}").json()
    query_str = urllib.parse.unquote(query)
    return QueryHandler().run_query(table=table, query=query_str).json()


if __name__ == '__main__':
    server = pywsgi.WSGIServer(('0.0.0.0', 4020), handle_request, handler_class=WebSocketHandler)
    server.serve_forever()