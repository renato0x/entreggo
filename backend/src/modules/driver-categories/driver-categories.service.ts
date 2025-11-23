import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverCategory } from './entities/driver-category.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class DriverCategoriesService {
    constructor(
        @InjectRepository(DriverCategory)
        private readonly driverCategoryRepository: Repository<DriverCategory>,
        private readonly categoriesService: CategoriesService,
    ) { }

    async findMyCategories(driverId: string) {
        return await this.driverCategoryRepository.find({
            where: { driverId },
            relations: ['category'],
        });
    }

    async applyForCategory(driverId: string, categoryId: string) {
        // Check if category exists
        await this.categoriesService.findOne(categoryId);

        // Check if already applied
        const existing = await this.driverCategoryRepository.findOne({
            where: { driverId, categoryId },
        });

        if (existing) {
            if (existing.status === 'pending') {
                throw new ConflictException('Você já tem uma solicitação pendente para esta categoria');
            }
            if (existing.status === 'approved') {
                throw new ConflictException('Você já está aprovado nesta categoria');
            }
            // If rejected, allow re-apply (could add logic to wait some time)
        }

        const application = this.driverCategoryRepository.create({
            driverId,
            categoryId,
            status: 'pending',
        });

        return await this.driverCategoryRepository.save(application);
    }
}
