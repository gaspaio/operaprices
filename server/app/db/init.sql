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

CREATE INDEX show_ix_slug ON show (slug);

DROP TABLE IF EXISTS performance;
CREATE TABLE performance (
    id INTEGER PRIMARY KEY,
    showId INTEGER,
    date INTEGER,
    createdAt INTEGER,
    CONSTRAINT show_fk_show_id FOREIGN KEY (showId) REFERENCES show (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT performance_show_unique UNIQUE (showId, date) ON CONFLICT FAIL
);

CREATE INDEX performance_ix_show_id ON performance (showId);
CREATE INDEX performance_ix_date ON performance (date);

DROP TABLE IF EXISTS price;
CREATE TABLE price (
    crawlId TEXT,
    performanceId INTEGER,
    category TEXT,
    price INTEGER,
    available INTEGER,
    CONSTRAINT performance_fk_crawl_id FOREIGN KEY (crawlId) REFERENCES crawl (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT performance_fk_performance_id FOREIGN KEY (performanceId) REFERENCES performance (id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS crawl;
CREATE TABLE crawl (
    id INTEGER PRIMARY KEY,
    startTime INTEGER UNIQUE,
    endTime INTEGER DEFAULT 0,
    status TEXT,
    stats TEXT DEFAULT '{}',
    errors TEXT DEFAULT '[]'
);

