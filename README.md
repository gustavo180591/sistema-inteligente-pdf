# 📄 Sistema Inteligente de Procesamiento de PDF

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte](https://img.shields.io/badge/Svelte-4A4A55?style=flat&logo=svelte&logoColor=FF3E00)](https://svelte.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 🏗️ Estructura del Proyecto

```
sistema-inteligente-pdf/
├── frontend/                  # Aplicación SvelteKit
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/    # Componentes reutilizables
│   │   │   │   ├── AnalyticsCharts.svelte
│   │   │   │   ├── DocumentFilters.svelte
│   │   │   │   ├── RecentDocuments.svelte
│   │   │   │   └── StatsOverview.svelte
│   │   │   └── services/
│   │   │       └── pdf/
│   │   │           └── documentProcessor.js  # Lógica de procesamiento de PDFs
│   │   └── routes/
│   │       ├── dashboard/     # Página principal
│   │       └── test-processor/ # Página de pruebas de PDF
│   ├── prisma/                # Esquemas y migraciones
│   └── static/                # Archivos estáticos
└── README.md
```

## 🚀 Características Implementadas

### 📊 Frontend
- Dashboard interactivo con estadísticas
- Componente de carga de archivos con drag & drop
- Visualización de documentos procesados
- Filtrado y búsqueda de documentos

### 🔍 Procesamiento de PDFs
- Identificación automática de tipos (SIDEPP/TRANSFERENCIA)
- Extracción estructurada de datos con soporte para múltiples formatos
- Validación de documentos con verificación de CVU/CBU
- Plantillas configurables para diferentes formatos de escuelas
- Procesamiento mediante:
  - PDF.js para extracción directa de texto
  - Tesseract.js para OCR cuando sea necesario
  - Validación de comprobantes bancarios
- Configuración manual de columnas y formatos

### 🗄️ Base de Datos
- Modelos principales:
  - DocumentoPDF
  - Transferencia
  - Persona
  - PlantillaDocumento
  - ConfiguracionEscuela
- Migraciones con Prisma
- PostgreSQL como motor principal

### 🛠️ Configuración de Plantillas

Las plantillas permiten definir la estructura de diferentes formatos de documentos. Cada plantilla incluye:

```javascript
{
  schoolId: 'school-123',
  templateName: 'Formato Escuela X',
  periodFormat: 'MM/YYYY',
  columns: {
    id: { header: 'Legajo', type: 'number', required: true },
    name: { header: 'Nombre', type: 'string', required: true },
    amount: { header: 'Monto', type: 'currency', required: true }
  },
  receipt: {
    required: true,
    fields: {
      date: { pattern: /Fecha:\s*(\d{2}\/\d{2}\/\d{4})/ },
      amount: { pattern: /Monto:\s*\$?([\d.,]+)/ },
      destinationCVU: { 
        value: '1234567890123456789012',
        pattern: /CBU Destino:\s*([\d]+)/
      }
    }
  }
}
```

### 🔄 Flujo de Procesamiento

1. **Carga de Documento**
   - Subida de archivo PDF
   - Opción para adjuntar comprobante bancario

2. **Selección de Plantilla**
   - Detección automática del formato
   - Selección manual si no se reconoce

3. **Validación**
   - Verificación de datos requeridos
   - Validación de montos y fechas
   - Verificación de CVU/CBU de destino

4. **Confirmación**
   - Vista previa de datos extraídos
   - Opción de corrección manual
   - Confirmación y guardado

## 🛠️ Configuración Rápida

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/sistema-inteligente-pdf.git
   cd sistema-inteligente-pdf/frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   cp .env.example .env
   # Configurar las variables de entorno
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 📦 Dependencias Principales

### Frontend
- SvelteKit
- Tailwind CSS
- Chart.js
- Date-fns

### Backend
- Express
- Prisma ORM
- pdf-parse

## 🚧 Próximas Mejoras
- [ ] Implementar autenticación de usuarios
- [ ] Interfaz de configuración de plantillas
- [ ] Integración con ChatGPT para análisis de documentos
- [ ] Mejorar el sistema de OCR con Tesseract.js
- [ ] Agregar más tipos de documentos
- [ ] Implementar exportación de informes
- [ ] Añadir tests automatizados

## 🤖 Procesamiento Inteligente

El sistema utiliza diferentes estrategias según el tipo de documento:

1. **Documentos Estructurados**
   - Extracción directa de texto con PDF.js
   - Mapeo de columnas según plantilla
   - Validación de formatos

2. **Documentos No Estructurados**
   - Procesamiento OCR con Tesseract.js
   - Análisis de patrones
   - Validación cruzada con plantillas

3. **Comprobantes Bancarios**
   - Verificación de montos
   - Validación de fechas
   - Comprobación de CVU/CBU de destino

## 🤝 Cómo Contribuir
1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte
Para soporte, por favor abre un issue en el repositorio.

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
