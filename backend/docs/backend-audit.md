# Auditoría del backend de PizadaEc

**Fecha de auditoría:** 2026-09-15  
**Alcance:** carpeta `backend/`. La auditoría fue estática y dinámica, sin modificar código fuente ni configuración. Se ejecutaron comprobaciones locales; la base de datos no estaba disponible.

## 1. Resumen ejecutivo

**Evaluación global: PARCIAL / PROBLEMÁTICO para uso de producción.**

El backend ya contiene un MVP funcional de comercio electrónico sobre NestJS, Prisma y PostgreSQL: autenticación con registro/login JWT, catálogo, categorías, tallas, colores, variantes, imágenes con Cloudinary, carrito y creación/consulta de pedidos. La estructura modular está presente y el build TypeScript compila.

Sin embargo, la etapa real es de **MVP técnico en integración**, no de producto listo para producción. Las pruebas son principalmente scaffolding, no pasan por problemas de configuración y dependencias, ESLint falla, la base de datos no pudo verificarse, existe un directorio de migración aparentemente vacío, `UsersController` no expone funcionalidad y faltan operaciones de administración de usuarios, pagos, descuentos, estados de pedido y endurecimiento operativo.

Hay además un riesgo crítico de seguridad: existe un `.env` local con `JWT_SECRET` débil y credenciales de Cloudinary en texto plano. Aunque `.env` está excluido por `.gitignore`, esas credenciales deben considerarse comprometidas si han sido compartidas o versionadas en algún momento.

## 2. Estado actual del backend

| Área                       | Estado           | Evidencia                                                                                   |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| Estructura NestJS          | **IMPLEMENTADO** | `src/` contiene `AppModule`, módulos por dominio, Prisma y componentes comunes.             |
| Arranque de aplicación     | **IMPLEMENTADO** | `main.ts` crea la app, configura CORS, `ValidationPipe` y Swagger en `/doc`.                |
| Compilación                | **IMPLEMENTADO** | `npm run build` terminó correctamente.                                                      |
| Persistencia               | **PARCIAL**      | Schema y migraciones existen, pero no se verificó conexión ni estado aplicado de la BD.     |
| API de negocio             | **PARCIAL**      | Hay endpoints para el flujo principal, con faltantes y riesgos de consistencia.             |
| Autenticación              | **IMPLEMENTADO** | Registro, login, JWT, guard y roles ADMIN están conectados.                                 |
| Administración de usuarios | **PENDIENTE**    | `UsersController` está vacío; el servicio solo busca por email/id.                          |
| Calidad automática         | **PROBLEMÁTICO** | ESLint falla y los tests no pasan.                                                          |
| Preparación productiva     | **PENDIENTE**    | No hay evidencia de rate limiting, health checks, logging estructurado, pagos o despliegue. |

## 3. Funcionalidades implementadas

### Módulos y endpoints

- **Auth — IMPLEMENTADO:** `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `GET /auth/admin-only`.
- **Products — IMPLEMENTADO:** listado, consulta por id, consulta por slug, alta, actualización y desactivación lógica. Las operaciones de escritura requieren `JwtAuthGuard` y rol `ADMIN`.
- **Categories — IMPLEMENTADO:** listado, consulta, alta, actualización y desactivación lógica; escritura restringida a ADMIN.
- **Sizes — IMPLEMENTADO:** listado, consulta, alta, actualización y borrado; escritura restringida a ADMIN.
- **Colors — IMPLEMENTADO:** listado, consulta, alta, actualización y borrado; escritura restringida a ADMIN.
- **Product variants — IMPLEMENTADO:** listado, consulta, consulta por producto, alta, actualización y desactivación lógica; escritura restringida a ADMIN.
- **Product images — PARCIAL:** subida a Cloudinary, listado por producto, selección de imagen principal y borrado; escritura restringida a ADMIN.
- **Cart — IMPLEMENTADO:** consultar carrito, añadir o acumular artículos, actualizar cantidad, quitar artículo y vaciar carrito; requiere JWT.
- **Orders — PARCIAL:** crear pedido desde carrito, listar pedidos propios y consultar un pedido propio; requiere JWT.
- **Users — PENDIENTE:** no hay endpoints de perfil, listado, actualización, desactivación ni administración de usuarios.

### Reglas y componentes presentes

- DTOs con `class-validator` para autenticación, catálogo, variantes y carrito.
- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`.
- `PrismaService` como cliente compartido con adaptador PostgreSQL y ciclo de conexión/desconexión.
- JWT extraído desde `Authorization: Bearer` y rol incluido en el payload.
- Roles declarados mediante decorador y comprobados por `RolesGuard`.
- Creación de pedidos dentro de una transacción Prisma, con copia de líneas, decremento de stock y vaciado del carrito.
- Documentación Swagger configurada en `/doc`.

