from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
clients = session.query(Client).all()
print(clients[0].specs)
session.close()