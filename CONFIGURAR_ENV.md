# ⚙️ Configuración de Variables de Entorno

El servidor está corriendo, pero necesitas configurar las credenciales de Supabase para que funcione completamente.

## 📝 Pasos para Configurar

### 1. Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo llamado `.env.local` con el siguiente contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Obtener Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto (o usa uno existente)
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar Base de Datos

En el SQL Editor de Supabase, ejecuta estos archivos en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_row_level_security.sql`
3. `supabase/seed.sql` (opcional, para datos de ejemplo)

### 4. Reiniciar el Servidor

Después de crear `.env.local`:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm run dev
```

## ✅ Verificación

Una vez configurado, deberías poder:

- ✅ Ver la página de inicio sin errores
- ✅ Navegar por las páginas públicas
- ✅ Acceder a `/admin` (redirige a login)
- ✅ Ver productos si cargaste datos de ejemplo

## 🚨 Nota Importante

**Sin las credenciales de Supabase:**
- El sitio cargará pero mostrará errores al intentar cargar datos
- Las páginas que requieren datos de la base no funcionarán
- El admin portal no podrá autenticar usuarios

**Con las credenciales configuradas:**
- Todo funcionará completamente
- Podrás gestionar productos desde el admin
- Los datos se cargarán desde Supabase

---

**El servidor está corriendo en:** http://localhost:3000

