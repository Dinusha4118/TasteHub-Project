import React from "react";

const RecipeCard = ({ recipe }) => {
  if (!recipe) {
    return <div>No recipe data available.</div>;
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        margin: "16px",
        width: "300px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <img
        src={recipe.imageUrl || "https://via.placeholder.com/300x200.png?text=No+Image"}
        alt={recipe.title || "No title"}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      />
      <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
        {recipe.title || "Untitled Recipe"}
      </h2>
      <p style={{ color: "#555" }}>
        {recipe.description || "No description provided."}
      </p>
    </div>
  );
};

export default RecipeCard;
