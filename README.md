# 📄 Sistema Inteligente de Procesamiento de PDFs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Svelte](https://img.shields.io/badge/Svelte-4A4A55?style=flat&logo=svelte&logoColor=FF3E00)](https://svelte.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 🚀 Descripción

Sistema para el procesamiento automático de archivos PDF de SIDEPP y transferencias bancarias, diseñado para extraer información estructurada y almacenarla en una base de datos PostgreSQL con una interfaz web intuitiva.

## 🌟 Características Principales

### ✅ Implementadas
- **Estructura Base** con Docker y PostgreSQL
- **Modelo de Datos** para manejo de documentos y personas
- **Extracción Básica** de texto de PDFs
- **API Inicial** para procesamiento de archivos

### 🚧 En Desarrollo
- **Procesamiento Avanzado** de PDFs
- **Interfaz de Usuario** completa
- **Dashboard** de análisis
- **Exportación** de informes

## 🛠️ Stack Tecnológico

- **Frontend**: SvelteKit 2
- **Backend**: Node.js
- **Base de Datos**: PostgreSQL 15
- **ORM**: Prisma
- **Contenedorización**: Docker + Docker Compose
- **Herramientas Adicionales**:
  - pgAdmin para gestión de base de datos
  - pdf-parse para extracción de texto
  - Tailwind CSS para estilos

## 🚀 Comenzando

### Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (solo para desarrollo)
- pnpm (recomendado)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/sistema-inteligente-pdf.git
   cd sistema-inteligente-pdf
   ```

2. **Configuración del entorno**
   ```bash
   cp .env.example .env
   # Editar las variables según sea necesario
   ```

3. **Iniciar los servicios con Docker**
   ```bash
   docker-compose up -d
   ```

4. **Instalar dependencias del frontend**
   ```bash
   cd frontend
   pnpm install
   ```

5. **Aplicar migraciones de la base de datos**
   ```bash
   pnpm prisma migrate dev
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   pnpm run dev
   ```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📂 Estructura del Proyecto

```
sistema-inteligente-pdf/
├── docker/                 # Configuraciones de Docker
│   ├── db/                # Scripts de inicialización de PostgreSQL
│   └── nginx/             # Configuración de Nginx (si aplica)
├── frontend/              # Aplicación SvelteKit
│   ├── prisma/            # Esquemas y migraciones de Prisma
│   ├── src/               # Código fuente de la aplicación
│   │   ├── lib/           # Utilidades y lógica compartida
│   │   ├── routes/        # Rutas de la aplicación
│   │   └── app.html       # Plantilla HTML principal
│   └── scripts/           # Scripts de procesamiento
└── docker-compose.yml     # Configuración de servicios Docker
```

## 🔄 Flujo de Trabajo

1. **Carga de Documentos**
   - Los usuarios suben archivos PDF mediante la interfaz web
   - Los archivos se validan y procesan en el servidor

2. **Procesamiento**
   - Extracción de texto con `pdf-parse`
   - Análisis y estructuración de datos
   - Almacenamiento en PostgreSQL

3. **Visualización**
   - Dashboard con resumen de documentos procesados
   - Búsqueda y filtrado de registros
   - Exportación de informes

## 📊 Estado del Proyecto (45% Completado)

### ✅ Funcionalidades Completadas
- [x] Configuración de Docker con PostgreSQL y pgAdmin
- [x] Modelo de datos con Prisma
- [x] Extracción básica de texto con pdf-parse
- [x] API para subida de archivos
- [x] Estructura base del frontend con SvelteKit

### 🚧 Próximos Pasos
1. **Procesamiento de PDFs** (En Progreso)
   - [ ] Identificación automática de tipo de documento
   - [ ] Extracción estructurada de datos
   - [ ] Validación de información extraída

2. **Interfaz de Usuario**
   - [ ] Formulario de carga de archivos
   - [ ] Visualización de resultados
   - [ ] Dashboard de análisis

3. **Características Adicionales**
   - [ ] Exportación de datos
   - [ ] Autenticación de usuarios
   - [ ] Búsqueda avanzada

## 🛠️ Cómo Contribuir

1. **Reportar problemas**
   - Crea un issue describiendo el problema o mejora
   - Incluye ejemplos y pasos para reproducir

2. **Desarrollo**
   - Haz fork del reposistro
   - Crea una rama para tu feature (`feature/nueva-funcionalidad`)
   - Envía un Pull Request

3. **Pruebas**
   - Asegúrate que las pruebas pasen
   - Actualiza la documentación según sea necesario

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, lee nuestras [pautas de contribución](CONTRIBUTING.md) antes de enviar cambios.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

- **Nombre**: [Tu Nombre]
- **Email**: [tu@email.com]
- **LinkedIn**: [enlace a tu perfil]

---

<div align="center">
  Hecho con ❤️ para simplificar el procesamiento de documentos
</div> Inteligente PDF

🚀 **Sistema inteligente para la carga y análisis automático de PDFs de liquidaciones y transferencias.**  
Convierte PDFs en registros estructurados en una base de datos **PostgreSQL**, usando **Prisma** y **SvelteKit 2**.

---

## 🛠️ Tecnologías

- **Frontend:** SvelteKit 2 + Svelte 5 + Tailwind CSS 4
- **Backend:** Node.js 22 + Prisma
- **Base de datos:** PostgreSQL 15 + pgAdmin
- **Contenedores:** Docker + Docker Compose
- **OCR / Parsing:** pdf-parse + tesseract.js
- **Infraestructura:** Pop!_OS / Ubuntu 22.04

---

## 📂 Estructura del proyecto

```
sistema-inteligente-pdf/
 ├─ frontend/                  # SvelteKit 2 + Tailwind 4
 │   ├─ src/routes/upload/     # Endpoint para subir PDFs
 │   ├─ src/lib/services/      # Parser de PDFs y OCR
 │   └─ prisma/                # Esquema de base de datos
 │
 ├─ docker/
 │   └─ db_data/               # Volumen persistente de PostgreSQL
 │
 ├─ docker-compose.yml         # Orquestación de contenedores
 ├─ README.md
 └─ .env                       # Variables de entorno
