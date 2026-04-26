import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { UploadDocumentDto } from '../student/dto/upload-material.dto';
import { ReviseDocumentDto } from './dto/revise-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';

@Injectable()
export class DocumentsService {
  constructor(private databaseService: DatabaseService) {}

  // ─── POST /api/documents/upload ───────────────────────────────────────────

  /**
   * uploadDocument stores the PDF in Supabase Storage, then inserts
   * a record into the `documents` table with status='pending'.
   */
  async uploadDocument(userId: string, file: Express.Multer.File, dto: UploadDocumentDto, abstractFile: Express.Multer.File) {
    // Block submission if title similarity ≥ 80% with any non-rejected document
    const dupeCheck = await this.checkDuplicate(dto.title);
    if (dupeCheck.isDuplicate) {
      const top = dupeCheck.matches[0];
      const pct = Math.round((top.similarity ?? 0) * 100);
      throw new ConflictException(
        `This title is too similar to an existing submission (${pct}% match: "${top.title}"). Duplicate submissions are not allowed.`,
      );
    }

    const ts = Date.now();
    const storagePath = `${userId}/${ts}_${file.originalname}`;
    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    const { error: storageError } = await this.databaseService.client.storage
      .from('documents')
      .upload(storagePath, file.buffer, { contentType: file.mimetype });

    if (storageError) {
      throw new InternalServerErrorException(
        storageError.message || 'Failed to upload file to storage.',
      );
    }

    const abstractStoragePath = `${userId}/${ts}_abstract_${abstractFile.originalname}`;
    const { error: abstractStorageError } = await this.databaseService.client.storage
      .from('documents')
      .upload(abstractStoragePath, abstractFile.buffer, { contentType: abstractFile.mimetype });
    if (abstractStorageError) {
      await this.databaseService.client.storage.from('documents').remove([storagePath]);
      throw new InternalServerErrorException(
        abstractStorageError.message || 'Failed to upload abstract file to storage.',
      );
    }
    const abstractFilePath = abstractStoragePath;

    const { data: document, error: dbError } = await this.databaseService.client
      .from('documents')
      .insert({
        title: dto.title,
        authors: dto.authors,
        abstract: dto.abstract ?? null,
        year: dto.year ?? null,
        department: dto.department,
        type: dto.type,
        track_specialization: dto.track_specialization ?? null,
        adviser: dto.adviser ?? null,
        degree: dto.degree ?? null,
        keywords: dto.keywords ?? null,
        pdf_file_path: storagePath,
        abstract_file_path: abstractFilePath,
        uploaded_by: userId,
        status: 'pending',
        checksum,
      })
      .select()
      .single();

    if (dbError) {
      await this.databaseService.client.storage.from('documents').remove([storagePath]);
      throw new InternalServerErrorException(dbError.message || 'Failed to save document record.');
    }

    // Notify all admins and super_admins in the same department about the new submission
    const { data: admins } = await this.databaseService.client
      .from('users')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .or(`department.eq.${dto.department},role.eq.super_admin`)
      .eq('is_active', true);

    if (admins && admins.length > 0) {
      const notifRows = admins.map((admin: any) => ({
        user_id: admin.id,
        type: 'new_submission',
        message: `New submission pending review: "${dto.title}"`,
        is_read: false,
        reference_id: document.id,
      }));
      await this.databaseService.client.from('notifications').insert(notifRows);
    }

    return document;
  }

  // ─── PUT /api/documents/:id ───────────────────────────────────────────────

  /**
   * reviseDocument allows a student to re-upload a PDF and/or update metadata
   * when their document has status='revision'. Resets the status to 'pending'.
   */
  async reviseDocument(
    documentId: string,
    userId: string,
    file: Express.Multer.File | undefined,
    dto: ReviseDocumentDto,
  ) {
    // Only the owner may revise their document
    const { data: existing, error: fetchError } = await this.databaseService.client
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('uploaded_by', userId)
      .single();

    if (fetchError || !existing) {
      throw new NotFoundException('Document not found or access denied.');
    }

    if (existing.status !== 'revision' && existing.status !== 'rejected') {
      throw new ForbiddenException(
        `Only documents with status 'revision' or 'rejected' can be re-submitted. Current status: '${existing.status}'.`,
      );
    }

    let pdf_file_path = existing.pdf_file_path;

    let newChecksum: string | undefined;

    if (file) {
      // Remove the old PDF and upload the new one
      await this.databaseService.client.storage
        .from('documents')
        .remove([existing.pdf_file_path]);

      const storagePath = `${userId}/${Date.now()}_${file.originalname}`;
      const { error: storageError } = await this.databaseService.client.storage
        .from('documents')
        .upload(storagePath, file.buffer, { contentType: file.mimetype });

      if (storageError) {
        throw new InternalServerErrorException('Failed to upload revised file.');
      }

      pdf_file_path = storagePath;
      newChecksum = createHash('sha256').update(file.buffer).digest('hex');
    }

    // Build the update payload — only include fields explicitly provided
    const updatePayload: Record<string, any> = {
      status: 'pending',
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.authors !== undefined) updatePayload.authors = dto.authors;
    if (dto.abstract !== undefined) updatePayload.abstract = dto.abstract;
    if (dto.year !== undefined) updatePayload.year = dto.year;
    if (dto.track_specialization !== undefined)
      updatePayload.track_specialization = dto.track_specialization;
    if (dto.adviser !== undefined) updatePayload.adviser = dto.adviser;
    if (dto.keywords !== undefined) updatePayload.keywords = dto.keywords;
    if (pdf_file_path !== existing.pdf_file_path) updatePayload.pdf_file_path = pdf_file_path;
    if (newChecksum) updatePayload.checksum = newChecksum;

    const { data: updated, error: updateError } = await this.databaseService.client
      .from('documents')
      .update(updatePayload)
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException('Failed to update document record.');
    }

