from urllib.parse import parse_qs

from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
spec  = session.query(Spec).filter(Spec.name == "TEST RE-SUBMIT CLIENT ").first()
if spec is None:
    session.close()
    exit()
print(spec.name)
session.delete(spec)
session.commit()
session.close()