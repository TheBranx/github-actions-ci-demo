const express = require('express');
const app = express();

app.use(express.json());

// Base de datos en memoria para la entidad Categorías
let categories = [
  { id: 1, name: 'Electrónica', description: 'Dispositivos y gadgets' },
  { id: 2, name: 'Ropa', description: 'Prendas de vestir y accesorios' }
];

// Función para reiniciar el estado en pruebas
app.resetCategories = () => {
  categories = [
    { id: 1, name: 'Electrónica', description: 'Dispositivos y gadgets' },
    { id: 2, name: 'Ropa', description: 'Prendas de vestir y accesorios' }
  ];
};

// Endpoint de salud (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Endpoint GET: Listar todas las categorías
app.get('/categories', (req, res) => {
  res.status(200).json(categories);
});

// Endpoint GET: Obtener categoría por ID
app.get('/categories/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  res.status(200).json(category);
});

// Endpoint POST: Crear nueva categoría
app.post('/categories', (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
  const newCategory = {
    id: newId,
    name: name.trim(),
    description: description || ''
  };

  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// Endpoint PUT: Actualizar categoría por ID
app.put('/categories/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  const { name, description } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  categories[index] = {
    id,
    name: name.trim(),
    description: description !== undefined ? description : categories[index].description
  };

  res.status(200).json(categories[index]);
});

// Endpoint DELETE: Eliminar categoría por ID
app.delete('/categories/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  categories.splice(index, 1);
  res.status(204).send();
});

module.exports = app;
