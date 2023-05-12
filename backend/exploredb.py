from zoneinfo import ZoneInfo

from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
spec = session.query(Spec).filter_by(name="Test Spec").first()
if spec is None:
    exit()
localtz = ZoneInfo("America/Los_Angeles")
print(type(spec.updated.astimezone(localtz)))
session.close()