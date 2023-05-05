from enum import StrEnum

class InterestTypes(StrEnum):
  Monthly = "Monthly"
  Quarterly = "Quarterly"
  Halfyearly = "Halfyearly"
  Yearly = "Yearly"
  @classmethod
  def choices(cls):
    return [(key.value, key.name) for key in cls]