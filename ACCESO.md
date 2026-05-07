# AOI Crystal — Panel de Equipo

## Acceso al panel

| Campo | Valor |
|-------|-------|
| URL | http://localhost:3001/equipo/login |
| Usuario | `aoi` |
| Contraseña | `aoi2024` |

## Cómo arrancar

```bash
cd /Users/arisa/aoi-crystal
npm run dev
```

Luego abrir: **http://localhost:3001/equipo/login**

---

## Lo que está incluido

### Bloque 1 — Login
- ✅ Pantalla de login con usuario/contraseña
- ✅ Bloqueo de 15 min tras 3 intentos fallidos
- ✅ Sesión que expira a las 8 horas
- ✅ Botón de cerrar sesión en el menú

### Bloque 2 — Dashboard
- ✅ Pedidos hoy / Pendientes (alerta si >3) / Ingresos hoy / Ingresos del mes
- ✅ Comparativa mes actual vs mes anterior
- ✅ Gráfico de barras — ventas últimos 7 días
- ✅ Top productos más vendidos
- ✅ Últimos 10 pedidos
- ✅ Notificaciones en tiempo real (SSE) con badge contador
- ✅ Auto-actualización cada 30 segundos

### Bloque 3 — Gestión de productos
- ✅ Tabla con filtro por nombre y categoría
- ✅ Toggle visible/oculto sin eliminar
- ✅ Añadir/editar producto con modal
- ✅ Subida de hasta 6 fotos por producto (drag & drop)
- ✅ Reordenar fotos con flechas
- ✅ Categorías: llavero, pendiente, letra, paraguas, portafoto
- ✅ Colores, acabados, texto personalizable
- ✅ Previsualización antes de publicar
- ✅ Eliminar con confirmación "¿Estás segura?"

### Bloque 4 — Gestión de pedidos
- ✅ Tabla con filtros por estado y buscador
- ✅ Detalle completo del pedido (clienta, productos, opciones)
- ✅ Cambio de estado: pendiente → confirmado → enviado / cancelado
- ✅ Email automático a la clienta al cambiar estado
- ✅ Captura de Bizum visible en el detalle
- ✅ Notas internas por pedido
- ✅ Crear pedidos manualmente

### Bloque 5 — Panel financiero
- ✅ Resumen hoy / semana / mes / total histórico
- ✅ Comparativa mes actual vs mes anterior
- ✅ Coste de materiales editable por pedido
- ✅ Beneficio neto calculado automáticamente
- ✅ Exportar a Excel con 3 pestañas: Pedidos, Finanzas y Resumen

### Bloque 6 — Agentes
- ✅ Agente de notificación (SSE — tiempo real, sin recargar)
- ✅ Agente de log (registra cada acción con fecha y hora)
- ✅ Agente de dashboard (actualización automática cada 30s)

---

## Configurar emails (opcional)

Editar `/Users/arisa/aoi-crystal/.env.local`:

```
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
```

Para Gmail: usar una **Contraseña de aplicación** (Seguridad → Verificación en 2 pasos → Contraseñas de app).

---

## Cambiar contraseña del panel

Abrir `lib/db.ts` y cambiar:
```ts
bcrypt.hashSync('aoi2024', 10)  // ← cambiar 'aoi2024' por la nueva contraseña
```
Luego borrar `data/aoi.db` y reiniciar el servidor.