    return updated;
  }

  // ─── GET /api/documents ───────────────────────────────────────────────────

  /**
   * listDocuments returns paginated approved documents with optional filters.
   */
  async listDocuments(dto: ListDocumentsDto) {
    let query = this.databaseService.client
      .from('documents')
      .select(
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, degree, keywords, uploaded_by, created_at',
        { count: 'exact' },
      )
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (dto.department) query = query.eq('department', dto.department);
    if (dto.type) query = query.eq('type', dto.type);
    if (dto.year) query = query.eq('year', dto.year);
    if (dto.track) query = query.ilike('track_specialization', `%${dto.track}%`);
    if (dto.keyword) query = query.contains('keywords', JSON.stringify([dto.keyword]));

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw new BadRequestException(error.message);

    return { data, page, limit, total: count ?? 0 };
  }

  // ─── GET /api/documents/search ────────────────────────────────────────────

  /**
   * searchDocuments performs a full-text search across title, abstract,
   * authors (cast to text), and keywords (cast to text) for approved documents.
   */
  async searchDocuments(q: string) {
    if (!q?.trim()) {
      throw new BadRequestException('Search query (q) cannot be empty.');
    }

    const term = q.trim();

    const { data, error } = await this.databaseService.client
      .from('documents')
      .select(
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, degree, keywords, uploaded_by, created_at',
      )
      .eq('status', 'approved');

    if (error) throw new BadRequestException(error.message);

    const lower = term.toLowerCase();

    return (data ?? []).filter((doc: any) => {
      const title = (doc.title ?? '').toLowerCase();
      const abstract = (doc.abstract ?? '').toLowerCase();
      // authors and keywords are JSONB arrays — stringify for reliable substring search
      const authors = JSON.stringify(doc.authors ?? []).toLowerCase();
      const keywords = JSON.stringify(doc.keywords ?? []).toLowerCase();
      return (
        title.includes(lower) ||
        abstract.includes(lower) ||
        authors.includes(lower) ||
        keywords.includes(lower)
      );
    });
  }

  // ─── GET /api/documents/:id ──────────────────────────────────────────────

  /**
   * getDocumentById returns a single approved document by UUID.
   * Public endpoint — only approved documents are accessible.
   */
  async getDocumentById(documentId: string) {
    const { data: document, error } = await this.databaseService.client
      .from('documents')
      .select(
        'id, title, authors, abstract, year, department, type, track_specialization, adviser, degree, keywords, uploaded_by, created_at, updated_at',
      )
      .eq('id', documentId)
      .eq('status', 'approved')
      .single();

    if (error || !document) {
      throw new NotFoundException('Document not found or not publicly available.');
    }

    return document;
  }

  // ─── GET /api/documents/check-duplicate ───────────────────────────────────

  async checkDuplicate(title: string) {
    if (!title?.trim()) {
      throw new BadRequestException('Title cannot be empty.');
    }

    const { data, error } = await this.databaseService.client
      .from('documents')
      .select('id, title')
      .neq('status', 'rejected');

    if (error) throw new BadRequestException(error.message);

    const normalizedInput = title.trim().toLowerCase();
    const strippedInput = this.stripStopWords(normalizedInput) || normalizedInput;

    const matches = (data ?? [])
      .map((doc) => {
        const normalizedDoc = doc.title.toLowerCase();
        const strippedDoc = this.stripStopWords(normalizedDoc) || normalizedDoc;
        return {
          id: doc.id,
          title: doc.title,
          similarity: this.diceCoefficient(strippedInput, strippedDoc),
        };
      })
      .filter((r) => r.similarity >= 0.70)
      .sort((a, b) => b.similarity - a.similarity);

    return {
      isDuplicate: matches.some((m) => m.similarity >= 0.95),
      matches,
    };
  }

  // ─── GET /api/documents/:id/download-abstract ─────────────────────────────

  /**
   * getAbstractContent returns the title and abstract for a public download.
   * Callers (controller) are responsible for formatting and setting headers.
   */
  async getAbstractContent(documentId: string) {
    const { data: document, error } = await this.databaseService.client
      .from('documents')
      .select('id, title, authors, abstract, year, department, type, adviser, degree')
      .eq('id', documentId)
      .eq('status', 'approved')
      .single();

    if (error || !document) {
      throw new NotFoundException('Document not found or not publicly available.');
    }

    return document;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private readonly STOP_WORDS = new Set([
    'a', 'an', 'the', 'of', 'in', 'on', 'for', 'to', 'with', 'and', 'or',
    'development', 'design', 'implementation', 'study', 'analysis',
    'system', 'application', 'using', 'based', 'approach',
  ]);

  private stripStopWords(title: string): string {
    return title
      .split(/\s+/)
      .filter((word) => !this.STOP_WORDS.has(word))
      .join(' ')
      .trim();
  }

  /**
   * Dice coefficient — measures bigram overlap between two strings.
   * Returns a value between 0 (no overlap) and 1 (identical).
   */
  private diceCoefficient(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    const getBigrams = (str: string): Set<string> => {
      const bigrams = new Set<string>();
      for (let i = 0; i < str.length - 1; i++) {
        bigrams.add(str[i] + str[i + 1]);
      }
      return bigrams;
    };

    const aBigrams = getBigrams(a);
    const bBigrams = getBigrams(b);

    let intersection = 0;
    for (const bigram of aBigrams) {
      if (bBigrams.has(bigram)) intersection++;
    }

    return (2 * intersection) / (aBigrams.size + bBigrams.size);
  }
}
