import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    // Endpoint temporário para seed
    @Post('seed')
    seed() {
        return this.categoriesService.seed();
    }
}
