from zoneinfo import ZoneInfo

from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
spec = session.query(Spec).filter(Spec.name == "ABC").first()
if spec is None:
    session.close()
    exit()
session.commit()
session.close()