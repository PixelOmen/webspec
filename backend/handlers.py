from typing import Any, TYPE_CHECKING

from . import BackEndResponse
from .db.schema import Spec, Client
from .db.config import SESSIONFACTORY

if TYPE_CHECKING:
    from werkzeug.datastructures import ImmutableMultiDict, FileStorage
    from .db import Session

class UploadHandler:
    def __init__(self, jsondata: dict[str, Any], files: "ImmutableMultiDict[str,'FileStorage']") -> None:
        self.jsondata = jsondata
        self.files = files
        self._status = "inprogress"
        self._error = ""

    def _handle_source(self) -> None:
        source = self.files.get("source")
        self.jsondata["source"] = source.read() if source else None

    def _handle_spec_name(self, session: "Session") -> None:
        spec_name = self.jsondata.get("name")
        if not spec_name:
            self._set_error("Spec name not specified")
            return
        spec_exists = session.query(Spec).filter(Spec.name == spec_name).first()
        if spec_exists:
            self._set_error("Spec name already exists")
            return
    
    def _handle_client(self, session: "Session") -> None:
        spec_client = self.jsondata.get("client_name")
        if not spec_client:
            self._set_error("Client name not specified")
            return
        client_exists = session.query(Client).filter(Client.name == spec_client).first()
        if not client_exists:
            newclient = Client(name=spec_client)
            session.add(newclient)
            session.commit()

    def _set_error(self, error: str) -> None:
        self._status = "error"
        self._error = error

    def status(self) -> BackEndResponse:
        return BackEndResponse(type="upload", status=self._status, error=self._error)

    def send(self) -> None:
        session = SESSIONFACTORY()
        self._handle_source()
        self._handle_spec_name(session)
        if self._status == "error":
            session.close()
            return
        self._handle_client(session)
        if self._status == "error":
            session.close()
            return
        try:
            spec = Spec(**self.jsondata)
            session.add(spec)
            session.commit()
        except Exception as e:
            session.rollback()
            session.close()
            self._set_error(f"{type(e).__name__}: {e}")
        else:
            self._status = "ok"
            session.close()



class QueryHandler:
    def __init__(self) -> None:
        self.session = None

    def _get_session(self) -> "Session":
        if self.session is None:
            self.session = SESSIONFACTORY()
        return self.session
    
    def _close_session(self) -> None:
        if self.session is not None:
            self.session.close()
            self.session = None
    
    def _all_clients(self) -> list[Client]:
        session = self._get_session()
        clients = session.query(Client).all()
        return clients

    def all_clients(self) -> BackEndResponse:
        clients = self._all_clients()
        self._close_session()
        return BackEndResponse(type="clientquery", output={"clients": [client.name for client in clients]})