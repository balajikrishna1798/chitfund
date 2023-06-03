from enum import StrEnum

class InterestTypes(StrEnum):
  Emi = "EMI"
  Termloan = "Term Loan"

  @classmethod
  def choices(cls):
    return [(key.value, key.name) for key in cls]
  
class Emi_Periods(StrEnum):
  ThreeMonths = "3 Months"
  SixMonths = "6 Months"
  TwelveMonths = "12 Months"
  TwentyFourMonths = "24 Months"
  ThirtyMonths = "24 Months"
  ThirtyFourMonths = "24 Months"

  @classmethod
  def choices(cls):
    return [(key.value, key.name) for key in cls]
  
