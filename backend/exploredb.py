from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
todelete = session.query(Client).filter(Client.name == "Yet another").first()
if todelete is None:
    session.close()
    exit()
for spec in todelete.specs:
    session.delete(spec)
session.delete(todelete)
session.commit()
session.close()