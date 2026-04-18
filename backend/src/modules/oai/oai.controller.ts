import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { OaiService } from './oai.service';

@Controller('oai')
export class OaiController {
  constructor(private readonly oaiService: OaiService) {}

  /**
   * GET /api/oai
   * Public OAI-PMH endpoint. Responds with XML.
   * Supported verbs: Identify, ListMetadataFormats, ListSets,
   *                  ListIdentifiers, ListRecords, GetRecord
   */
  @Get()
  async handle(
    @Query('verb') verb: string,
    @Query('metadataPrefix') metadataPrefix: string,
    @Query('identifier') identifier: string,
    @Query('from') from: string,
    @Query('until') until: string,
    @Query('set') set: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const requestUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');

    let xml: string;

    switch (verb) {
      case 'Identify':
        xml = this.oaiService.identify(requestUrl);
        break;

      case 'ListMetadataFormats':
        xml = this.oaiService.listMetadataFormats(requestUrl);
        break;

      case 'ListSets':
        xml = this.oaiService.listSets(requestUrl);
        break;

      case 'ListIdentifiers':
        if (!metadataPrefix) {
          xml = this.oaiService.badArgument(requestUrl, 'metadataPrefix is required for ListIdentifiers.');
        } else if (metadataPrefix !== 'oai_dc') {
          xml = this.oaiService.cannotDisseminateFormat(requestUrl);
        } else {
          xml = await this.oaiService.listIdentifiers(requestUrl, from, until, set);
        }
        break;

      case 'ListRecords':
        if (!metadataPrefix) {
          xml = this.oaiService.badArgument(requestUrl, 'metadataPrefix is required for ListRecords.');
        } else if (metadataPrefix !== 'oai_dc') {
          xml = this.oaiService.cannotDisseminateFormat(requestUrl);
        } else {
          xml = await this.oaiService.listRecords(requestUrl, from, until, set);
        }
        break;

      case 'GetRecord':
        if (!identifier) {
          xml = this.oaiService.badArgument(requestUrl, 'identifier is required for GetRecord.');
        } else if (!metadataPrefix) {
          xml = this.oaiService.badArgument(requestUrl, 'metadataPrefix is required for GetRecord.');
        } else if (metadataPrefix !== 'oai_dc') {
          xml = this.oaiService.cannotDisseminateFormat(requestUrl);
        } else {
          xml = await this.oaiService.getRecord(requestUrl, identifier);
        }
        break;

      default:
        xml = this.oaiService.badVerb(requestUrl);
    }

    res.send(xml);
  }
}
