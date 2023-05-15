from zoneinfo import ZoneInfo

from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
spec = session.query(Spec).filter_by(name="Some NBC Spec").first()
session.delete(spec)
session.commit()
session.close()