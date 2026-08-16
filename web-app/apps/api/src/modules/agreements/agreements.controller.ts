import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AgreementsService } from './agreements.service';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateAgreementDto, CreateTemplateDto, DeclineDto, QueryAgreementsDto, SignDto, UpdateTemplateDto,
} from './dto/agreement.dto';

@ApiTags('Agreements')
@ApiBearerAuth()
@Controller('agreements')
export class AgreementsController {
  constructor(private readonly service: AgreementsService) {}

  // Static segments before ':id', so "templates" is not read as an agreement id.
  @Get('templates')
  @RequirePermissions('settings:read')
  listTemplates(@CurrentUser('organizationId') orgId: string) {
    return this.service.listTemplates(orgId);
  }

  @Post('templates')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Create an agreement template (administrator only)' })
  createTemplate(@CurrentUser() user: AuthUser, @Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(user.organizationId, user.id, dto);
  }

  @Patch('templates/:id')
  @RequirePermissions('settings:update')
  updateTemplate(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.updateTemplate(orgId, id, dto);
  }

  @Delete('templates/:id')
  @RequirePermissions('settings:update')
  removeTemplate(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.removeTemplate(orgId, id);
  }

  // Self-service, so no permission gate: an ordinary employee must be able to
  // see and sign their own contract without being able to read anyone else's.
  @Get('mine')
  @ApiOperation({ summary: 'Agreements I am a signer on' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.mine(user);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign an agreement as the signed-in employee' })
  signAsMe(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SignDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    return this.service.signAsMe(user, id, dto, ip, req.headers['user-agent']);
  }

  @Get()
  @RequirePermissions('employees:read')
  list(@CurrentUser() user: AuthUser, @Query() query: QueryAgreementsDto) {
    return this.service.list(user, query);
  }

  @Get(':id')
  @RequirePermissions('employees:read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Get(':id/document')
  @RequirePermissions('employees:read')
  @ApiOperation({ summary: 'Download the agreement with signatures stamped in' })
  async document(@CurrentUser() user: AuthUser, @Param('id') id: string, @Res() res: Response) {
    const { filename, body } = await this.service.document(user, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(body);
  }

  @Post()
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Raise an agreement and attach its signers' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAgreementDto) {
    return this.service.create(user, dto);
  }

  @Post(':id/send')
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Issue signing links and message each signer on WhatsApp' })
  send(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.send(user, id);
  }
}

/**
 * The signer's side. Deliberately unauthenticated — a counterparty signing a
 * contract has no login here — so the token IS the credential: 32 random bytes,
 * stored only as a hash, expiring, and rotated whenever the agreement is re-sent.
 */
@ApiTags('Agreements (public signing)')
@Controller('sign')
export class PublicSigningController {
  constructor(private readonly service: AgreementsService) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'Open an agreement for signing' })
  view(@Param('token') token: string) {
    return this.service.viewForSigning(token);
  }

  @Public()
  @Post(':token')
  @ApiOperation({ summary: 'Submit a captured signature' })
  sign(@Param('token') token: string, @Body() dto: SignDto, @Ip() ip: string, @Req() req: Request) {
    return this.service.sign(token, dto, ip, req.headers['user-agent']);
  }

  @Public()
  @Post(':token/decline')
  decline(@Param('token') token: string, @Body() dto: DeclineDto) {
    return this.service.decline(token, dto.reason);
  }
}
