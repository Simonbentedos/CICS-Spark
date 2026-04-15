import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@Injectable()
export class AdminService {
  constructor(private databaseService: DatabaseService) {}

  // ─── M-01: User Provisioning ───────────────────────────────────────────────

  /**
   * createStudent provisions a new student account.
   *
   * Flow:
   *  1. Sends a Supabase invite email so the student can set their own password.
   *  2. Inserts a row into `users` with role='student' and is_active=false.
   *  3. A Supabase database trigger flips is_active=true once they confirm email.
   */
  async createStudent(dto: CreateStudentDto) {
    const { email, first_name, last_name, department } = dto;

    // Guard against duplicate users
    const { data: existing } = await this.databaseService.client
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('A student with this email already exists.');
    }

    // Create the auth user and send invite email
    const { data: authData, error: authError } =
      await this.databaseService.client.auth.admin.inviteUserByEmail(email, {
        data: {
          first_name,
          last_name,
          role: 'student',
          department,
        },
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
      });

    if (authError || !authData.user) {
      throw new InternalServerErrorException(
        authError?.message || 'Failed to create student auth account.',
      );
    }

    const { data: user, error: userError } = await this.databaseService.client
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role: 'student',
        department,
        is_active: false, // Will be set to true when they confirm email
      })
      .select('id, email, first_name, last_name, role, department, is_active, created_at')
      .single();

    if (userError) {
      // Roll back the auth user so we don't leave an orphaned auth record
      await this.databaseService.client.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException(userError.message || 'Failed to create student record.');
    }

    return {
      message: 'Student account created successfully. An invite email has been sent.',
      student: user,
    };
  }

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
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, keywords, pdf_file_path, uploaded_by, status, created_at, updated_at',
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
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, keywords, pdf_file_path, uploaded_by, status, created_at, updated_at',
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

    // Send email notification to student
    try {
      // Fetch student email
      const { data: student } = await this.databaseService.client
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', document.uploaded_by)
        .single();

      if (student) {
        const decisionText = {
          approve: 'approved',
          reject: 'rejected',
          revise: 'requires revision',
        }[dto.decision];

        const subject = `Submission ${decisionText.charAt(0).toUpperCase() + decisionText.slice(1)} - SPARK Repository`;
        
        let message = `Dear ${student.first_name} ${student.last_name},\n\n`;
        message += `Your submission "${document.title}" has been ${decisionText}.\n\n`;
        
        if (dto.feedback) {
          message += `Feedback from reviewer:\n${dto.feedback}\n\n`;
        }
        
        if (dto.decision === 'approve') {
          message += `Your document is now published in the SPARK Repository and available to the public.\n\n`;
        } else if (dto.decision === 'revise') {
          message += `Please review the feedback and resubmit your document with the requested changes.\n\n`;
        }
        
        message += `Thank you for your contribution to SPARK Repository.\n\nBest regards,\nSPARK Repository Team`;

        // Note: Supabase doesn't have a built-in way to send custom emails
        // This would require setting up a custom email service or using Supabase Edge Functions
        // For now, we'll log that an email should be sent
        console.log(`[EMAIL] To: ${student.email}, Subject: ${subject}, Message: ${message}`);
        
        // TODO: Implement actual email sending via Supabase Edge Function or external service
      }
    } catch (emailError) {
      // Don't fail the review if email fails
      console.error('Failed to send email notification:', emailError);
    }

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
   * Sends an email notification to the requester.
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
      throw new InternalServerErrorException('Failed to update full-text request.');
    }

    // Send email notification to requester
    try {
      const subject = status === 'fulfilled' 
        ? 'Full-Text Request Approved - SPARK Repository'
        : 'Full-Text Request Denied - SPARK Repository';
      
      const message = status === 'fulfilled'
        ? `Dear ${request.requester_name},\n\nYour request for full-text access has been approved. The document will be sent to you shortly.\n\nThank you for using SPARK Repository.\n\nBest regards,\nSPARK Repository Team`
        : `Dear ${request.requester_name},\n\nYour request for full-text access has been reviewed and unfortunately cannot be fulfilled at this time.\n\nIf you have questions, please contact the repository administrator.\n\nBest regards,\nSPARK Repository Team`;

      // Note: Supabase doesn't have a built-in way to send custom emails
      // This would require setting up a custom email service or using Supabase Edge Functions
      // For now, we'll log that an email should be sent
      console.log(`[EMAIL] To: ${request.requester_email}, Subject: ${subject}, Message: ${message}`);
      
      // TODO: Implement actual email sending via Supabase Edge Function or external service
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error('Failed to send email notification:', emailError);
    }

    return {
      message: `Full-text request marked as ${status}.`,
      request: updated,
    };
  }
}
