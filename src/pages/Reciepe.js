import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantityToBeUsed: 0, unit: "" });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = () => {
    axios
      .get("http://localhost:5000/api/reciepes")
      .then((response) => setRecipes(response.data))
      .catch((error) => console.error("Error fetching recipes:", error));
  };

  const handleUpdateClick = (recipe, ingredient) => {
    setSelectedRecipe(recipe);
    setSelectedIngredient({ ...ingredient });
    setShowUpdateModal(true);
  };

  const handleUpdateChange = (e, field) => {
    setSelectedIngredient({ ...selectedIngredient, [field]: e.target.value });
  };

  const saveUpdatedIngredient = () => {
    const updatedIngredients = selectedRecipe.ingredients.map((ing) =>
      ing.name === selectedIngredient.name ? selectedIngredient : ing
    );

    const updatedRecipe = { ...selectedRecipe, ingredients: updatedIngredients };

    axios
      .put(`http://localhost:5000/api/reciepes/update/${selectedRecipe._id}`, updatedRecipe)
      .then(() => {
        fetchRecipes();
        setShowUpdateModal(false);
        alert("Ingredient updated successfully!");
      })
      .catch((error) => console.error("Error updating ingredient:", error));
  };

  const handleAddIngredientClick = (recipe) => {
    setSelectedRecipe(recipe);
    setNewIngredient({ name: "", quantityToBeUsed: 0, unit: "" });
    setShowAddModal(true);
  };

  const handleNewIngredientChange = (e, field) => {
    setNewIngredient({ ...newIngredient, [field]: e.target.value });
  };
  
  const handleDeleteClick = (recipe, ingredient) => {
    setSelectedRecipe(recipe);
    setSelectedIngredient(ingredient);
    setShowDeleteModal(true);
  };

  const addNewIngredient = () => {
    const updatedRecipe = {
      ...selectedRecipe,
      ingredients: [...selectedRecipe.ingredients, newIngredient],
    };

    axios
      .put(`http://localhost:5000/api/reciepes/update/${selectedRecipe._id}`, updatedRecipe)
      .then(() => {
        fetchRecipes();
        setShowAddModal(false);
        alert("Ingredient added successfully!");
      })
      .catch((error) => console.error("Error adding ingredient:", error));
  };

  const deleteIngredient = () => {
    const updatedIngredients = selectedRecipe.ingredients.filter(
      (ing) => ing.name !== selectedIngredient.name
    );

    const updatedRecipe = { ...selectedRecipe, ingredients: updatedIngredients };

    axios
      .put(`http://localhost:5000/api/reciepes/update/${selectedRecipe._id}`, updatedRecipe)
      .then(() => {
        fetchRecipes();
        setShowDeleteModal(false);
        alert("Ingredient deleted successfully!");
      })
      .catch((error) => console.error("Error deleting ingredient:", error));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Recipe List</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by Food Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="row">
        {recipes
          .filter((recipe) => recipe.productName.toLowerCase().includes(search.toLowerCase()))
          .map((recipe) => (
            <div key={recipe._id} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-center">{recipe.productName}</h5>
                  <table className="table table-striped mt-3">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.ingredients.map((ingredient, index) => (
                        <tr key={index}>
                          <td>{ingredient.name}</td>
                          <td>{ingredient.quantityToBeUsed}</td>
                          <td>{ingredient.unit}</td>
                          <td className=" d-flex gap-1">
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleUpdateClick(recipe, ingredient)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteClick(recipe, ingredient)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    className="btn btn-primary w-100 mt-2"
                    onClick={() => handleAddIngredientClick(recipe)}
                  >
                    Add Ingredient
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Update Ingredient Modal */}
      {showUpdateModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Ingredient</h5>
                <button className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Ingredient Name:</label>
                <input type="text" className="form-control" value={selectedIngredient.name} disabled />
                <label className="form-label mt-2">Quantity:</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedIngredient.quantityToBeUsed}
                  onChange={(e) => handleUpdateChange(e, "quantityToBeUsed")}
                />
                <label className="form-label mt-2">Unit:</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedIngredient.unit}
                  onChange={(e) => handleUpdateChange(e, "unit")}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={saveUpdatedIngredient}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Ingredient</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Ingredient Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newIngredient.name}
                  onChange={(e) => handleNewIngredientChange(e, "name")}
                />
                <label className="form-label mt-2">Quantity:</label>
                <input
                  type="number"
                  className="form-control"
                  value={newIngredient.quantityToBeUsed}
                  onChange={(e) => handleNewIngredientChange(e, "quantityToBeUsed")}
                />
                <label className="form-label mt-2">Unit:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newIngredient.unit}
                  onChange={(e) => handleNewIngredientChange(e, "unit")}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Close
                </button>
                <button className="btn btn-success" onClick={addNewIngredient}>
                  Add Ingredient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete <strong>{selectedIngredient?.name}</strong> from{" "}
                <strong>{selectedRecipe?.productName}</strong>?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={deleteIngredient}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
