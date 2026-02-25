import pathlib
import sys
import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.infrastructure.db.base import Base
from deskops_backend.infrastructure.db.health import check_database_connection, check_required_tables


class DbHealthTest(unittest.TestCase):
    def test_connection_check_ok(self):
        engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
        session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
        ok, error = check_database_connection(session_factory=session_factory)
        self.assertTrue(ok)
        self.assertIsNone(error)

    def test_required_tables_false_when_not_created(self):
        engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
        session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
        statuses = check_required_tables(session_factory=session_factory)
        self.assertTrue(all(v is False for v in statuses.values()))

    def test_required_tables_true_when_created(self):
        engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
        Base.metadata.create_all(engine)
        session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
        statuses = check_required_tables(session_factory=session_factory)
        self.assertTrue(all(v is True for v in statuses.values()))


if __name__ == "__main__":
    unittest.main()