```

---

## ⚡ Instalación en Pop!_OS

### 1️⃣ Instalar Node.js y Docker

```bash
# Node 22.x ya instalado
node -v
npm -v

# Limpiar intentos previos de docker.io
sudo apt remove --purge docker.io containerd.io docker-compose -y
sudo apt autoremove -y

# Instalar dependencias base
sudo apt install ca-certificates curl gnupg lsb-release -y

# Clave GPG de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Repositorio oficial Docker CE
echo   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg]   https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker CE + CLI + Compose Plugin
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Activar docker sin sudo
sudo usermod -aG docker $USER
newgrp docker
```

Probar instalación:

```bash
docker --version
docker compose version
docker run hello-world
```

---

### 2️⃣ Clonar el proyecto y configurar

```bash
git clone git@github.com:desarrollandowebs/sistema-inteligente-pdf.git
cd sistema-inteligente-pdf
```

Crear el archivo **`.env`** en la raíz:

```env
# ============================
# ⚙️  Configuración de Backend
# ============================

# URL de la base de datos para Prisma
DATABASE_URL="postgresql://admin:admin@db:5432/sistema_pdf?schema=public"

# Puerto donde corre el servidor SvelteKit (Docker usa 3000)
PORT=3000

# ============================
# 🔐 Configuración de Seguridad
# ============================

# JWT para futuras autenticaciones (opcional)
JWT_SECRET="cambia-esta-clave-super-segura"

# ============================
# 📦 Configuración de Docker
# ============================

# Credenciales PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=sistema_pdf

# Credenciales de pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# ============================
# 📄 Configuración de Upload
# ============================

# Carpeta temporal para PDFs subidos
UPLOAD_DIR="./uploads"

# Tamaño máximo de archivos (en MB)
MAX_FILE_SIZE=50
```

---

### 3️⃣ Levantar los servicios con Docker

```bash
docker compose up -d
```

- **PostgreSQL:** `localhost:5432`  
- **pgAdmin:** `http://localhost:8080` (admin@admin.com / admin)

---

### 4️⃣ Inicializar Prisma

```bash
cd frontend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

---

### 5️⃣ Ejecutar el frontend

```bash
npm run dev
```

Abrir en `http://localhost:5173`

---

## 📥 Flujo de carga de PDFs

1. Subís un PDF desde la interfaz web.  
2. El backend lo procesa:
   - Si es PDF de texto → usa **pdf-parse**
   - Si es imagen escaneada → usa **tesseract.js (OCR)**  
3. Los datos extraídos se guardan en **PostgreSQL** automáticamente.  
4. Podés verlos en el **dashboard** y exportar reportes.

---

## 🔮 Próximos pasos

- [ ] Script de parsing automático de SIDEPP / liquidaciones
- [ ] Dashboard con filtros por escuela, fechas y conceptos
- [ ] Exportación a Excel y PDF
- [ ] Integración con almacenamiento en la nube

---

## 📄 Licencia

Proyecto privado / en desarrollo.  
Autor: **Gustavo (@desarrollandowebs)**
