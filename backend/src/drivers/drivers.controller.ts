import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
    constructor(private driversService: DriversService) { }

    /**
     * Get current driver's profile
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req: any) {
        const driver = await this.driversService.findById(req.user.id);

        if (!driver) {
            throw new Error('Driver not found');
        }

        // Return profile data (excluding password)
        const { password, ...profile } = driver;
        return {
            id: profile.id,
            userId: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            dateOfBirth: undefined,
            cnhFrontUrl: undefined,
            cnhBackUrl: undefined,
            cnhNumber: undefined,
            cnhStatus: 'not_uploaded',
            cnhRejectionReason: undefined,
            vehicleModel: undefined,
            vehiclePlate: undefined,
            vehiclePhotoUrl: undefined,
            vehicleStatus: 'not_uploaded',
            vehicleRejectionReason: undefined,
            approvalStatus: profile.status,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
        };
    }

    /**
     * Get current driver's approval status
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('approval-status')
    async getApprovalStatus(@Request() req: any) {
        const driver = await this.driversService.findById(req.user.id);

        return {
            status: driver.status,
            cnhStatus: 'not_uploaded', // TODO: Implement document upload
            vehicleStatus: 'not_uploaded', // TODO: Implement document upload
        };
    }

    /**
     * Approve a driver (admin only)
     */
    @Patch(':id/approve')
    async approveDriver(@Param('id') id: string) {
        return this.driversService.updateStatus(id, 'approved');
    }

    /**
     * Reject a driver (admin only)
     */
    @Patch(':id/reject')
    async rejectDriver(@Param('id') id: string, @Body() body: { reason?: string }) {
        return this.driversService.updateStatus(id, 'rejected');
    }

    /**
     * Get all pending drivers (admin only)
     */
    @Get('pending')
    async getPendingDrivers() {
        return this.driversService.findByStatus('pending');
    }

    /**
     * Get all drivers (admin only)
     */
    @Get()
    async getAllDrivers() {
        return this.driversService.findAll();
    }

    /**
     * Update driver profile
     */
    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    async updateProfile(@Request() req: any, @Body() updateData: any) {
        const driver = await this.driversService.findById(req.user.id);

        if (!driver) {
            throw new Error('Driver not found');
        }

        // Update allowed fields
        if (updateData.name) driver.name = updateData.name;
        if (updateData.phone) driver.phone = updateData.phone;

        await this.driversService.updateDriver(req.user.id, driver);

        return this.getProfile(req);
    }

    /**
     * Upload document (placeholder - file upload not implemented)
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('documents')
    async uploadDocument(@Request() req: any, @Body() body: any) {
        // TODO: Implement file upload with multer
        // For now, just return a mock response
        return {
            url: 'https://example.com/documents/placeholder.jpg',
            message: 'Upload de documentos será implementado em breve',
        };
    }

    /**
     * Delete document (placeholder)
     */
    @UseGuards(AuthGuard('jwt'))
    @Delete('documents/:documentType')
    async deleteDocument(@Request() req: any, @Param('documentType') documentType: string) {
        // TODO: Implement document deletion
        return { message: 'Documento removido' };
    }
}
