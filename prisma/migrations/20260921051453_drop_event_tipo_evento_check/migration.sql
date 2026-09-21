-- Drop CHECK constraint: tipoEvento ahora viene del catálogo dinámico de eventos.
ALTER TABLE "events" DROP CONSTRAINT "events_tipo_evento_check";