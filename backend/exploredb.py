from zoneinfo import ZoneInfo

from db import utils
from db.schema import Spec, Client
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
session.commit()
session.close()