# SIDEPP Digital: Plataforma de Gestión Integral de Socios y Aportes Sindicales

## 📋 Descripción del Proyecto

SIDEPP Digital es una plataforma web integral que transforma la gestión tradicional de socios y aportes mensuales del sindicato SIDEPP en un sistema digital automatizado. La plataforma permite escanear listados de pagos y comprobantes bancarios, registrar socios e instituciones, visualizar cronológicamente los movimientos, y generar reportes profesionales para presentaciones oficiales.

## ✨ Funcionalidades Principales

### 🔍 Escaneo Automático de PDF con Detección de Pagos
- **OCR Inteligente**: Utiliza Tesseract.js para extraer texto de PDFs escaneados
- **Detección Automática**: Clasifica automáticamente documentos (listados SIDEPP, transferencias bancarias)
- **Extracción de Datos**: Detecta nombres, montos, CUIT, fechas, legajos automáticamente
- **Validación**: Verifica la integridad y formato de los datos extraídos

### 🏫 Registro Digital de Socios e Instituciones
- **Gestión de Instituciones**: Registro completo con CUIT, dirección, responsable
- **Gestión de Socios**: Datos personales, legajos, CBU, estado de actividad
- **Historial Completo**: Seguimiento de cambios de institución, suspensiones, reactivaciones
- **Búsqueda Avanzada**: Filtros por nombre, legajo, institución, estado

### 💰 Control Mensual de Aportes y Conciliación
- **Conciliación Automática**: Cruza listados de aportes con transferencias reales
- **Detección de Diferencias**: Identifica discrepancias menores y sugiere correcciones
- **Estados de Pago**: Seguimiento de aportes pendientes, pagados, vencidos
- **Validación por CUIT**: Asocia automáticamente pagos con socios

### 📊 Generación de Reportes Profesionales
- **Múltiples Formatos**: PDF, Excel, CSV
- **Tipos de Reporte**: Por institución, socios, aportes, transferencias, conciliación
- **Diseño Oficial**: Incluye logo del sindicato y formato profesional
- **Exportación**: Descarga directa o envío por email

### 📈 Dashboard y Analytics
- **Estadísticas en Tiempo Real**: Resumen de instituciones, socios, aportes
- **Gráficos Interactivos**: Visualización de tendencias y patrones
- **Actividad Reciente**: Seguimiento de documentos procesados
- **Alertas**: Notificaciones de aportes pendientes o errores

## 🛠️ Tecnologías Utilizadas

### Frontend
- **SvelteKit**: Framework moderno para aplicaciones web
- **Tailwind CSS**: Framework de CSS utilitario
- **TypeScript**: Tipado estático para mayor robustez
- **Tesseract.js**: OCR para extracción de texto de imágenes

### Backend
- **Node.js**: Runtime de JavaScript
- **Prisma**: ORM moderno para base de datos
- **PostgreSQL**: Base de datos relacional robusta
- **PDF.js**: Procesamiento de archivos PDF

### Infraestructura
- **Docker**: Containerización para desarrollo y despliegue
- **Docker Compose**: Orquestación de servicios
- **Nginx**: Servidor web y proxy reverso

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- Docker y Docker Compose
- PostgreSQL (opcional, se incluye en Docker)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/sistema-inteligente-pdf.git
cd sistema-inteligente-pdf
```

### 2. Configurar Variables de Entorno
Crear archivo `.env` en el directorio raíz:
```env
# Database Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=sistema_pdf
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin

# Application Configuration
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Iniciar Base de Datos
```bash
docker compose up -d db
```

### 4. Instalar Dependencias
```bash
cd frontend
npm install
```

### 5. Configurar Base de Datos
```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

### 6. Iniciar Aplicación
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
sistema-inteligente-pdf/
├── frontend/                    # Aplicación SvelteKit
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/      # Componentes reutilizables
│   │   │   ├── pdf/            # Procesamiento de PDF
│   │   │   │   ├── processors/ # Procesadores específicos
│   │   │   │   └── utils.js    # Utilidades PDF
│   │   │   └── services/       # Servicios de API
│   │   ├── routes/             # Páginas y endpoints
│   │   └── app.html            # Template HTML
│   ├── prisma/                 # Esquema y migraciones DB
│   ├── uploads/                # Archivos subidos
│   └── static/                 # Archivos estáticos
├── docker/                     # Configuración Docker
├── docker-compose.yml          # Orquestación de servicios
└── README.md                   # Documentación
```

