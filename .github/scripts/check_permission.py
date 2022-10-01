import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(asctime)s [%(name)s]: %(message)s",
)
logger = logging.getLogger(__name__)


@dataclass
class PermissionInfo:
    directories: Dict[str, List]


@dataclass
class PRInfo:
    author: str
    files: List[str]


def load_permission_info(path: str) -> PermissionInfo:
    with open(path) as f:
        pm_info = PermissionInfo(**json.load(f))
    return pm_info


def receive_pr_info() -> PRInfo:
    """
    下記のようなデータをinputで受け取る
    {
      "author": {
        "login": "IkokObi"
      },
      "files": [
        {
          "path": "file1.txt",
          "additions": 1,
          "deletions": 1
        },
        {
          "path": "file2.txt",
          "additions": 1,
          "deletions": 1
        }
      ]
    }
    """
    pr_input = json.loads(input())
    pr_info = PRInfo(
        author=pr_input["author"]["login"], files=[i["path"] for i in pr_input["files"]]
    )
    return pr_info


def is_permitted(pr_info: PRInfo, permission_info: PermissionInfo) -> bool:
    changed_top_dirs = []
    for f in pr_info.files:
        parents = list(Path(f).parents)
        if len(parents) == 1:
            top_dir = parents[0]
        else:
            top_dir = parents[-2]
        changed_top_dirs.append(str(top_dir))

    ok = True
    for d in set(changed_top_dirs):
        if pr_info.author not in permission_info.directories.get(d, []):
            logger.warning(
                "%s does not have permission to change `%s`.", pr_info.author, d
            )
            ok = False
    return ok


def main(permission_file_path: str):
    pm_info = load_permission_info(path=permission_file_path)
    pr_info = receive_pr_info()
    if not is_permitted(pr_info=pr_info, permission_info=pm_info):
        logger.warning("Permission denied. Can't automatically merge.")
        exit(1)


if __name__ == "__main__":
    main(permission_file_path=".github/scripts/permission.json")
