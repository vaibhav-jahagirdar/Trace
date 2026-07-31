from enum import Enum


class TreeNodeType(str, Enum):
    FILE = "file"
    DIRECTORY = "directory"
    SUBMODULE = "submodule"