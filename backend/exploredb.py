from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
utils.delete_spec("My New Client Spec", session)
utils.delete_spec("My Disney Spec", session)
utils.delete_client("New Client", session)
# client = session.query(Client).filter(Client.name == "New Client").first()
# if client is None:
#     session.close()
#     exit()
# for spec in client.specs:
#     print(spec.name)
session.close()