SELECT
    s.id,
    s.title,
    pe.date,
    cr.time,
    MIN(pr.price) as min_performance_price,
    pr.category
FROM price pr
INNER JOIN crawl cr on cr.id = pr.crawl_id
INNER JOIN performance pe on pe.id = pr.performance_id
INNER JOIN show s on pe.show_id = s.id
WHERE
    cr.time > 1492862400
    AND pe.date > 1493303358
    AND pr.available = 1
    AND s.id = 120
GROUP BY pe.date, cr.time
ORDER BY pe.date ASC, cr.time ASC;
