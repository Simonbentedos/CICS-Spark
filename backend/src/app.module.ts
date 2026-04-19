import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

// Auth & RBAC
import { AuthModule } from './modules/auth/auth.module';

// User management
import { AdminModule } from './modules/admin/admin.module';
import { SuperadminModule } from './modules/superadmin/superadmin.module';

// Document workflow (M-01 refactored + M-03)
import { StudentModule } from './modules/student/student.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { DocumentsModule } from './modules/documents/documents.module';

// Full-text requests (M-04)
import { FulltextModule } from './modules/fulltext/fulltext.module';

// Notifications (M-01 table)
import { NotificationsModule } from './modules/notifications/notifications.module';

// Email
import { EmailModule } from './modules/email/email.module';

// Analytics
import { AnalyticsModule } from './modules/analytics/analytics.module';

// OAI-PMH
import { OaiModule } from './modules/oai/oai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Global rate limiting: 100 req / 60 s per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    DatabaseModule,

    // Auth + RBAC (login, logout, /me, guards)
    AuthModule,

    // User provisioning
    AdminModule,
    SuperadminModule,

    // Document upload (student-scoped, M-01 refactored)
    StudentModule,

    // Legacy search (M-01 refactored)
    RepositoryModule,

    // Full document management API (M-03)
    DocumentsModule,

    // Guest full-text requests (M-04)
    FulltextModule,

    // In-app notifications (M-01 notifications table)
    NotificationsModule,

    // Email (nodemailer)
    EmailModule,

    // Analytics & Usage Metrics
    AnalyticsModule,

    // OAI-PMH metadata harvesting
    OaiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
