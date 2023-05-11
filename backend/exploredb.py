from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
clients = session.query(Client).all()
specs = session.query(Spec).all()
for s in specs:
    session.delete(s)
for c in clients:
    session.delete(c)
session.commit()
session.close()