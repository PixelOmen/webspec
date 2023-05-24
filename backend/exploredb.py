from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
spec = session.query(Spec).filter(Spec.name == 'Really Super Long Spec Name Again').first()
if not spec:
    session.close()
    exit()
session.delete(spec)
session.commit()
session.close()