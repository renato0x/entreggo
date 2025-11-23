import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DriversService {
    constructor(
        @InjectRepository(Driver)
        private driversRepository: Repository<Driver>,
    ) { }

    async create(driverData: Partial<Driver>): Promise<Driver> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(driverData.password!, salt);

        const newDriver = this.driversRepository.create({
            ...driverData,
            password: hashedPassword,
        });

        return this.driversRepository.save(newDriver);
    }

    async findOne(email: string): Promise<Driver | null> {
        return this.driversRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'phone', 'status', 'isActive']
        });
    }

    async findById(id: string): Promise<Driver | null> {
        return this.driversRepository.findOne({ where: { id } });
    }

    async updateStatus(id: string, status: string): Promise<Driver> {
        await this.driversRepository.update(id, { status });
        const driver = await this.findById(id);
        if (!driver) {
            throw new Error('Driver not found');
        }
        return driver;
    }

    async findByStatus(status: string): Promise<Driver[]> {
        return this.driversRepository.find({ where: { status } });
    }

    async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
        await this.driversRepository.update(id, data);
        const driver = await this.findById(id);
        if (!driver) {
            throw new Error('Driver not found');
        }
        return driver;
    }

    async findAll(): Promise<Driver[]> {
        return this.driversRepository.find();
    }
}
