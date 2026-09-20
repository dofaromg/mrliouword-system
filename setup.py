"""Mrliouword Agent SDK

所有套件中繼資料集中在 pyproject.toml 的 [project]。
此檔僅為相容舊工具鏈保留的 shim，不再重複宣告任何欄位——先前的重複
宣告中，install_requires 已被 pyproject 覆蓋而成為死碼，keywords 則會
在未來版本的 setuptools 造成建置錯誤。
"""

from setuptools import setup

setup()