## 4. Funcionalidades incompletas o faltantes

- **Administración de usuarios — PENDIENTE:** el módulo existe, pero el controller está vacío y no hay flujo para asignar roles, activar/desactivar usuarios, editar perfiles o listar usuarios.
- **Gestión de pedidos — PARCIAL:** solo se crean y consultan pedidos del propio usuario. No hay endpoints ADMIN para cambiar estados, cancelar, gestionar envíos, devoluciones o consultar todos los pedidos.
- **Pagos — PENDIENTE:** no hay integración ni modelo de pago.
- **Descuentos/promociones — PENDIENTE:** aparece como futura feature en el README, pero no existe módulo, modelo ni endpoint.
- **Seed de roles y datos iniciales — PENDIENTE:** el rol `CLIENTE` se crea implícitamente durante el registro; no hay seed visible ni creación controlada del primer ADMIN.
- **Health/readiness — PENDIENTE:** no hay endpoint de salud ni verificación explícita de dependencias.
- **Validación de archivos — PARCIAL:** se recibe `file` con Multer, pero no se observan límites de tamaño, MIME permitido, extensión o ausencia controlada del archivo.
- **Filtrado de catálogo — PENDIENTE:** no se observan paginación, búsqueda, filtros, ordenamiento parametrizable ni separación clara de productos inactivos en las consultas públicas.
- **Reconciliación de imágenes — PARCIAL:** se elimina en Cloudinary y luego en BD, pero no hay estrategia visible para fallos entre ambas operaciones.
- **Generación del cliente Prisma — PARCIAL:** existe dependencia y el cliente disponible permite compilar, pero no hay script `prisma generate`, `postinstall` ni procedimiento reproducible integrado al build.

## 5. Problemas técnicos encontrados

### Severidad alta

1. **Pruebas Jest no resuelven imports `src/...` — PROBLEMÁTICO.** `tsconfig.json` no define `paths` y las configuraciones Jest no tienen `moduleNameMapper`; varios tests fallan al importar `src/common/...` o `src/prisma/...`.
2. **Tests de Nest no proporcionan dependencias — PROBLEMÁTICO.** Los specs instancian servicios como `AuthService`, `ProductsService`, `CartService` y `OrdersService` sin mock de `PrismaService`/`JwtService` ni importar los módulos correspondientes.
3. **Migración de roles riesgosa — PROBLEMÁTICO.** `20260427165712_add_roles_table/migration.sql` añade `User.roleId` obligatorio antes de garantizar roles o una migración de datos para usuarios existentes. En una BD con usuarios, puede fallar.
4. **Migración `20260910172535` incompleta — PROBLEMÁTICO.** El directorio existe, pero no contiene `migration.sql`, por lo que la historia de migraciones no está limpia ni es reproducible.
5. **Secretos en `.env` — PROBLEMÁTICO.** Hay secreto JWT débil y credenciales Cloudinary en texto plano. Deben rotarse y gestionarse fuera del repositorio/entorno de desarrollo compartido.

### Severidad media

6. **`CloudinaryModule` se importa a sí mismo — PROBLEMÁTICO.** El módulo declara `CloudinaryModule` dentro de sus propios `imports`, una referencia circular innecesaria que debe eliminarse.
7. **Manejo inconsistente de excepciones — PROBLEMÁTICO.** Imágenes y algunos recursos lanzan `new Error(...)`, que puede convertirse en respuesta 500 en lugar de `NotFoundException`/`BadRequestException`. Colores y tallas usan `BadRequestException` para recursos no encontrados.
8. **Errores de codificación en textos y transliteración — PROBLEMÁTICO.** Hay cadenas y expresiones de slug con texto mojibake (`Ã...`), lo que puede producir mensajes corruptos y slugs incorrectos para caracteres españoles.
9. **Actualizaciones de producto no comprueban colisión de slug — PROBLEMÁTICO.** Al cambiar el nombre se genera un nuevo slug, pero no se comprueba previamente su unicidad; la respuesta dependerá de la excepción de Prisma.
10. **Control de stock con ventana de concurrencia — PROBLEMÁTICO.** El stock se comprueba fuera de la transacción y luego se decrementa; dos pedidos concurrentes pueden pasar la validación inicial y competir por el mismo stock.
11. **Uso de `||` para seleccionar precio — PROBLEMÁTICO.** En pedidos, un precio `0` se trata como ausente y se sustituye por el precio base; debería distinguirse `null`/`undefined` de cero.
12. **El arranque no maneja rechazo de `bootstrap()` — PARCIAL.** ESLint reporta `no-floating-promises` en `main.ts`; no hay `catch` explícito ni `void bootstrap().catch(...)`.

