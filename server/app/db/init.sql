DROP TABLE IF EXISTS show;
CREATE TABLE show (
    id INTEGER PRIMARY KEY,
    type TEXT,
    slug TEXT UNIQUE,
    title TEXT,
    author TEXT,
    location TEXT,
    start_date INTEGER,
    end_date INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX show_ix_start_date ON show (start_date);
CREATE INDEX show_ix_end_date ON show (end_date);

DROP TABLE IF EXISTS performance;
CREATE TABLE performance (
    id TEXT PRIMARY KEY,
    show_id INTEGER,
    date INTEGER,
    CONSTRAINT show_fk_show_id FOREIGN KEY (show_id) REFERENCES show (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT performance_show_unique UNIQUE (show_id, date) ON CONFLICT FAIL
);

CREATE INDEX performance_ix_show_id ON performance (show_id);
CREATE INDEX performance_ix_date ON performance (date);

DROP TABLE IF EXISTS price;
CREATE TABLE price (
    crawl_id TEXT,
    performance_id INTEGER,
    category TEXT,
    price INTEGER,
    available INTEGER,
    CONSTRAINT performance_fk_crawl_id FOREIGN KEY (crawl_id) REFERENCES crawl (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT performance_fk_performance_id FOREIGN KEY (performance_id) REFERENCES performance (id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS crawl;
CREATE TABLE crawl (
    id TEXT PRIMARY KEY,
    time INTEGER UNIQUE,
    status TEXT,
    comments TEXT DEFAULT ''
);

