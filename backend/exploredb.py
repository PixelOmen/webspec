from urllib.parse import parse_qs

from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
names = session.query(Spec.name).all()
names = [name[0] for name in names]
print(names)
session.close()