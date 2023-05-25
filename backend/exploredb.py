from db import utils
from db.schema import Spec, Client, TempSpec
from db.config import SESSIONFACTORY, ENGINE


session = SESSIONFACTORY()
# utils.spec_to_temp(lambda spec: TempSpec(**spec.columns()), session)
utils.temp_to_spec(session)
session.commit()
session.close()