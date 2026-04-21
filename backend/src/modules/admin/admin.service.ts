import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EmailService } from '../email/email.service';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@Injectable()
export class AdminService {
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  // ─── User Listing ─────────────────────────────────────────────────────────

  /**
   * getUsers returns all users scoped by department.
   * Admins see only their department; super_admin sees all.
   */
  async getUsers(currentUser: any) {
    let query = this.databaseService.client
      .from('users')
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .order('created_at', { ascending: false });

    if (currentUser.role === 'admin') {
      query = query.eq('department', currentUser.department);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data ?? [];
  }

  // ─── M-04: Submission Review ───────────────────────────────────────────────

  /**
   * getSubmissions returns pending/all submissions scoped by department.
   * Admins only see documents from their own department.
   * super_admin sees everything.
   */
  async getSubmissions(currentUser: any, status?: string) {
    let query = this.databaseService.client
      .from('documents')
      .select(
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, degree, keywords, pdf_file_path, uploaded_by, status, created_at, updated_at',
      )
      .order('created_at', { ascending: false });

    // Department scoping: admins see only their department
    if (currentUser.role === 'admin') {
      query = query.eq('department', currentUser.department);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  /**
   * getSubmissionById returns a single document by ID, with its review history.
   */
  async getSubmissionById(documentId: string, currentUser: any) {
    const { data: document, error } = await this.databaseService.client
      .from('documents')
      .select(
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, degree, keywords, pdf_file_path, uploaded_by, status, created_at, updated_at',
      )
      .eq('id', documentId)
      .single();

    if (error || !document) {
      throw new NotFoundException('Document not found.');
    }

    if (currentUser.role === 'admin' && document.department !== currentUser.department) {
      throw new ForbiddenException('You can only view documents from your department.');
    }

    const { data: reviews } = await this.databaseService.client
      .from('reviews')
      .select('id, decision, feedback_text, reviewed_by, created_at')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    return { ...document, reviews: reviews ?? [] };
  }

  /**
   * getSubmissionPdfUrl generates a signed URL for admins to preview the PDF.
   * Only admins from the same department (or super_admin) can access.
   */
  async getSubmissionPdfUrl(documentId: string, currentUser: any) {
    // Fetch the document
    const { data: document, error: fetchError } = await this.databaseService.client
      .from('documents')
      .select('id, pdf_file_path, department')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      throw new NotFoundException('Document not found.');
    }

    // Check permissions: admin can only view their department's documents
    if (currentUser.role === 'admin' && document.department !== currentUser.department) {
      throw new ForbiddenException('You can only preview documents from your department.');
    }

    if (!document.pdf_file_path) {
      throw new NotFoundException('No PDF file associated with this document.');
    }

    // Generate a signed URL valid for 1 hour
    const { data: signedUrlData, error: urlError } = await this.databaseService.client
      .storage
      .from('documents')
      .createSignedUrl(document.pdf_file_path, 3600); // 3600 seconds = 1 hour

    if (urlError || !signedUrlData) {
      throw new InternalServerErrorException('Failed to generate PDF preview URL.');
    }

    return {
      pdfUrl: signedUrlData.signedUrl,
      expiresIn: 3600,
    };
  }

  /**
   * reviewSubmission records a review decision (approve | reject | revise),
   * updates the document status, and fires a notification to the student.
   */
  async reviewSubmission(documentId: string, currentUser: any, dto: ReviewSubmissionDto) {
    // Fetch the target document
    const { data: document, error: fetchError } = await this.databaseService.client
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      throw new NotFoundException('Document not found.');
    }

    // Admins may only review documents belonging to their department
    if (currentUser.role === 'admin' && document.department !== currentUser.department) {
      throw new ForbiddenException('You can only review documents from your department.');
    }

    // Map decision → new status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      revise: 'revision',
    };
    const newStatus = statusMap[dto.decision];

    // Persist the review record
    const { error: reviewError } = await this.databaseService.client.from('reviews').insert({
      document_id: documentId,
      reviewed_by: currentUser.id,
      decision: dto.decision,
      feedback_text: dto.feedback ?? null,
    });

    if (reviewError) {
      throw new InternalServerErrorException('Failed to save review record.');
    }

    // Update document status
    const { data: updated, error: updateError } = await this.databaseService.client
      .from('documents')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException('Failed to update document status.');
    }

    // Notify the submitting student
    const notificationMessage = dto.feedback
      ? `Your document "${document.title}" was ${dto.decision}d. Feedback: ${dto.feedback}`
      : `Your document "${document.title}" was ${dto.decision}d.`;

