from zoneinfo import ZoneInfo

from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
Spec.__table__.drop(ENGINE, checkfirst=True)
Spec.__table__.create(ENGINE, checkfirst=True)
tempspecs = session.query(TempSpec).all()
for spec in tempspecs:
    session.add(Spec(**spec.columns()))
session.commit()
session.close()