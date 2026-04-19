import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT') ?? 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private get from() {
    return this.configService.get<string>('SMTP_FROM') ?? 'noreply@spark.ust.edu.ph';
  }

  async sendWelcomeEmail(params: {
    to: string
    name: string
    role: 'admin' | 'student'
    tempPassword: string
  }) {
    const { to, name, role, tempPassword } = params;
    const portalLabel = role === 'admin' ? 'Admin Portal' : 'Student Portal';
    const portalUrl = role === 'admin'
      ? `${this.configService.get('FRONTEND_URL') ?? 'http://localhost:3000'}/login`
      : `${this.configService.get('FRONTEND_URL') ?? 'http://localhost:3000'}/student/login`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#800000;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">SPARK Academic Repository</h1>
          <p style="color:#f8d7da;margin:4px 0 0;font-size:13px;">University of Santo Tomas — CICS</p>
        </div>
        <div style="padding:32px;">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your <strong>${portalLabel}</strong> account has been created on SPARK. Here are your login credentials:</p>
          <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:6px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${to}</p>
            <p style="margin:0;"><strong>Temporary Password:</strong> <span style="font-family:monospace;font-size:15px;background:#fff;border:1px solid #ddd;padding:2px 8px;border-radius:4px;">${tempPassword}</span></p>
          </div>
          <div style="text-align:center;margin:32px 0;">
            <a href="${portalUrl}"
               style="background:#800000;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
              Log In to SPARK
            </a>
          </div>
          <p style="font-size:12px;color:#e55;">⚠️ Please change your password immediately after your first login for security.</p>
          <p style="font-size:12px;color:#666;">If you did not expect this email, please ignore it or contact your administrator.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;">
          SPARK — College of Information and Computing Sciences, University of Santo Tomas
        </div>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `Your SPARK ${portalLabel} Account Has Been Created`,
        html,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err}`);
    }
  }

  async sendFulltextFulfilledEmail(params: {
    to: string
    requesterName: string
    documentTitle: string
    pdfLink: string
    expiresInHours: number
  }) {
    const { to, requesterName, documentTitle, pdfLink, expiresInHours } = params;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#800000;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">SPARK Academic Repository</h1>
          <p style="color:#f8d7da;margin:4px 0 0;font-size:13px;">University of Santo Tomas — CICS</p>
        </div>
        <div style="padding:32px;">
          <p>Hi <strong>${requesterName}</strong>,</p>
          <p>Your full-text access request for the following document has been <strong style="color:#16a34a;">fulfilled</strong>:</p>
          <div style="background:#f9f9f9;border-left:4px solid #800000;padding:12px 16px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;">${documentTitle}</p>
          </div>
          <p>Click the button below to download the full-text PDF:</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${pdfLink}"
               style="background:#800000;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
              Download PDF
            </a>
          </div>
          <p style="font-size:12px;color:#666;">⚠️ This download link expires in <strong>${expiresInHours} hours</strong>. Please download the file before it expires.</p>
          <p style="font-size:12px;color:#666;">This document is provided for academic and research purposes only. Redistribution is not permitted.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;">
          SPARK — College of Information and Computing Sciences, University of Santo Tomas
        </div>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `Full-Text Access Fulfilled: "${documentTitle}" — SPARK`,
        html,
      });
      this.logger.log(`Full-text fulfilled email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send fulltext email to ${to}: ${err}`);
    }
  }

  async sendFulltextDeniedEmail(params: {
    to: string
    requesterName: string
    documentTitle: string
  }) {
    const { to, requesterName, documentTitle } = params;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#800000;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">SPARK Academic Repository</h1>
          <p style="color:#f8d7da;margin:4px 0 0;font-size:13px;">University of Santo Tomas — CICS</p>
        </div>
        <div style="padding:32px;">
          <p>Hi <strong>${requesterName}</strong>,</p>
          <p>Unfortunately, your full-text access request for the following document has been <strong style="color:#dc2626;">denied</strong>:</p>
          <div style="background:#f9f9f9;border-left:4px solid #800000;padding:12px 16px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;">${documentTitle}</p>
          </div>
          <p>If you believe this is an error or wish to inquire further, please contact us at <a href="mailto:cics.sparkrepository@gmail.com">cics.sparkrepository@gmail.com</a>.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;">
          SPARK — College of Information and Computing Sciences, University of Santo Tomas
        </div>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `Full-Text Access Request Update — SPARK`,
        html,
      });
      this.logger.log(`Full-text denied email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send denied email to ${to}: ${err}`);
    }
  }

  async sendSubmissionApprovedEmail(params: {
    to: string
    studentName: string
    documentTitle: string
    documentType: 'thesis' | 'capstone'
  }) {
    const { to, studentName, documentTitle, documentType } = params;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#800000;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">SPARK Academic Repository</h1>
          <p style="color:#f8d7da;margin:4px 0 0;font-size:13px;">University of Santo Tomas — CICS</p>
        </div>
        <div style="padding:32px;">
          <p>Hi <strong>${studentName}</strong>,</p>
          <p>Congratulations! Your ${documentType} submission has been <strong style="color:#16a34a;">approved</strong> and is now published in the SPARK repository:</p>
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;color:#15803d;">${documentTitle}</p>
          </div>
          <p>Your work is now publicly accessible and can be discovered by researchers, students, and faculty members. Thank you for contributing to the academic knowledge base of the University of Santo Tomas.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${this.configService.get('FRONTEND_URL') ?? 'http://localhost:3000'}/student/dashboard"
               style="background:#800000;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
              View in Dashboard
            </a>
          </div>
          <p style="font-size:12px;color:#666;">You can view your published work and track its visibility through your student dashboard.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;">
          SPARK — College of Information and Computing Sciences, University of Santo Tomas
        </div>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `${documentType === 'thesis' ? 'Thesis' : 'Capstone'} Approved and Published — SPARK`,
        html,
      });
      this.logger.log(`Submission approved email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send approval email to ${to}: ${err}`);
    }
  }

  async sendSubmissionRejectedEmail(params: {
    to: string
    studentName: string
    documentTitle: string
    documentType: 'thesis' | 'capstone'
    feedback?: string
  }) {
    const { to, studentName, documentTitle, documentType, feedback } = params;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#800000;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">SPARK Academic Repository</h1>
          <p style="color:#f8d7da;margin:4px 0 0;font-size:13px;">University of Santo Tomas — CICS</p>
        </div>
        <div style="padding:32px;">
          <p>Hi <strong>${studentName}</strong>,</p>
          <p>We regret to inform you that your ${documentType} submission has been <strong style="color:#dc2626;">rejected</strong>:</p>
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;color:#dc2626;">${documentTitle}</p>
          </div>
          ${feedback ? `
          <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:6px;padding:16px;margin:20px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#374151;">Feedback from Reviewer:</p>
            <p style="margin:0;color:#6b7280;line-height:1.5;">${feedback}</p>
          </div>
          ` : ''}
          <p>If you have questions about this decision or would like to discuss the feedback, please contact your department administrator or reach out to us at <a href="mailto:cics.sparkrepository@gmail.com">cics.sparkrepository@gmail.com</a>.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${this.configService.get('FRONTEND_URL') ?? 'http://localhost:3000'}/student/dashboard"
               style="background:#800000;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
              View Dashboard
            </a>
          </div>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;">
          SPARK — College of Information and Computing Sciences, University of Santo Tomas
        </div>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `${documentType === 'thesis' ? 'Thesis' : 'Capstone'} Submission Update — SPARK`,
        html,
      });
      this.logger.log(`Submission rejected email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send rejection email to ${to}: ${err}`);
    }
  }

  async sendSubmissionRevisionRequestedEmail(params: {
    to: string
    studentName: string
    documentTitle: string
    documentType: 'thesis' | 'capstone'
    feedback: string
  }) {
    const { to, studentName, documentTitle, documentType, feedback } = params;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#800000;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">SPARK Academic Repository</h1>
          <p style="color:#f8d7da;margin:4px 0 0;font-size:13px;">University of Santo Tomas — CICS</p>
        </div>
        <div style="padding:32px;">
          <p>Hi <strong>${studentName}</strong>,</p>
          <p>Your ${documentType} submission requires <strong style="color:#7c3aed;">revision</strong> before it can be approved:</p>
          <div style="background:#faf5ff;border-left:4px solid #7c3aed;padding:12px 16px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;color:#7c3aed;">${documentTitle}</p>
          </div>
          <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:6px;padding:16px;margin:20px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#374151;">Revision Requirements:</p>
            <p style="margin:0;color:#6b7280;line-height:1.5;">${feedback}</p>
          </div>
          <p>Please review the feedback above and make the necessary revisions to your submission. Once you've addressed the requirements, you can resubmit your work through the student portal.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${this.configService.get('FRONTEND_URL') ?? 'http://localhost:3000'}/student/dashboard"
               style="background:#7c3aed;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
              Revise Submission
            </a>
          </div>
          <p style="font-size:12px;color:#666;">If you have questions about the revision requirements, please contact your department administrator.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#888;">
          SPARK — College of Information and Computing Sciences, University of Santo Tomas
        </div>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `${documentType === 'thesis' ? 'Thesis' : 'Capstone'} Revision Required — SPARK`,
        html,
      });
      this.logger.log(`Submission revision email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send revision email to ${to}: ${err}`);
    }
  }
}