    await this.databaseService.client.from('notifications').insert({
      user_id: document.uploaded_by,
      type: `document_${dto.decision}d`,
      message: notificationMessage,
      is_read: false,
      reference_id: documentId,
    });

    // Send email notification to student (fire-and-forget — never block the response)
    (async () => {
      try {
        // Get student details
        const { data: student } = await this.databaseService.client
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', document.uploaded_by)
          .single();

        if (student) {
          const studentName = `${student.first_name} ${student.last_name}`;
          const documentType = document.type as 'thesis' | 'capstone';

          if (dto.decision === 'approve') {
            await this.emailService.sendSubmissionApprovedEmail({
              to: student.email,
              studentName,
              documentTitle: document.title,
              documentType,
            });
          } else if (dto.decision === 'reject') {
            await this.emailService.sendSubmissionRejectedEmail({
              to: student.email,
              studentName,
              documentTitle: document.title,
              documentType,
              feedback: dto.feedback,
            });
          } else if (dto.decision === 'revise') {
            await this.emailService.sendSubmissionRevisionRequestedEmail({
              to: student.email,
              studentName,
              documentTitle: document.title,
              documentType,
              feedback: dto.feedback || 'Please revise your submission.',
            });
          }
        }
      } catch (err) {
        // Log error but don't fail the request
        console.error('Failed to send submission email notification:', err);
      }
    })();

    return {
      message: `Document ${dto.decision}d successfully.`,
      document: updated,
    };
  }

  // ─── M-04: Full-Text Request Handling ─────────────────────────────────────

  /**
   * getFulltextRequests returns all full-text requests.
   * Admins see requests for documents in their department; super_admin sees all.
   */
  async getFulltextRequests(currentUser: any, status?: string) {
    // For admins: scope to requests for documents in their department only
    if (currentUser.role === 'admin') {
      const { data: deptDocs } = await this.databaseService.client
        .from('documents')
        .select('id')
        .eq('department', currentUser.department);

      const docIds = (deptDocs ?? []).map((d: any) => d.id);

      if (docIds.length === 0) return [];

      let query = this.databaseService.client
        .from('fulltext_requests')
        .select(
          'id, document_id, requester_name, requester_email, purpose, department, status, handled_by, created_at, fulfilled_at',
        )
        .in('document_id', docIds)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }

    // Super admin: see all
    let query = this.databaseService.client
      .from('fulltext_requests')
      .select(
        'id, document_id, requester_name, requester_email, purpose, department, status, handled_by, created_at, fulfilled_at',
      )
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  /**
   * updateFulltextRequest marks a full-text request as fulfilled or denied.
   */
  async updateFulltextRequest(
    requestId: string,
    currentUser: any,
    status: 'fulfilled' | 'denied',
  ) {
    const { data: request, error: fetchError } = await this.databaseService.client
      .from('fulltext_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new NotFoundException('Full-text request not found.');
    }

    if (request.status !== 'pending') {
      throw new ForbiddenException('This request has already been processed.');
    }

    const { data: updated, error: updateError } = await this.databaseService.client
      .from('fulltext_requests')
      .update({
        status,
        handled_by: currentUser.id,
        fulfilled_at: status === 'fulfilled' ? new Date().toISOString() : null,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException('Failed to update request status.');
    }

    // Send email notification (fire-and-forget — never block the response)
    if (status === 'fulfilled') {
      (async () => {
        try {
          const { data: doc } = await this.databaseService.client
            .from('documents')
            .select('title, pdf_file_path')
            .eq('id', request.document_id)
            .single();

          if (doc?.pdf_file_path) {
            const EXPIRES_IN_SECONDS = 48 * 60 * 60;
            const { data: signedData } = await this.databaseService.client.storage
              .from('documents')
              .createSignedUrl(doc.pdf_file_path, EXPIRES_IN_SECONDS);

            if (signedData?.signedUrl) {
              await this.emailService.sendFulltextFulfilledEmail({
                to: request.requester_email,
                requesterName: request.requester_name,
                documentTitle: doc.title,
                pdfLink: signedData.signedUrl,
                expiresInHours: 48,
              });
            }
          }
        } catch { /* silent */ }
      })();
    } else if (status === 'denied') {
      (async () => {
        try {
          const { data: doc } = await this.databaseService.client
            .from('documents')
            .select('title')
            .eq('id', request.document_id)
            .single();

          if (doc) {
            await this.emailService.sendFulltextDeniedEmail({
              to: request.requester_email,
              requesterName: request.requester_name,
              documentTitle: doc.title,
            });
          }
        } catch { /* silent */ }
      })();
    }

    return {
      message: `Full-text request marked as ${status}.`,
      request: updated,
    };
  }
}
