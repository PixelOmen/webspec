from typing import Any, TYPE_CHECKING

from . import BackEndResponse
from .db.schema import Spec, Client
from .db.config import SESSIONFACTORY

if TYPE_CHECKING:
    from werkzeug.datastructures import ImmutableMultiDict, FileStorage
    from .db import Session

class UploadHandler:
    def __init__(self, jsondata: dict[str, Any], files: "ImmutableMultiDict[str,'FileStorage']", editsession: bool=False) -> None:
        self.jsondata = jsondata
        self.files = files
        self.editsession = editsession
        self._status = "inprogress"
        self._error = ""

    def _handle_source(self) -> None:
        source = self.files.get("source")
        self.jsondata["source_filename"] = source.filename if source else None
        self.jsondata["source"] = source.read() if source else None

    def _handle_spec_name(self, session: "Session") -> None:
        spec_name = self.jsondata.get("name")
        if not spec_name:
            self._set_error("Spec name not specified.")
            return
        spec_exists = session.query(Spec).filter(Spec.name == spec_name).first()
        if spec_exists:
            self._set_error("Spec name already exists.")
            return
    
    def _handle_client(self, session: "Session") -> None:
        spec_client = self.jsondata.get("client_name")
        if not spec_client:
            self._set_error("Client name not specified.")
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
        self._handle_client(session)
        if self._status == "error":
            session.close()
            return
        try:
            if self.editsession:
                spec = session.query(Spec).filter(Spec.name == self.jsondata["name"]).first()
                if not spec:
                    self._set_error("Spec name not found.")
                    session.close()
                    return
                for key, value in self.jsondata.items():
                    setattr(spec, key, value)
            else:
                self._handle_spec_name(session)
                if self._status == "error":
                    session.close()
                    return
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
    TABLES: list[str] = ["clients", "specs"]

    def __init__(self, table: str, query: str) -> None:
        self.table = table
        self.query = query
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
        clients.sort(key=lambda client: client.name) # type: ignore
        return clients
    
    def _all_specs(self) -> list[Spec]:
        session = self._get_session()
        specs = session.query(Spec).all()
        specs.sort(key=lambda spec: spec.name) # type: ignore
        return specs

    def _single_spec(self, spec: str) -> Spec | None:
        session = self._get_session()
        spec = session.query(Spec).filter(Spec.name == spec).first()
        return spec
    
    def _specs_by_client(self, client: str) -> list[Spec]:
        session = self._get_session()
        specs = session.query(Spec).filter(Spec.client_name == client).all()
        specs.sort(key=lambda spec: spec.name) # type: ignore
        return specs
    
    def _client_query(self) -> BackEndResponse:
        if self.query.lower() != "all":
            return BackEndResponse(type="clientquery", status="error", error=f"Query not implemented: {self.query}")
        return self.all_clients()

    def _spec_query(self) -> BackEndResponse:
        if self.query.lower() == "all":
            return self.all_specs()
        elif self.query.lower().startswith("client="):
            return self.specs_by_client(self.query.split("=")[1])
        elif self.query.lower().startswith("spec="):
            return self.single_spec(self.query.split("=")[1])
        return BackEndResponse(type="query", status="error", error=f"Query not implemented: {self.query}")

    def all_clients(self) -> BackEndResponse:
        clients = self._all_clients()
        self._close_session()
        return BackEndResponse(type="clientquery", output={"clients": [client.name for client in clients]})

    def all_specs(self) -> BackEndResponse:
        specs = self._all_specs()
        self._close_session()
        return BackEndResponse(type="specquery", output={"specs": [spec.jsondict() for spec in specs]})
    
    def single_spec(self, name: str) -> BackEndResponse:
        spec = self._single_spec(name)
        payload = [spec.jsondict()] if spec else []
        self._close_session()
        return BackEndResponse(type="specquery", output={"specs": payload})
    
    def specs_by_client(self, client: str) -> BackEndResponse:
        specs = self._specs_by_client(client)
        self._close_session()
        return BackEndResponse(type="specquery", output={"specs": [spec.jsondict() for spec in specs]})
    
    def run_query(self) -> BackEndResponse:
        if self.table not in self.TABLES:
            return BackEndResponse(type="query", status="error", error=f"Invalid table name: {self.table}")
        if self.table == "clients":
            result = self._client_query()
            self._close_session()
            return result
        elif self.table == "specs":
            result = self._spec_query()
            self._close_session()
            return result
        else:
            return BackEndResponse(type="query", status="error", error=f"Table not implemented in run_query: {self.table}")