### Severidad baja

13. **Directivas ESLint obsoletas — PROBLEMÁTICO.** Hay varias desactivaciones `no-unsafe-*` que ESLint reporta como no utilizadas.
14. **Import no utilizado — PROBLEMÁTICO.** `sizes.service.ts` importa `dot` desde `node:test/reporters` sin usarlo.
15. **El endpoint raíz esperado por el e2e no existe — PROBLEMÁTICO.** El e2e heredado espera `GET /` con `Hello World!`, pero no existe `AppController` en el árbol revisado; es un test de plantilla desactualizado.

## 6. Prisma y base de datos

- **Schema — IMPLEMENTADO:** define `Role`, `User`, `Category`, `Product`, `ProductImage`, `Size`, `Color`, `ProductVariant`, `Cart`, `CartItem`, `Order` y `OrderItem`, con relaciones, índices únicos y estados activos.
- **Configuración — IMPLEMENTADO:** `prisma.config.ts` carga dotenv, apunta al schema y migraciones y obtiene `DATABASE_URL` mediante `env()`.
- **Cliente — IMPLEMENTADO/PARCIAL:** `PrismaService` usa `PrismaPg` y `process.env.DATABASE_URL`; implementa `$connect()` y `$disconnect()`. La dependencia `@prisma/client` está instalada.
- **Migraciones — PARCIAL:** hay ocho migraciones SQL con evolución de usuarios, roles, catálogo, imágenes, carrito y pedidos; la novena carpeta está vacía y la migración de `roleId` obligatorio es peligrosa para datos existentes.
- **Validación — IMPLEMENTADO:** `npx prisma validate` pasó.
- **Estado aplicado — NO VERIFICABLE:** `npx prisma migrate status` intentó conectar a PostgreSQL en `localhost:5433` y terminó con `P1001`; no fue posible confirmar si la BD está al día.
- **Datos iniciales — PENDIENTE:** no se encontró seed para roles, ADMIN, categorías u otros datos base.
- **Reproducibilidad — PARCIAL:** no existe un script npm para `prisma generate` ni para migraciones/seed; el build depende de que el cliente ya esté disponible.

## 7. Autenticación y seguridad

### Aspectos implementados

- Contraseñas hasheadas con `bcryptjs` y factor 10.
- JWT con expiración configurable por `JWT_EXPIRES_IN`.
- El password se elimina de las respuestas de registro/login.
- JWT guard para rutas privadas y guard de roles para operaciones ADMIN.
- `ValidationPipe` global evita propiedades no declaradas y transforma entradas.
- Las consultas de pedidos filtran por `userId`, evitando que un usuario consulte directamente el pedido de otro.

### Riesgos y faltantes

- **PROBLEMÁTICO:** `JWT_SECRET` local es predecible y está en texto plano en `.env`; rotar y usar gestión de secretos.
- **PROBLEMÁTICO:** no hay validación de configuración al inicio para comprobar formato, longitud y presencia de variables según entorno.
- **PROBLEMÁTICO:** no hay rate limiting, bloqueo de intentos, recuperación de contraseña, verificación de email, refresh token ni revocación de JWT.
- **PROBLEMÁTICO:** `JwtStrategy` confía en el rol incluido en el token y no vuelve a comprobar que el usuario siga activo o que el rol no haya cambiado.
- **PROBLEMÁTICO:** CORS está fijado a `http://localhost:3000`, con `credentials: true`, sin configuración por entorno.
- **PROBLEMÁTICO:** no hay límites ni validación de MIME/tamaño para uploads y el controller usa `file: any`.
- **PARCIAL:** no se observan Helmet, logging/auditoría de acciones administrativas, sanitización específica o política de errores uniforme.

## 8. Build, TypeScript, ESLint y tests

### Comprobaciones ejecutadas

