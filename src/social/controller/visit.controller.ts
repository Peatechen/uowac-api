import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VisitService } from '../service/visit.service';
import { DtoCreateVisit } from '../interface/create-visit.dto';
import { Visit } from '../entity/visit.entity';
import { UserParam } from '../../auth/user.decorator';
import { AuthUser } from '../../auth/auth-user.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createVisit(
    @Body() dtoCreateVisit: DtoCreateVisit,
    @UserParam() user: AuthUser
  ): Promise<Visit> {
    return await this.visitService.createVisit(
      user.userId,
      dtoCreateVisit.sculptureId
    );
  }

  @Get('/:visitId')
  async getVisitById(@Param('visitId') visitId: string): Promise<Visit> {
    return await this.visitService.getVisitById(visitId);
  }

  @Get('/user-id/:userId')
  async getVisitsByUserId(@Param('userId') userId: string): Promise<Visit[]> {
    return await this.visitService.getVisitsByUserId(userId);
  }

  @Get('/sculpture-id/:sculptureId')
  async getVisitsBySculptureId(
    @Param('sculptureId') sculptureId: string
  ): Promise<Visit[]> {
    return await this.visitService.getVisitsBySculptureId(sculptureId);
  }

  @Delete('/:visitId')
  async deleteVisit(@Param('visitId') visitId: string): Promise<void> {
    await this.visitService.deleteVisit(visitId);
  }
}