## 🗄️ Modelo de Datos

### Entidades Principales

#### Institucion
- Información básica (nombre, CUIT, dirección)
- Tipo de institución (escuela, cooperativa, fundación)
- Estado (activa, inactiva, suspendida)
- Relación con socios y aportes

#### Socio
- Datos personales (nombre, apellido, documento)
- Información laboral (legajo, institución)
- Datos bancarios (CBU)
- Estado (activo, inactivo, suspendido, retirado)

#### Aporte
- Período de aporte (YYYY-MM)
- Monto y concepto
- Estado (pendiente, pagado, vencido)
- Relación con socio e institución

#### Transferencia
- Datos bancarios (CBU origen/destino)
- Monto y fecha de operación
- Estado de validación
- Conciliación con aportes

#### DocumentoPDF
- Metadatos del archivo procesado
- Tipo y estado de procesamiento
- Relación con transferencias o listados SIDEPP

## 🔧 Uso del Sistema

### 1. Carga de Documentos
1. Acceder a la sección "Cargar Documentos"
2. Arrastrar o seleccionar archivos PDF
3. El sistema detecta automáticamente el tipo de documento
4. Se procesa y extrae la información relevante
5. Se valida y guarda en la base de datos

### 2. Gestión de Instituciones
1. Ir a la pestaña "Instituciones"
2. Crear nueva institución con datos completos
3. Editar información existente
4. Gestionar estado (activa/inactiva)

### 3. Gestión de Socios
1. Acceder a "Socios"
2. Registrar nuevos socios con datos personales
3. Asignar a institución correspondiente
4. Gestionar estado y cambios

### 4. Control de Aportes
1. Verificar aportes procesados automáticamente
2. Conciliar con transferencias bancarias
3. Identificar aportes pendientes
4. Generar reportes de conciliación

### 5. Generación de Reportes
1. Seleccionar tipo de reporte
2. Configurar parámetros (institución, período)
3. Elegir formato de exportación
4. Descargar o enviar por email

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros para sesiones
- **Validación de Datos**: Verificación de entrada en todos los formularios
- **Control de Acceso**: Roles de usuario (admin, user, viewer)
- **Encriptación**: Contraseñas hasheadas con bcrypt
- **HTTPS**: Comunicación segura en producción

## 📊 Reportes Disponibles

### Por Institución
- Lista completa de socios
- Resumen de aportes por período
- Estado de pagos y transferencias
- Estadísticas de cumplimiento

### De Socios
- Datos personales y laborales
- Historial completo de aportes
- Cambios de institución
- Estado actual

### De Aportes
- Consolidado por período
- Detalle por socio
- Comparación con períodos anteriores
- Identificación de morosos

### De Transferencias
- Control de transferencias bancarias
- Estado de validación
- Conciliación con aportes
- Detección de diferencias

### De Conciliación
- Comparación aportes vs transferencias
- Identificación de discrepancias
- Sugerencias de corrección
- Reporte para auditoría

## 🚀 Despliegue en Producción

### 1. Configurar Variables de Producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-secret
```

### 2. Construir Imagen Docker
```bash
docker build -t sidepp-digital .
```

### 3. Desplegar con Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4. Configurar Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@sidepp-digital.com
- Documentación: [docs.sidepp-digital.com](https://docs.sidepp-digital.com)
- Issues: [GitHub Issues](https://github.com/tu-usuario/sistema-inteligente-pdf/issues)

## 🗺️ Roadmap

### Versión 2.0 (Próximamente)
- [ ] API REST completa
- [ ] Aplicación móvil
- [ ] Integración con sistemas bancarios
- [ ] Notificaciones automáticas
- [ ] Dashboard avanzado con más analytics

### Versión 2.1
- [ ] Integración con AFIP
- [ ] Reportes automáticos por email
- [ ] Backup automático en la nube
- [ ] Multi-tenancy para múltiples sindicatos

---

**SIDEPP Digital** - Transformando la gestión sindical en la era digital 🚀
