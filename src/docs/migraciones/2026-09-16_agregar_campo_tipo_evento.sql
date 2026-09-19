-- =====================================================================
-- Migración: agregar campo "tipoEvento" y ajustar dominio de
-- "instanciaParticipacion" en la tabla "events"
-- Fecha: 2026-09-16
--
-- NOTA: el esquema real de Prisma usa columnas en camelCase
-- ("instanciaParticipacion", no "instancia_participacion") y la tabla
-- se llama "events". Ajustado acorde a la BD real.
--
-- Ejecución:
--   psql "$DATABASE_URL" -f src/docs/migraciones/2026-09-16_agregar_campo_tipo_evento.sql
-- =====================================================================

-- 1. Agregar la columna tipoEvento (VARCHAR(255), no nulo, por defecto vacío)
ALTER TABLE "events" ADD COLUMN     "tipoEvento" VARCHAR(255) NOT NULL DEFAULT '';

-- 2. Migrar datos históricos: los valores de instanciaParticipacion que ahora
--    corresponden a tipos de evento se mueven a tipoEvento, limpiando la instancia.
UPDATE "events"
SET "tipoEvento" = "instanciaParticipacion",
    "instanciaParticipacion" = NULL
WHERE "instanciaParticipacion" IN (
    'VISITA ATI A BENEFICIARIOS',
    'LEVANTAMIENTO DE POLÍGONOS',
    'LEVANTAMIENTO LÍNEA BASE',
    'JORNADA DE INSCRIPCIÓN',
    'OLLA COMUNITARIA',
    'CUÑAS Y DIFUSIÓN',
    'FERIA DE PROVEEDORES',
    'MESA DE TRABAJO',
    'MESA INTERINSTITUCIONAL',
    'PLAN DE INVERSIÓN',
    'ASAMBLEA COMUNITARIA',
    'ENTREGA DE ACTIVOS PRODUCTIVOS',
    'ENTREGA DE KITS A BENEFICIARIOS',
    'ENTREGA DE MAQUINARIA AMARILLA'
);

-- 3. Restricción CHECK: tipoEvento solo acepta la lista de tipos de evento (o vacío)
ALTER TABLE "events"
    ADD CONSTRAINT "events_tipo_evento_check"
    CHECK (
        "tipoEvento" = ''
        OR "tipoEvento" IN (
            'VISITA ATI A BENEFICIARIOS',
            'LEVANTAMIENTO DE POLÍGONOS',
            'LEVANTAMIENTO LÍNEA BASE',
            'JORNADA DE INSCRIPCIÓN',
            'OLLA COMUNITARIA',
            'CUÑAS Y DIFUSIÓN',
            'FERIA DE PROVEEDORES',
            'MESA DE TRABAJO',
            'MESA INTERINSTITUCIONAL',
            'PLAN DE INVERSIÓN',
            'ASAMBLEA COMUNITARIA',
            'ENTREGA DE ACTIVOS PRODUCTIVOS',
            'ENTREGA DE KITS A BENEFICIARIOS',
            'ENTREGA DE MAQUINARIA AMARILLA'
        )
    );

-- 4. Restricción CHECK: instanciaParticipacion solo acepta los 4 consejos, NO APLICA (o vacío/nulo)
ALTER TABLE "events"
    ADD CONSTRAINT "events_instancia_participacion_check"
    CHECK (
        "instanciaParticipacion" IS NULL
        OR "instanciaParticipacion" = ''
        OR "instanciaParticipacion" IN (
            'CONSEJO PERMANENTE DE DIRECCIÓN',
            'CONSEJO ASESOR TERRITORIAL',
            'CONSEJO MUNICIPAL DE PLANEACIÓN',
            'CONSEJO MUNICIPAL DE EVALUACIÓN Y SEGUIMIENTO',
            'NO APLICA'
        )
    );