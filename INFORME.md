# Laboratorio 5.1 — Creación de un Workflow de GitHub Actions para CI

<p align="center">
  <img src="img/caratula.png" alt="Carátula USFX" width="520">
</p>

| Campo | Datos |
|---|---|
| **Universidad** | Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca |
| **Facultad** | Facultad de Tecnología |
| **Carrera** | Ingeniería en Telecomunicaciones |
| **Universitario** | Vargas Alarcón Brayan Mario |
| **Laboratorio** | 5.1 — Creación de un Workflow de GitHub Actions para CI |
| **Materia / Asignatura** | Trabajando en la Nube (COM610) |
| **Docente** | Ing. Marcelo Quispe Ortega |
| **Semestre** | 2/2026 |
| **Repositorio GitHub** | [https://github.com/TheBranx/github-actions-ci-demo](https://github.com/TheBranx/github-actions-ci-demo) |

---

## Índice

1. [Introducción y Objetivos](#1-introducción-y-objetivos)
2. [Entorno de Trabajo](#2-entorno-de-trabajo)
3. [Paso a Paso del Laboratorio](#3-paso-a-paso-del-laboratorio)
   - [Paso 1: Creación del proyecto Express y pruebas locales](#paso-1-creación-del-proyecto-express-y-pruebas-locales)
   - [Paso 2: Creación de mi primer workflow de CI (`ci.yml`)](#paso-2-creación-de-mi-primer-workflow-de-ci-ciyml)
   - [Paso 3: Agregando análisis estático con ESLint](#paso-3-agregando-análisis-estático-con-eslint)
   - [Paso 4: Prueba de control (Fallo forzado intencional y corrección)](#paso-4-prueba-de-control-fallo-forzado-intencional-y-corrección)
   - [Paso 5: Matriz de ejecución en paralelo (Node 20 y Node 22)](#paso-5-matriz-de-ejecución-en-paralelo-node-20-y-node-22)
4. [Práctica Individual: Mi API CRUD con 100% de Cobertura y Protección](#4-práctica-individual-mi-api-crud-con-100-de-cobertura-y-protección)
   - [4.1 API CRUD de Categorías y 14 pruebas completas](#41-api-crud-de-categorías-y-14-pruebas-completas)
   - [4.2 Pipeline con reporte de cobertura como artefacto](#42-pipeline-con-reporte-de-cobertura-como-artefacto)
   - [4.3 Regla de protección de la rama `main`](#43-regla-de-protección-de-la-rama-main)
   - [4.4 Pull Request y Merge a producción](#44-pull-request-y-merge-a-producción)
5. [Historial Completo de Ejecuciones en Actions](#5-historial-completo-de-ejecuciones-en-actions)
6. [Conclusiones](#6-conclusiones)

---

## 1. Introducción y Objetivos

En este laboratorio aprendí a implementar un pipeline de **Integración Continua (CI)** utilizando **GitHub Actions**. El objetivo principal fue automatizar todo el proceso que normalmente hacemos a mano: instalar dependencias, revisar que el código no tenga errores de sintaxis ni variables sin usar (linting), y correr las pruebas automáticas cada vez que subimos cambios al repositorio mediante un `git push` o abrimos un `pull request`.

Mis objetivos principales fueron:
- Aprender la estructura de un archivo de workflow en `.github/workflows/ci.yml`.
- Automatizar la ejecución de pruebas con Jest y Supertest en runners virtuales de Ubuntu.
- Integrar ESLint para asegurar la calidad y consistencia del código.
- Verificar que el pipeline bloquee cambios cuando se comete un error (fallo forzado intencional).
- Configurar matrices para probar el código en distintas versiones de Node.js a la vez.
- Implementar mi propia API CRUD con 100% de cobertura y proteger la rama `main` con reglas de GitHub.

---

## 2. Entorno de Trabajo

Para desarrollar el laboratorio utilicé:
- **Sistema Operativo:** Windows 11 con PowerShell 5.1.
- **Node.js:** v24.14.0 localmente y Node.js 20/22 en los runners de GitHub.
- **npm:** 11.9.0.
- **Editor:** Visual Studio Code.
- **Control de versiones:** Git con mi cuenta de GitHub (`TheBranx`).
- **Runner en la nube:** `ubuntu-latest` proporcionado por GitHub Actions.

---

## 3. Paso a Paso del Laboratorio

### Paso 1: Creación del proyecto Express y pruebas locales

Primero creé la aplicación básica en Node.js instalando `express`, `jest` y `supertest`. Configuré los primeros endpoints (`/health` y `/users`) junto con sus pruebas en `app.test.js`.

Al ejecutar `npm test` en mi terminal local, comprobé que las dos pruebas pasaron sin ningún problema:

```text
PASS ./app.test.js
  API Tests
    √ GET /health debe retornar status ok (192 ms)
    √ GET /users debe retornar una lista de usuarios (11 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

Luego inicialicé el repositorio Git, creé el archivo `.gitignore` para no subir `node_modules` e hice mi primer push a la rama `main`.

---

### Paso 2: Creación de mi primer workflow de CI (`ci.yml`)

Creé la carpeta `.github/workflows/` y dentro el archivo `ci.yml`. En este archivo le indiqué a GitHub que cada vez que alguien haga `push` o abra un `pull_request` en la rama `main`, levante una máquina virtual con Ubuntu (`ubuntu-latest`), descargue el código con `actions/checkout@v6`, configure Node.js 20 con `actions/setup-node@v6`, instale las dependencias de forma exacta y limpia usando `npm ci`, y ejecute las pruebas con `npm test`.

Subí el cambio con el commit:
`git commit -m "ci: agrega workflow basico de integracion continua"`

Al entrar a la pestaña **Actions** de mi repositorio, vi cómo GitHub Actions ejecutó el job `build-and-test` y terminó **completamente en verde** en solo 11 segundos:

![Workflow básico exitoso](img/lab51_02_workflow_exitoso_cobertura.png)

> **Nota importante:** Usamos `npm ci` en lugar de `npm install` porque está optimizado para entornos de integración continua: instala exactamente lo que está registrado en `package-lock.json`, garantizando que en la nube se instale lo mismo que en mi máquina local.

---

### Paso 3: Agregando análisis estático con ESLint

Para asegurar que el código esté bien escrito y no tenga errores de sintaxis, instalé ESLint configurándolo bajo el formato moderno *Flat Config* (`eslint.config.mjs`). Agregué el script `"lint": "eslint ."` en el `package.json` y modifiqué el workflow para que ejecute el linting **antes** de las pruebas unitarias.

Subí el cambio con el commit:
`git commit -m "ci: agrega paso de linting al pipeline"`

El pipeline se ejecutó automáticamente y pasó todos los pasos en verde, confirmando que la estructura del código cumplía todas las reglas.

---

### Paso 4: Prueba de control (Fallo forzado intencional y corrección)

Para comprobar que el pipeline de verdad protege el proyecto y no es solo un adorno, la guía del laboratorio pide **forzar un fallo intencional**.

1. **Introducción del fallo:** Edité el archivo `app.js` y le agregué a propósito una variable no utilizada:
   ```javascript
   const unusedVariable = 'esto causara un error de linting';
   ```
2. **Subida del fallo:** Hice commit y push:
   `git commit -m "test: fuerza un error de linting para probar el pipeline"`
3. **Resultado en GitHub Actions:** Como era de esperar, el workflow **se detuvo y marcó una ❌ roja** en el paso de linting. Esto es exactamente lo que debe hacer un sistema de CI: detiene el pipeline inmediatamente y **omite (skipped)** el paso de pruebas para no gastar tiempo en código que no cumple los estándares.

![Workflow fallido por linting forzado](img/lab51_03_workflow_fallido_linting.png)

4. **Corrección inmediata:** Una vez verificado el fallo y sacada la captura de evidencia, eliminé la línea defectuosa de `app.js` y subí la corrección:
   `git commit -m "fix: corrige error de linting en app.js"`

El pipeline volvió a ejecutarse y se puso **100% en verde**, demostrando la efectividad del control de calidad automático.

---

### Paso 5: Matriz de ejecución en paralelo (Node 20 y Node 22)

Para asegurarme de que mi aplicación funcione tanto en la versión Node 20 LTS como en Node 22, modifiqué el workflow agregando una estrategia de matriz (`strategy.matrix`):

```yaml
strategy:
  matrix:
    node-version: [20, 22]
```

Subí el cambio con el commit:
`git commit -m "ci: agrega matriz de versiones de node.js"`

Al revisar la pestaña Actions, vi que GitHub Actions levantó **dos runners en paralelo al mismo tiempo**:
- `build-and-test (20)`: Pasó en verde ✔ (10 segundos)
- `build-and-test (22)`: Pasó en verde ✔ (11 segundos)

![Ejecución de la matriz en paralelo](img/lab51_04_matriz_ejecucion.png)

---

## 4. Práctica Individual: Mi API CRUD con 100% de Cobertura y Protección

Para la parte individual del laboratorio, reutilicé y mejoré la **API CRUD de Categorías** que habíamos desarrollado en los laboratorios anteriores de contenedores.

### 4.1 API CRUD de Categorías y 14 pruebas completas

Implementé todas las operaciones requeridas con buenas prácticas REST:
- `GET /health`: Chequeo de estado y tiempo activo (*uptime*).
- `GET /categories`: Lista todas las categorías.
- `GET /categories/:id`: Obtiene una categoría o devuelve `404` si no existe.
- `POST /categories`: Crea una categoría validando que el nombre no esté vacío (devuelve `400` si está vacío o `201` si es exitoso).
- `PUT /categories/:id`: Actualiza los datos de la categoría o devuelve `404` si no existe.
- `DELETE /categories/:id`: Elimina la categoría y devuelve código `204 No Content`.

En `app.test.js` programé una suite completa de **14 pruebas automáticas** con Jest y Supertest. Al correr `npm run test:coverage` logré alcanzar el **100% de cobertura en todas las métricas**:

![Reporte de cobertura 100%](img/lab51_07_reporte_cobertura_html.png)

```text
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 app.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

---

### 4.2 Pipeline con reporte de cobertura como artefacto

Actualicé el workflow final para que:
1. Revise el código con ESLint (`npm run lint`).
2. Ejecute las 14 pruebas y calcule la cobertura (`npm run test:coverage`).
3. Empaquete la carpeta `coverage/` y la suba a GitHub Actions usando `actions/upload-artifact@v4` para que cualquiera pueda descargar y revisar el reporte HTML.

---

### 4.3 Regla de protección de la rama `main`

Para evitar que se suban cambios rotos directamente a `main`, activé la regla de **Branch Protection** en GitHub:
- **Patrón:** `main`
- **Requisito obligatorio:** `Require status checks to pass before merging` activado con el check `build-and-test`.
- **Require branches to be up to date before merging:** Activado.

![Configuración de regla de protección](img/lab51_06_regla_proteccion_rama.png)

En la lista de ramas se puede observar el escudo con la insignia **Protected** junto a la rama `main`:

![Ramas con main protegida](img/lab51_06_ramas_protegidas.png)

---

### 4.4 Pull Request y Merge a producción

Para probar el flujo de trabajo real:
1. Creé una rama propia: `git checkout -b feature/crud-categories`.
2. Hice commit y push de la API CRUD y las pruebas.
3. Abrí el **Pull Request #1** hacia `main`.
4. El pipeline de CI se activó automáticamente ante el evento `pull_request`, corrió el linter, pasó las 14 pruebas y verificó la cobertura.
5. GitHub validó que el check obligatorio `build-and-test` estaba en verde y habilitó el botón de merge.
6. Hice clic en **Merge pull request**, fusionando los cambios a `main` exitosamente:

![Pull Request con checks aprobados](img/lab51_05_pull_request_checks.png)

![Pull Request fusionado en main](img/lab51_05_pull_request_merged.png)

---

## 5. Historial Completo de Ejecuciones en Actions

En la pestaña **Actions** se puede ver el historial completo de las 7 ejecuciones que reflejan exactamente el avance del laboratorio paso por paso:

![Historial de todos los workflows](img/lab51_01_historial_workflows.png)

| N° | Commit / Evento | Estado | ¿Qué se demostró en este paso? |
|---|---|---|---|
| **1** | `ci: agrega workflow basico de integracion continua` | ✔ Verde | Primer workflow básico funcionando en GitHub Actions. |
| **2** | `ci: agrega paso de linting al pipeline` | ✔ Verde | Integración de ESLint antes de las pruebas. |
| **3** | `test: fuerza un error de linting para probar el pipeline` | ❌ Rojo | **Fallo forzado intencional** para verificar que el CI detecta errores y bloquea el avance. |
| **4** | `fix: corrige error de linting en app.js` | ✔ Verde | Corrección inmediata del error, volviendo a estado exitoso. |
| **5** | `ci: agrega matriz de versiones de node.js` | ✔ Verde | Ejecución en paralelo con matriz en Node 20 y Node 22. |
| **6** | `feat: implementacion de API CRUD...` (Pull Request #1) | ✔ Verde | Validación automática de la feature CRUD con 100% de cobertura antes de permitir merge. |
| **7** | `Merge pull request #1...` | ✔ Verde | Fusión limpia a `main` con verificación final aprobada. |

---

## 6. Conclusiones

- **La Integración Continua ahorra tiempo y dolores de cabeza:** En lugar de probar manualmente cada cambio, el servidor en la nube se encarga de revisar que todo compile, cumpla las reglas de formato y pase las pruebas en cuestión de segundos.
- **El valor de forzar un error:** La prueba del fallo intencional demostró que un CI bien configurado actúa como un guardián automático: si un desarrollador comete un descuido de sintaxis o lógica, el pipeline salta en rojo y evita que ese error llegue a producción.
- **Seguridad en equipo con Branch Protection:** Proteger la rama `main` y exigir que los checks de CI estén aprobados antes de hacer merge garantiza que la rama principal siempre esté en estado saludable y lista para desplegar.
- **100% de cobertura como garantía:** Diseñar pruebas unitarias e integrales que cubran cada ruta y cada condición de error asegura que nuestra API responda correctamente tanto ante solicitudes válidas como ante entradas defectuosas o elementos inexistentes.

