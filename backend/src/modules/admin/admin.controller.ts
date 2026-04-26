import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { UpdateFulltextRequestDto } from './dto/update-fulltext-request.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';

@Controller('admin')
@UseGuards(SupabaseGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── User Listing ─────────────────────────────────────────────────────────

  /**
   * GET /api/admin/users
   * Admin or super_admin only. Lists users scoped by department.
   * Requires: users.view permission
   */
  @Get('users')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('users.view')
  getUsers(@Request() req: any) {
    return this.adminService.getUsers(req.user);
  }

  // ─── M-04: Submission Review ───────────────────────────────────────────────

  /**
   * GET /api/admin/submissions?status=pending
   * Admin or super_admin only.
   * Admins see only their department's submissions; super_admin sees all.
   * Requires: submissions.view permission
   */
  @Get('submissions')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('submissions.view')
  getSubmissions(@Request() req: any, @Query('status') status?: string) {
    return this.adminService.getSubmissions(req.user, status);
  }

  /**
   * GET /api/admin/submissions/:id
   * Admin or super_admin only. Fetches a single submission with its review history.
   * Requires: submissions.view permission
   */
  @Get('submissions/:id')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('submissions.view')
  getSubmissionById(@Param('id') id: string, @Request() req: any) {
    return this.adminService.getSubmissionById(id, req.user);
  }

  /**
   * GET /api/admin/submissions/:id/preview-pdf
   * Admin or super_admin only. Returns the PDF file for preview.
   * Requires: submissions.view permission
   */
  @Get('submissions/:id/preview-pdf')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('submissions.view')
  async previewSubmissionPdf(@Param('id') id: string, @Request() req: any) {
    return this.adminService.getSubmissionPdfUrl(id, req.user);
  }

  /**
   * GET /api/admin/submissions/:id/preview-abstract-pdf
   * Admin or super_admin only. Returns signed URL for the optional abstract PDF.
   * Requires: submissions.view permission
   */
  @Get('submissions/:id/preview-abstract-pdf')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('submissions.view')
  async previewAbstractPdf(@Param('id') id: string, @Request() req: any) {
    return this.adminService.getSubmissionAbstractPdfUrl(id, req.user);
  }

  /**
   * POST /api/admin/submissions/:id/review
   * Admin or super_admin only. Approve, reject, or request revision on a submission.
   * Body: { decision: 'approve' | 'reject' | 'revise', feedback?: string }
   * Requires: submissions.review permission
   */
  @Post('submissions/:id/review')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('submissions.review')
  reviewSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Request() req: any,
  ) {
    return this.adminService.reviewSubmission(id, req.user, dto);
  }

  // ─── M-04: Full-Text Request Handling ─────────────────────────────────────

  /**
   * GET /api/admin/fulltext-requests?status=pending
   * Admin or super_admin only. Lists all full-text requests.
   * Requires: fulltext.manage permission
   */
  @Get('fulltext-requests')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('fulltext.manage')
  getFulltextRequests(@Request() req: any, @Query('status') status?: string) {
    return this.adminService.getFulltextRequests(req.user, status);
  }

  /**
   * PUT /api/admin/fulltext-requests/:id
   * Admin or super_admin only. Mark a request as fulfilled (email PDF) or denied.
   * Body: { status: 'fulfilled' | 'denied' }
   * Requires: fulltext.manage permission
   */
  @Put('fulltext-requests/:id')
  @Roles('admin', 'super_admin')
  @UseGuards(PermissionGuard)
  @RequirePermission('fulltext.manage')
  updateFulltextRequest(
    @Param('id') id: string,
    @Body() dto: UpdateFulltextRequestDto,
    @Request() req: any,
  ) {
    return this.adminService.updateFulltextRequest(id, req.user, dto.status);
  }
}
