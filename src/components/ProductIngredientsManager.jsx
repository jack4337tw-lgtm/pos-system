// src/components/ProductIngredientsManager.jsx
import axios from "axios";
const API_BASE = "http://localhost:3000/api/product-ingredients";
import { useEffect, useState } from "react";
import {
  getProductIngredients,
  addProductIngredient,
  updateProductIngredient,
  deleteProductIngredient,
} from "../api/productIngredients";

function ProductIngredientsManager({ productId }) {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: 1 });

  useEffect(() => {
    if (!productId) return;
    async function fetchIngredients() {
      const data = await getProductIngredients(productId);
      setIngredients(data);
    }
    fetchIngredients();
  }, [productId]);

  const handleAdd = async () => {
    if (!newIngredient.name) return;
    const saved = await addProductIngredient({
      product_id: productId,
      ingredient_name: newIngredient.name,
      quantity: newIngredient.quantity,
    });
    setIngredients([...ingredients, saved]);
    setNewIngredient({ name: "", quantity: 1 });
  };

  const handleUpdate = async (id, ingredient) => {
    const updated = await updateProductIngredient(id, ingredient);
    setIngredients(ingredients.map((i) => (i.id === id ? updated : i)));
  };

  const handleDelete = async (id) => {
    await deleteProductIngredient(id);
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  return (
    <div style={{ marginTop: "1em" }}>
      <h4>主食材設定</h4>
      <ul>
        {ingredients.map((ing) => (
          <li key={ing.id}>
            {ing.ingredient_name} x {ing.quantity}
            <button
              onClick={() =>
                handleUpdate(ing.id, {
                  ingredient_name: ing.ingredient_name,
                  quantity: ing.quantity + 1,
                })
              }
            >
              +1
            </button>
            <button onClick={() => handleDelete(ing.id)}>刪除</button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="食材名稱"
        value={newIngredient.name}
        onChange={(e) =>
          setNewIngredient({ ...newIngredient, name: e.target.value })
        }
      />
      <input
        type="number"
        value={newIngredient.quantity}
        onChange={(e) =>
          setNewIngredient({
            ...newIngredient,
            quantity: Number(e.target.value),
          })
        }
      />
      <button onClick={handleAdd}>新增食材</button>
    </div>
  );
}

export default ProductIngredientsManager;
