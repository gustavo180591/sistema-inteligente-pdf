# Sistema Inteligente PDF

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
