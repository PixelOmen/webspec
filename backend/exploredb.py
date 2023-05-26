from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
utils.delete_client("Showtime3", session)
session.commit()
session.close()