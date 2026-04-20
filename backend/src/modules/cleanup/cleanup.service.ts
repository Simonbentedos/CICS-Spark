import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Cron('0 2 * * *')
  async purgeStaleRejected() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: stale, error: fetchError } = await this.databaseService.client
      .from('documents')
      .select('id, pdf_file_path')
      .eq('status', 'rejected')
      .lt('updated_at', cutoff);

    if (fetchError) {
      this.logger.error('Failed to query stale rejected submissions', fetchError.message);
      return;
    }

    if (!stale || stale.length === 0) return;

    this.logger.log(`Auto-deleting ${stale.length} stale rejected submission(s)`);

    for (const doc of stale) {
      const { error: storageError } = await this.databaseService.client.storage
        .from('documents')
        .remove([doc.pdf_file_path]);

      if (storageError) {
        this.logger.warn(`Storage delete failed for doc ${doc.id}: ${storageError.message}`);
      }

      const { error: dbError } = await this.databaseService.client
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) {
        this.logger.error(`DB delete failed for doc ${doc.id}: ${dbError.message}`);
      }
    }
  }
}