| Comando                                     | Resultado real                                                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                             | **PASA**. `nest build` terminó correctamente.                                                                                           |
| `npx eslint "{src,apps,libs,test}/**/*.ts"` | **FALLA**: 3 errores y 24 warnings. Errores en `product-images.service.ts`, `product-variants.controller.spec.ts` y `sizes.service.ts`. |
| `npm test -- --runInBand`                   | **FALLA**: 20 suites fallidas, 2 pasadas; 13 tests fallidos, 2 pasados; 15 tests totales.                                               |
| `npm test -- --coverage --runInBand`        | **FALLA** por los mismos problemas; los artefactos de cobertura generados no representan una cobertura fiable del comportamiento.       |
| `npm run test:e2e -- --runInBand`           | **FALLA antes de ejecutar tests** por el import alias `src/common/guards/roles.guard`; 0 tests ejecutados.                              |
| `npx prisma validate`                       | **PASA**: schema válido.                                                                                                                |
| `npx prisma migrate status`                 | **NO VERIFICABLE**: `P1001`, PostgreSQL no accesible en `localhost:5433`.                                                               |

### Configuración observada

- TypeScript usa `module`/`moduleResolution` `nodenext`, target `ES2023`, `strictNullChecks` y `noImplicitAny: false`.
- ESLint usa configuración flat y `recommendedTypeChecked`.
- El script `lint` es `eslint ... --fix`; no es apropiado como check de CI porque modifica archivos.
- Jest tiene `rootDir: "src"` para unit tests, pero usa imports absolutos `src/...` incompatibles con la resolución actual.
- Hay **22 archivos spec** y cada uno contiene un solo test de definición (`should be defined`); no cubren reglas de negocio, autorización, errores, Prisma ni flujos HTTP de forma significativa.
- Los dos tests que pasan no constituyen evidencia de funcionalidad de negocio; la mayoría no puede compilar o resolver dependencias.

## 9. Etapa de desarrollo estimada

**Etapa estimada: MVP funcional en desarrollo / integración temprana, aproximadamente entre prototipo avanzado y beta técnica.**

La estimación se justifica por estas evidencias:

1. Existe una separación por dominios y un flujo comercial reconocible: registro/login → catálogo → variante → carrito → pedido.
2. La persistencia tiene un schema relacional amplio y varias migraciones, y el build compila; esto supera un scaffold inicial.
3. Hay integración externa con Cloudinary y documentación Swagger, señales de implementación de funcionalidades reales.
4. Persisten piezas de plantilla o incompletas: README estándar de Nest, e2e de `Hello World`, `UsersController` vacío y migración vacía.
5. La calidad no está integrada: tests de definición sin mocks, suite fallida, alias no configurados y ESLint con errores.
6. Faltan capacidades normalmente necesarias para una beta de producto: administración de usuarios/pedidos, pagos, descuentos, seeds, health checks, observabilidad y controles de seguridad operativos.

Por tanto, **no debe clasificarse como backend terminado ni listo para producción**, aunque sí contiene una base suficiente para continuar el desarrollo del MVP.

## 10. Próximos pasos recomendados

1. **Rotar inmediatamente** el secreto JWT y las credenciales Cloudinary; mantener solo variables de ejemplo documentadas y gestionar secretos por entorno.
2. **Levantar PostgreSQL y validar migraciones** en una base limpia y una base con datos; corregir la migración de `roleId` y eliminar o completar la carpeta `20260910172535`.
3. **Reparar la configuración de tests:** definir alias Jest/TypeScript coherentes o sustituir imports absolutos, y mockear Prisma/JWT/Cloudinary en unit tests.
4. **Reemplazar los specs de scaffolding** por pruebas de casos críticos: registro/login, roles, validación DTO, CRUD, aislamiento de pedidos, stock concurrente, carrito y errores.
5. **Corregir ESLint sin autofix automático en CI:** eliminar imports/directivas obsoletas, resolver los 3 errores y cambiar el check a modo no mutante.
6. **Cerrar seguridad de uploads y configuración:** MIME, tamaño, archivo obligatorio, configuración validada, CORS por entorno, rate limiting y headers de seguridad.
7. **Corregir consistencia de negocio:** reserva/decremento atómico de stock, manejo de `null` para precios, unicidad de slug en actualización y transacciones para imagen principal.
8. **Completar administración:** endpoints protegidos para usuarios, roles y pedidos; definir estados y permisos explícitos.
9. **Añadir seed y scripts reproducibles:** `prisma generate`, migración deploy, seed de roles/ADMIN y comandos de verificación para CI.
10. **Añadir operación mínima:** health/readiness, logging estructurado, manejo uniforme de excepciones, métricas y documentación de despliegue.
11. **Actualizar README y e2e** para describir la API real y probar endpoints reales, eliminando expectativas heredadas de `Hello World!`.
