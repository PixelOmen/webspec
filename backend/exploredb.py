from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
utils.temp_to_spec(session)
session.commit()
session.close()