-- Ampliar la restricción CHECK de instanciaParticipacion para
-- permitir la opción "NO APLICA" junto a los 4 consejos.
ALTER TABLE "events" DROP CONSTRAINT "events_instancia_participacion_check";

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