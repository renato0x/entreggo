import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverCategoriesService } from './driver-categories.service';
import { DriverCategoriesController } from './driver-categories.controller';
import { DriverCategory } from './entities/driver-category.entity';
import { CategoriesModule } from '../categories/categories.module';
import { DriversModule } from '../../drivers/drivers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DriverCategory]),
        CategoriesModule,
        DriversModule,
    ],
    controllers: [DriverCategoriesController],
    providers: [DriverCategoriesService],
    exports: [DriverCategoriesService],
})
export class DriverCategoriesModule { }
