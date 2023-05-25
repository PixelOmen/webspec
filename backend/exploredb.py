from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
spec = session.query(Spec).filter(Spec.name == "ABC3").first()
session.delete(spec)
session.commit()
session.close()