from enum import StrEnum

class ShareTypes(StrEnum):
  Equity = "Equity"
  Pref = "Pref"
  
  @classmethod
  def choices(cls):
    return [(key.value, key.name) for key in cls]