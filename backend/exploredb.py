from urllib.parse import parse_qs
from sqlalchemy import MetaData

from db import utils, ENGINE
from db.schema import Spec, Client, TempSpec

# Manual update of sequence to highest ID when migrating to new schema
# SELECT setval(pg_get_serial_sequence('your_table', 'id'), (SELECT MAX(id) FROM your_table));

# session = SESSIONFACTORY()
# allspecs = session.query(Spec).all()
# print(allspecs)
# session.close()

# utils.init_db()

if ENGINE is None:
    exit()
md = MetaData()
md.reflect(bind=ENGINE)
print(md.tables.keys())
