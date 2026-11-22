# alchemy migration environment
import asyncio
from logging.config import fileConfig
import os
import sys
import urllib.parse
from pathlib import Path
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from dotenv import load_dotenv

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Load .env file
load_dotenv(BASE_DIR / ".env")

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.models import Base

target_metadata = Base.metadata

# Use environment variable for DB URL (unpooled for migrations)
DATABASE_URL = os.getenv("DATABASE_URL_UNPOOLED") or os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL_UNPOOLED or DATABASE_URL environment variable not set for migrations")

connect_args = {}
is_async = False

if DATABASE_URL.startswith("sqlite+aiosqlite://"):
    DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite://", "sqlite://", 1)
elif DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql+asyncpg://"):
    is_async = True
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

    parsed = urllib.parse.urlsplit(DATABASE_URL)
    q_params = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    filtered_q = [(k, v) for k, v in q_params if k not in ("sslmode", "channel_binding")]
    new_query = urllib.parse.urlencode(filtered_q)
    DATABASE_URL = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, new_query, parsed.fragment))
    connect_args = {"ssl": "require"}

config.set_main_option("sqlalchemy.url", DATABASE_URL)


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    connectable = create_async_engine(DATABASE_URL, poolclass=pool.NullPool, connect_args=connect_args)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online():
    if is_async:
        asyncio.run(run_async_migrations())
    else:
        connectable = engine_from_config(
            config.get_section(config.config_ini_section),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )
        with connectable.connect() as connection:
            do_run_migrations(connection)


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

