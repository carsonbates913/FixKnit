from app.config import Settings
from app.providers.advisor.base import RepairAdvisor


def build_repair_advisor(settings: Settings) -> RepairAdvisor:
    from app.providers.advisor.fake import FakeRepairAdvisor

    return FakeRepairAdvisor()


__all__ = ["RepairAdvisor", "build_repair_advisor"]
