from urllib.parse import parse_qs
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
        self._editsession = editsession
        self._status = "inprogress"
        self._error = ""

    def _handle_files(self) -> None:
        source = self.files.get("source")
        template = self.files.get("template")
        self.jsondata["source_filename"] = source.filename if source else None
        self.jsondata["source"] = source.read() if source else None
        self.jsondata["template_filename"] = template.filename if template else None
        self.jsondata["template"] = template.read() if template else None

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

    def _add_spec(self, session: "Session") -> None:
        self._handle_spec_name(session)
        if self._status == "error":
            session.close()
            return
        spec = Spec(**self.jsondata)
        session.add(spec)

    def _set_error(self, error: str) -> None:
        self._status = "error"
        self._error = error

    def status(self) -> BackEndResponse:
        output = {"edit": self._editsession}
        return BackEndResponse(type="upload", status=self._status, error=self._error, output=output)

    def send(self) -> None:
        session = SESSIONFACTORY()
        self._handle_files()
        self._handle_client(session)
        if self._status == "error":
            session.close()
            return
        try:
            if self._editsession:
                id = self.jsondata["id"]
                spec = session.query(Spec).filter(Spec.id == id).first()
                if not spec:
                    self._set_error(f"Spec ID not found: {id}")
                    session.close()
                    return
                for key, value in self.jsondata.items():
                    setattr(spec, key, value)
            else:
                self._add_spec(session)
                if self._status == "error":
                    session.close()
                    return
            session.commit()
        except Exception as e:
            session.rollback()
            session.close()
            exceptionstr = "\n".join(str(e).split("\n")[:2])
            self._set_error(f"{type(e).__name__}: {exceptionstr}")
        else:
            self._status = "ok"
            session.close()



class QueryHandler:
    TABLES: list[str] = ["clients", "specs"]

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
    
    def _client_query(self, query: str) -> BackEndResponse:
        querydict = parse_qs(query)
        client = querydict.get("client")
        if client is None or client[0].lower() != "all":
            return BackEndResponse(type="clientquery", status="error", error=f"Query not implemented: {query}")
        return self.all_clients()

    def _spec_query(self,  query: str) -> BackEndResponse:
        querydict = parse_qs(query)
        spec = querydict.get("spec")
        client = querydict.get("client")
        namesonly = querydict.get("namesonly")
        if not spec and not client:
            return BackEndResponse(type="specquery", status="error", error=f"Spec query is none: {query}")
        if spec and spec[0].lower() == "all":
            namesonly = False if namesonly is None else True
            return self.all_specs(namesonly)
        elif client and not spec:
            return self.specs_by_client(client[0])
        elif spec:
            return self.single_spec(spec[0])
        return BackEndResponse(type="specquery", status="error", error=f"Query not implemented: {query}")

    def all_clients(self) -> BackEndResponse:
        clients = self._all_clients()
        self._close_session()
        return BackEndResponse(type="clientquery", output={"clients": [client.name for client in clients]})

    def all_specs(self, namesonly: bool=False) -> BackEndResponse:
        if namesonly:
            session = self._get_session()
            names = [name[0] for name in session.query(Spec.name).all()]
            self._close_session()
            return BackEndResponse(type="specquery", output={"specNames": names})
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
    
    def run_query(self, table: str, query: str) -> BackEndResponse:
        if table not in self.TABLES:
            return BackEndResponse(type="query", status="error", error=f"Invalid table name: {table}")
        if table == "clients":
            result = self._client_query(query)
            self._close_session()
            return result
        elif table == "specs":
            result = self._spec_query(query)
            self._close_session()
            return result
        else:
            return BackEndResponse(type="query", status="error", error=f"Table not implemented in run_query: {table}")