import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type UsageMetrics = {
  repositoryViews: number;
  uniqueVisitors: number;
  searches: number;
  downloads: number;
};

@Injectable()
export class AnalyticsService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Get usage metrics for the reports page.
   * Currently returns basic counts from database activity.
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    // Count total approved documents as proxy for repository content views
    const { count: approvedDocs } = await this.databaseService.client
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Count unique users (visitors)
    const { count: totalUsers } = await this.databaseService.client
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Count fulltext requests as proxy for searches/interest
    const { count: fulltextRequests } = await this.databaseService.client
      .from('fulltext_requests')
      .select('id', { count: 'exact', head: true });

    // Count fulfilled fulltext requests as proxy for downloads
    const { count: downloads } = await this.databaseService.client
      .from('fulltext_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'fulfilled');

    return {
      repositoryViews: approvedDocs ?? 0,
      uniqueVisitors: totalUsers ?? 0,
      searches: fulltextRequests ?? 0,
      downloads: downloads ?? 0,
    };
  }
}
