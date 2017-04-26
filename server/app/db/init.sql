DROP TABLE IF EXISTS show;
CREATE TABLE show (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    author TEXT,
    location TEXT,
    start_date INTEGER,
    end_date INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

DROP TABLE IF EXISTS performance;
CREATE TABLE performance (
    id TEXT PRIMARY KEY,
    showId INTEGER,
    date INTEGER,
    CONSTRAINT show_fk_showId FOREIGN KEY (showId) REFERENCES show (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT performance_show_unique UNIQUE (showId,date) ON CONFLICT FAIL
);

// - add index id, showId, date


DROP TABLE IF EXISTS price;
CREATE TABLE price (
    created_at INTEGER,
    performanceId INTEGER,
    category TEXT,
    price INTEGER,
    available INTEGER,
    CONSTRAINT performance_fk_performanceId FOREIGN KEY (performanceId) REFERENCES performance (id) ON UPDATE CASCADE ON DELETE CASCADE
);

