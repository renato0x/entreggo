import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async findAll() {
        return await this.categoryRepository.find({
            where: { active: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Categoria não encontrada');
        }
        return category;
    }

    async seed() {
        const count = await this.categoryRepository.count();
        if (count > 0) return;

        const categories = [
            { name: 'Alimentos', slug: 'food', icon: 'fast-food' },
            { name: 'Farmácia', slug: 'pharmacy', icon: 'medkit' },
            { name: 'Documentos', slug: 'documents', icon: 'document-text' },
            { name: 'Eletrônicos', slug: 'electronics', icon: 'phone-portrait' },
            { name: 'Mercado', slug: 'grocery', icon: 'cart' },
        ];

        for (const cat of categories) {
            await this.categoryRepository.save(this.categoryRepository.create(cat));
        }
    }
}
