from enum import StrEnum

class InterestTypes(StrEnum):
  ThreeMonths = "3 Months"
  SixMonths = "6 Months"
  TwelveMonths = "12 Months"
  EighteenMonths = "18 Months"
  TwentyFourMonths = "24 Months"
  ThirtyMonths = "24 Months"
  ThirtyFourMonths = "24 Months"
  @classmethod
  def choices(cls):
    return [(key.value, key.name) for key in cls]