import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { DriverCategoriesService } from './driver-categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Request } from 'express';

@Controller('driver-categories')
@UseGuards(JwtAuthGuard)
export class DriverCategoriesController {
    constructor(private readonly driverCategoriesService: DriverCategoriesService) { }

    @Get('me')
    findMyCategories(@Req() req: Request) {
        const driverId = (req.user as any).id;
        return this.driverCategoriesService.findMyCategories(driverId);
    }

    @Post('apply/:categoryId')
    applyForCategory(
        @Param('categoryId') categoryId: string,
        @Req() req: Request
    ) {
        const driverId = (req.user as any).id;
        return this.driverCategoriesService.applyForCategory(driverId, categoryId);
    }
}
