const request = require('supertest');
const app = require('./app');

describe('API Tests - Suite Completa CRUD de Categorías', () => {
  beforeEach(() => {
    app.resetCategories();
  });

  describe('GET /health', () => {
    test('Debe retornar status 200 y status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /categories', () => {
    test('Debe listar todas las categorías iniciales', async () => {
      const res = await request(app).get('/categories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe('Electrónica');
    });
  });

  describe('GET /categories/:id', () => {
    test('Debe retornar una categoría por su ID', async () => {
      const res = await request(app).get('/categories/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe('Electrónica');
    });

    test('Debe retornar 404 si la categoría no existe', async () => {
      const res = await request(app).get('/categories/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Categoría no encontrada');
    });
  });

  describe('POST /categories', () => {
    test('Debe crear una nueva categoría exitosamente', async () => {
      const newCategory = { name: 'Hogar', description: 'Muebles y decoración' };
      const res = await request(app).post('/categories').send(newCategory);
      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBe(3);
      expect(res.body.name).toBe('Hogar');
      expect(res.body.description).toBe('Muebles y decoración');
    });

    test('Debe crear categoría sin descripción opcional asignando valor por defecto', async () => {
      const newCategory = { name: 'Juguetes' };
      const res = await request(app).post('/categories').send(newCategory);
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Juguetes');
      expect(res.body.description).toBe('');
    });

    test('Debe generar ID 1 si la lista de categorías está vacía', async () => {
      await request(app).delete('/categories/1');
      await request(app).delete('/categories/2');
      const res = await request(app).post('/categories').send({ name: 'Primera' });
      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBe(1);
    });

    test('Debe retornar 400 si el nombre está ausente o vacío', async () => {
      const res = await request(app).post('/categories').send({ name: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El nombre de la categoría es obligatorio');
    });
  });

  describe('PUT /categories/:id', () => {
    test('Debe actualizar una categoría existente', async () => {
      const updateData = { name: 'Electrónica y Computación', description: 'Nueva descripción' };
      const res = await request(app).put('/categories/1').send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Electrónica y Computación');
      expect(res.body.description).toBe('Nueva descripción');
    });

    test('Debe mantener la descripción anterior si no se proporciona una nueva', async () => {
      const res = await request(app).put('/categories/1').send({ name: 'Solo Nombre' });
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Solo Nombre');
      expect(res.body.description).toBe('Dispositivos y gadgets');
    });

    test('Debe retornar 400 si el nuevo nombre está vacío', async () => {
      const res = await request(app).put('/categories/1').send({ name: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El nombre de la categoría es obligatorio');
    });

    test('Debe retornar 404 al intentar actualizar una categoría inexistente', async () => {
      const res = await request(app).put('/categories/999').send({ name: 'Inexistente' });
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Categoría no encontrada');
    });
  });

  describe('DELETE /categories/:id', () => {
    test('Debe eliminar una categoría existente con status 204', async () => {
      const res = await request(app).delete('/categories/1');
      expect(res.statusCode).toBe(204);

      // Verificar que ya no existe
      const verifyRes = await request(app).get('/categories/1');
      expect(verifyRes.statusCode).toBe(404);
    });

    test('Debe retornar 404 al intentar eliminar una categoría inexistente', async () => {
      const res = await request(app).delete('/categories/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Categoría no encontrada');
    });
  });
});
