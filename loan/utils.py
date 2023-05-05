from enum import StrEnum

class InterestTypes(StrEnum):
  Emi = "EMI"
  Termloan = "Term Loan"

  @classmethod
  def choices(cls):
    return [(key.value, key.name) for key in cls]