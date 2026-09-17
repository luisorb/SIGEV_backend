import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface QuotationApprovedEmailData {
  quotationCode: string;
  amount: number;
  itemsCount: number;
  eventLabel: string;
  approvedBy: string;
  approvedAt: Date;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly from: string;
  private readonly quotationApprovedRecipients: string[];

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('resend.apiKey') ?? '';
    this.from =
      this.configService.get<string>('resend.from') ??
      'SIGEV <onboarding@resend.dev>';
    this.quotationApprovedRecipients =
      this.configService.get<string[]>('resend.quotationApprovedRecipients') ??
      [];
  }

  async sendQuotationApproved(data: QuotationApprovedEmailData): Promise<void> {
    if (!this.apiKey || this.quotationApprovedRecipients.length === 0) {
      this.logger.warn(
        'No se envió el correo de cotización aprobada: configure RESEND_API_KEY y QUOTATION_APPROVED_RECIPIENTS',
      );
      return;
    }

    const amount = this.formatCurrency(data.amount);
    const itemsLabel = `${data.itemsCount} ítem${data.itemsCount === 1 ? '' : 's'}`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2 style="margin: 0 0 12px; color: #0f172a;">Cotización aprobada</h2>
        <p>La cotización <strong>${this.escape(data.quotationCode)}</strong> por valor de <strong>${amount}</strong> con ${itemsLabel} fue aprobada como definitiva.</p>
        <ul>
          <li><strong>Evento:</strong> ${this.escape(data.eventLabel)}</li>
          <li><strong>Aprobada por:</strong> ${this.escape(data.approvedBy)}</li>
          <li><strong>Fecha:</strong> ${this.formatDate(data.approvedAt)}</li>
        </ul>
        <p style="color: #64748b; font-size: 12px;">Este es un mensaje automático del sistema SIGEV.</p>
      </div>
    `;

    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: this.quotationApprovedRecipients,
          subject: `Cotización ${data.quotationCode} aprobada`,
          html,
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        this.logger.error(
          `Resend respondió ${response.status} al enviar el correo de cotización aprobada: ${detail}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error enviando el correo de cotización aprobada: ${(error as Error).message}`,
      );
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);
  }

  private formatDate(value: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(value);
  }

  private escape(value: string): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
