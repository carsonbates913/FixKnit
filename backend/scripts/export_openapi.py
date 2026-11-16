"""Write the API's OpenAPI spec to stdout (used to generate the frontend client)."""

import json

from app.main import app

print(json.dumps(app.openapi(), indent=2))
