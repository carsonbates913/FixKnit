from app.config import Settings
from app.providers.advisor.base import ChatTurn, ProjectBrief, RepairAdvisor


def build_repair_advisor(settings: Settings) -> RepairAdvisor:
    if settings.advisor_provider == "claude":
        from app.providers.advisor.claude import ClaudeRepairAdvisor

        return ClaudeRepairAdvisor(
            settings.anthropic_api_key,
            settings.advisor_model,
            settings.anthropic_base_url or None,
        )

    from app.providers.advisor.fake import FakeRepairAdvisor

    return FakeRepairAdvisor()


__all__ = ["ChatTurn", "ProjectBrief", "RepairAdvisor", "build_repair_advisor"]
