import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

const OAI_NAMESPACE = 'oai:spark.cics';
const REPO_NAME = 'SPARK Academic Repository';
const ADMIN_EMAIL = 'cics.sparkrepository@gmail.com';
const PUBLISHER = 'University of Santo Tomas - College of Information and Computing Sciences';

@Injectable()
export class OaiService {
  constructor(private databaseService: DatabaseService) {}

  private esc(str: unknown): string {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private wrap(content: string, verb: string, requestUrl: string, extra: Record<string, string> = {}): string {
    const attrs = [verb ? `verb="${verb}"` : '', ...Object.entries(extra).map(([k, v]) => `${k}="${this.esc(v)}"`)]
      .filter(Boolean)
      .join(' ');
    return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request ${attrs}>${this.esc(requestUrl)}</request>
  ${content}
</OAI-PMH>`;
  }

  private parseJsonArray(value: unknown): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return [value]; }
    }
    return [];
  }

  private docToOaiDc(doc: any): string {
    const authors = this.parseJsonArray(doc.authors);
    const keywords = this.parseJsonArray(doc.keywords);
    const creatorTags = authors.map((a: string) => `        <dc:creator>${this.esc(a)}</dc:creator>`).join('\n');
    const subjectTags = keywords.map((k: string) => `        <dc:subject>${this.esc(k)}</dc:subject>`).join('\n');

    return `    <metadata>
      <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                 xmlns:dc="http://purl.org/dc/elements/1.1/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
        <dc:title>${this.esc(doc.title)}</dc:title>
${creatorTags}
${subjectTags}
        ${doc.abstract ? `<dc:description>${this.esc(doc.abstract)}</dc:description>` : ''}
        ${doc.year ? `<dc:date>${doc.year}</dc:date>` : ''}
        <dc:type>${this.esc(doc.type)}</dc:type>
        <dc:format>application/pdf</dc:format>
        <dc:identifier>${OAI_NAMESPACE}:${doc.id}</dc:identifier>
        <dc:language>en</dc:language>
        <dc:publisher>${PUBLISHER}</dc:publisher>
        <dc:rights>All rights reserved, UST-CICS</dc:rights>
        ${doc.adviser ? `<dc:contributor>${this.esc(doc.adviser)}</dc:contributor>` : ''}
        ${doc.department ? `<dc:relation>${this.esc(doc.department)}</dc:relation>` : ''}
      </oai_dc:dc>
    </metadata>`;
  }

  private recordHeader(doc: any): string {
    const setSpec = doc.department ? `\n        <setSpec>${doc.department.toLowerCase()}</setSpec>` : '';
    return `      <header>
        <identifier>${OAI_NAMESPACE}:${doc.id}</identifier>
        <datestamp>${new Date(doc.updated_at ?? doc.created_at).toISOString()}${setSpec}
        </datestamp>
      </header>`;
  }

  // ─── Error helpers (sync — no DB needed) ────────────────────────────────────

  badVerb(requestUrl: string): string {
    return this.wrap('<error code="badVerb">Illegal OAI verb.</error>', '', requestUrl);
  }

  badArgument(requestUrl: string, detail: string): string {
    return this.wrap(`<error code="badArgument">${this.esc(detail)}</error>`, '', requestUrl);
  }

  cannotDisseminateFormat(requestUrl: string): string {
    return this.wrap(
      '<error code="cannotDisseminateFormat">The metadataPrefix is not supported. Use oai_dc.</error>',
      '',
      requestUrl,
    );
  }

  // ─── Verb handlers ──────────────────────────────────────────────────────────

  identify(requestUrl: string): string {
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:5000';
    return this.wrap(
      `<Identify>
    <repositoryName>${REPO_NAME}</repositoryName>
    <baseURL>${backendUrl}/api/oai</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>${ADMIN_EMAIL}</adminEmail>
    <earliestDatestamp>2024-01-01T00:00:00Z</earliestDatestamp>
    <deletedRecord>no</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
  </Identify>`,
      'Identify',
      requestUrl,
    );
  }

  listMetadataFormats(requestUrl: string): string {
    return this.wrap(
      `<ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>`,
      'ListMetadataFormats',
      requestUrl,
    );
  }

  listSets(requestUrl: string): string {
    return this.wrap(
      `<ListSets>
    <set><setSpec>cs</setSpec><setName>Computer Science</setName></set>
    <set><setSpec>it</setSpec><setName>Information Technology</setName></set>
    <set><setSpec>is</setSpec><setName>Information Systems</setName></set>
  </ListSets>`,
      'ListSets',
      requestUrl,
    );
  }

  async listIdentifiers(requestUrl: string, from?: string, until?: string, set?: string): Promise<string> {
    let query = this.databaseService.client
      .from('documents')
      .select('id, department, created_at, updated_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (set) query = query.eq('department', set.toUpperCase());
    if (from) query = query.gte('updated_at', from);
    if (until) query = query.lte('updated_at', until);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return this.wrap('<error code="noRecordsMatch">No records match the given criteria.</error>', 'ListIdentifiers', requestUrl);
    }

    const headers = data.map((doc: any) => {
      const setSpec = doc.department ? `\n      <setSpec>${doc.department.toLowerCase()}</setSpec>` : '';
      return `    <header>
      <identifier>${OAI_NAMESPACE}:${doc.id}</identifier>
      <datestamp>${new Date(doc.updated_at ?? doc.created_at).toISOString()}</datestamp>${setSpec}
    </header>`;
    }).join('\n');

    return this.wrap(`<ListIdentifiers>\n${headers}\n  </ListIdentifiers>`, 'ListIdentifiers', requestUrl, { metadataPrefix: 'oai_dc' });
  }

  async listRecords(requestUrl: string, from?: string, until?: string, set?: string): Promise<string> {
    let query = this.databaseService.client
      .from('documents')
      .select('id, title, authors, abstract, year, department, type, adviser, keywords, created_at, updated_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (set) query = query.eq('department', set.toUpperCase());
    if (from) query = query.gte('updated_at', from);
    if (until) query = query.lte('updated_at', until);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return this.wrap('<error code="noRecordsMatch">No records match the given criteria.</error>', 'ListRecords', requestUrl);
    }

    const records = data.map((doc: any) => {
      const setSpec = doc.department ? `\n        <setSpec>${doc.department.toLowerCase()}</setSpec>` : '';
      return `    <record>
      <header>
        <identifier>${OAI_NAMESPACE}:${doc.id}</identifier>
        <datestamp>${new Date(doc.updated_at ?? doc.created_at).toISOString()}</datestamp>${setSpec}
      </header>
${this.docToOaiDc(doc)}
    </record>`;
    }).join('\n');

    return this.wrap(`<ListRecords>\n${records}\n  </ListRecords>`, 'ListRecords', requestUrl, { metadataPrefix: 'oai_dc' });
  }

  async getRecord(requestUrl: string, identifier: string): Promise<string> {
    const parts = identifier.split(':');
    const id = parts[parts.length - 1];

    const { data: doc, error } = await this.databaseService.client
      .from('documents')
      .select('id, title, authors, abstract, year, department, type, adviser, keywords, created_at, updated_at')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error || !doc) {
      return this.wrap(
        '<error code="idDoesNotExist">The identifier does not exist or is not publicly available.</error>',
        'GetRecord',
        requestUrl,
        { identifier, metadataPrefix: 'oai_dc' },
      );
    }

    const setSpec = doc.department ? `\n        <setSpec>${doc.department.toLowerCase()}</setSpec>` : '';
    const record = `<GetRecord>
    <record>
      <header>
        <identifier>${OAI_NAMESPACE}:${doc.id}</identifier>
        <datestamp>${new Date(doc.updated_at ?? doc.created_at).toISOString()}</datestamp>${setSpec}
      </header>
${this.docToOaiDc(doc)}
    </record>
  </GetRecord>`;

    return this.wrap(record, 'GetRecord', requestUrl, { identifier, metadataPrefix: 'oai_dc' });
  }
}
