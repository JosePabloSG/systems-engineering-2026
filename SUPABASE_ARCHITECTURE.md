# Arquitectura de Supabase - Sistema de Memorias

Este documento describe la estructura de la base de datos y almacenamiento para el sistema de memorias.

## Almacenamiento (Bucket)

### Bucket: **memories**

**¿Qué hace?** Guarda las imágenes y videos de las memorias.

**Configuración:**
- **Nombre:** `memories`
- **Acceso público:** Sí - cualquiera puede ver los archivos
- **Tamaño máximo:** 50 MB por archivo
- **Tipos de archivo permitidos:**
  - Imágenes: JPEG, PNG, WebP, GIF
  - Videos: MP4, QuickTime (MOV), WebM, AVI

**Permisos:**
- ✅ Cualquiera puede ver/descargar archivos
- ✅ Cualquiera puede subir archivos (no requiere autenticación)
- ✅ Cualquiera puede modificar archivos
- ✅ Cualquiera puede eliminar archivos

---

## Tablas de la Base de Datos

### Tabla: **memory_categories**

**¿Qué hace?** Organiza las memorias en diferentes categorías.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único de la categoría |
| `name` | Texto | Nombre de la categoría (ej: "Cumpleaños") |
| `slug` | Texto | Identificador en URL (ej: "cumpleanos") |
| `active` | Booleano | Si la categoría está activa o no |
| `created_at` | Fecha/Hora | Cuándo se creó la categoría |
| `updated_at` | Fecha/Hora | Última vez que se modificó |

**Categorías iniciales:**
- 🎂 **Cumpleaños** - Memorias de cumpleaños
- ✈️ **Viajes** - Memorias de viajes y paseos
- ⭐ **Momentos** - Momentos especiales en general

**Permisos:**
- Cualquiera puede ver las categorías activas

---

### Tabla: **memories**

**¿Qué hace?** Guarda cada memoria con su información y media asociada.

| Campo | Tipo | Requerido | Por defecto | Descripción |
|-------|------|-----------|-------------|-------------|
| `id` | UUID | Sí | Auto-generado | Identificador único de la memoria |
| `title` | Texto | No | - | Título opcional de la memoria |
| `description` | Texto | No | - | Descripción opcional |
| `date` | Fecha | Sí | - | Fecha en que ocurrió la memoria |
| `status` | Texto | Sí | `pending` | Estado de aprobación |
| `link` | Texto | Sí | - | URL del archivo (imagen/video) |
| `media_type` | Texto | Sí | - | Tipo de archivo (image o video) |
| `category_id` | UUID | No | - | Categoría a la que pertenece |
| `created_at` | Fecha/Hora | Sí | Ahora | Cuándo se creó |
| `updated_at` | Fecha/Hora | Sí | Ahora | Última modificación |

**Detalles importantes:**

**Campo `status`** - Estado de la memoria
- Valores posibles: `pending`, `approved`, `rejected`
- Por defecto: `pending`
- Solo las memorias con estado `approved` son visibles públicamente

**Campo `media_type`** - Tipo de archivo
- Valores posibles: `image`, `video`
- Define si es una imagen o un video

**Campo `link`** - Enlace al archivo
- Es la URL completa del archivo guardado en el bucket `memories`
- Campo obligatorio - toda memoria debe tener un archivo

**Campo `category_id`** - Categoría
- Opcional - puede no tener categoría asignada
- Si se elimina la categoría, este campo se pone en null automáticamente

**Permisos:**
- ✅ Cualquiera puede ver memorias aprobadas (solo con status='approved')
- ✅ Cualquiera puede crear nuevas memorias (no requiere autenticación, quedan pendientes de aprobación)
- 🔒 Solo administradores pueden aprobar/rechazar memorias (cambiar status)

---

## Flujo de trabajo

1. **Subir archivo:** El usuario sube una imagen o video al bucket `memories`
2. **Crear memoria:** Se crea un registro con la URL del archivo
3. **Revisión:** La memoria queda con estado `pending` (no es visible públicamente)
4. **Aprobación:** Un administrador cambia el estado a `approved` o `rejected`
5. **Publicación:** Solo las memorias aprobadas son visibles para todos

---

## Notas de Seguridad

- Todas las tablas tienen seguridad a nivel de filas (RLS) activada
- El público solo puede ver memorias aprobadas y categorías activas
- **Cualquiera puede subir archivos y crear memorias (sin autenticación requerida)**
- Las memorias creadas quedan en estado 'pending' hasta que un administrador las apruebe
- Los archivos en el bucket son de lectura pública
- Solo administradores pueden cambiar el estado de las memorias (aprobar/rechazar)
