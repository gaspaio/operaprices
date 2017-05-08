DROP TABLE IF EXISTS show;
CREATE TABLE show (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE,
    type TEXT,
    title TEXT,
    author TEXT,
    location TEXT,
    url TEXT,
    buyUrl TEXT,
    saleStartDate INTEGER,
    saleOpen INTEGER,
    startDate INTEGER,
    endDate INTEGER,
    createdAt INTEGER,
    updatedAt INTEGER
);

CREATE INDEX show_ix_start_date ON show (startDate);
CREATE INDEX show_ix_end_date ON show (endDate);

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
    id INTEGER PRIMARY KEY,
    start_time INTEGER UNIQUE,
    end_time INTEGER DEFAULT 0,
    status TEXT,
    stats TEXT DEFAULT '{}',
    errors TEXT DEFAULT '[]'
);

