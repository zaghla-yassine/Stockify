import React, { useState, useEffect } from "react";

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/update-news`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ max_articles: 20 }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const screenStyle = {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    padding: "20px",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  };

  const headerStyle = {
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: "30px",
    fontSize: "2.5em",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderBottom: "3px solid #e03c31",
    display: "inline-block",
    paddingBottom: "10px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "40px",
  };

  const cardLinkStyle = {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    borderRadius: "8px",
    overflow: "hidden",
  };

  const cardStyle = {
    position: "relative",
    height: "400px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };

  const textOverlayStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background:
      "linear-gradient(to top, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.1) 100%)",
    padding: "20px",
    borderRadius: "0 0 8px 8px",
  };

  const titleStyle = {
    fontSize: "1.4em",
    fontWeight: "bold",
    marginBottom: "10px",
    lineHeight: "1.3",
  };

  const summaryStyle = {
    fontSize: "0.95em",
    marginBottom: "15px",
    lineHeight: "1.5",
    maxHeight: "6em",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const sourceTimeStyle = {
    fontSize: "0.8em",
    color: "#cccccc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    paddingTop: "10px",
    marginTop: "10px",
  };

  const loadingStyle = {
    textAlign: "center",
    fontSize: "1.5em",
    color: "#555",
    marginTop: "50px",
  };

  const errorStyle = {
    textAlign: "center",
    fontSize: "1.2em",
    color: "red",
    marginTop: "50px",
    padding: "20px",
    border: "1px solid red",
    borderRadius: "5px",
    backgroundColor: "#ffebee",
  };

  if (loading) {
    return <div style={loadingStyle}>Loading news...</div>;
  }

  if (error) {
    return <div style={errorStyle}>Error fetching news: {error}</div>;
  }

  return (
    <div style={screenStyle}>
      <center>
        <h1 style={headerStyle}>Breaking News & Stock Updates</h1>
      </center>
      <div style={gridStyle}>
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={cardLinkStyle}
            className="news-card-link"
          >
            <div
              style={{
                ...cardStyle,
                backgroundImage: `url(${
                  article.image_url ||
                  "https://via.placeholder.com/300x400?text=No+Image"
                })`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.parentNode.style.transform = "translateY(-5px)";
                e.currentTarget.parentNode.style.boxShadow =
                  "0 8px 20px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.parentNode.style.transform = "translateY(0)";
                e.currentTarget.parentNode.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={textOverlayStyle}>
                <h2 style={titleStyle}>{article.title}</h2>
                <p style={summaryStyle}>{article.summary}</p>
                <div style={sourceTimeStyle}>
                  <span>{article.source}</span>
                  <span>{article.published_time}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsScreen;
