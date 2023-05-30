from urllib.parse import parse_qs

from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE

# Manual update of sequence to highest ID when migrating to new schema
# SELECT setval(pg_get_serial_sequence('your_table', 'id'), (SELECT MAX(id) FROM your_table));

session = SESSIONFACTORY()
spec  = session.query(Spec).filter(Spec.name == "TEST RE-SUBMIT CLIENT ").first()
if spec is None:
    session.close()
    exit()
print(spec.name)
session.delete(spec)
session.commit()
session.close()