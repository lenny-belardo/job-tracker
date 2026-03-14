import { Contact } from '@prisma/client';
import { AsyncResult, Result } from '@/utils/Result';
import { NotFoundError } from '@/utils/errors/AppError';
import prisma from '@/config/database';
import logger from '@/utils/logger';

export interface CreateContactData {
    applicationId: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    linkedinUrl?: string;
    notes?: string;
    isPrimary?: boolean;
}

export interface UpdateContactData extends Partial<Omit<CreateContactData, 'applicationId'>> {}

export class ContactService {
    /**
     * Create a new contact
     */
    async create(
        userId: string,
        data: CreateContactData
    ): AsyncResult<Contact, Error> {
        try {
            // verify application belongs to user
            const application = await prisma.application.findFirst({
                where: {
                    id: data.applicationId,
                    userId
                }
            });

            if (!application) {
                return Result.fail(new NotFoundError('Application'));
            }

            // if this contact is primary, unset other primary contacts for this application
            if (data.isPrimary) {
                await prisma.contact.updateMany({
                    where: {
                        applicationId: data.applicationId,
                        isPrimary: true
                    },
                    data: {
                        isPrimary: false
                    }
                });
            }

            const contact = await prisma.contact.create({
                data
            });

            logger.info('Contact created', { contactId: contact.id, userId });

            return Result.ok(contact);
        } catch (error) {
            logger.error('Error creating contact', { error, userId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get all contacts for an application
     */
    async findByApplication(
        userId: string,
        applicationId: string
    ): AsyncResult<Contact[], Error> {
        try {
            // verify application belongs to user
            const application = await prisma.application.findFirst({
                where: {
                    id: applicationId,
                    userId
                }
            });

            if (!application) {
                return Result.fail(new NotFoundError('Application'));
            }

            const contacts = await prisma.contact.findMany({
                where: { applicationId },
                orderBy: [
                    { isPrimary: 'desc' },
                    { createdAt: 'asc' }
                ]
            });

            return Result.ok(contacts);
        } catch (error) {
            logger.error('Error fetching contacts', { error, userId, applicationId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Get a single contact by ID
     */
    async findById(
        userId: string,
        contactId: string
    ): AsyncResult<Contact, Error> {
        try {
            const contact = await prisma.contact.findFirst({
                where: {
                    id: contactId,
                    application: {
                        userId
                    }
                }
            });

            if (!contact) {
                return Result.fail(new NotFoundError('Contact'));
            }

            return Result.ok(contact);
        } catch (error) {
            logger.error('Error fetching contact', { error, userId, contactId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Update a contact
     */
    async update(
        userId: string,
        contactId: string,
        data: UpdateContactData
    ): AsyncResult<Contact, Error> {
        try {
            // verify contact belongs to user's application
            const existingContact = await prisma.contact.findFirst({
                where: {
                    id: contactId,
                    application: {
                        userId
                    }
                }
            });

            if (!existingContact) {
                return Result.fail(new NotFoundError('Contact'));
            }

            // if setting this contact as primary, unset other primary contacts
            if (data.isPrimary) {
                await prisma.contact.updateMany({
                    where: {
                        applicationId: existingContact.applicationId,
                        isPrimary: true,
                        id: { not: contactId }
                    },
                    data: {
                        isPrimary: false
                    }
                });
            }

            const contact = await prisma.contact.update({
                where: { id: contactId },
                data: data as any
            });

            logger.info('Contact updated', { contactId, userId });

            return Result.ok(contact);
        } catch (error) {
            logger.error('Error updating contact', { error, userId, contactId });

            return Result.fail(error as Error);
        }
    }

    /**
     * Delete a contact
     */
    async delete(
        userId: string,
        contactId: string
    ): AsyncResult<void, Error> {
        try {
            const contact = await prisma.contact.findFirst({
                where: {
                    id: contactId,
                    application: {
                        userId
                    }
                }
            });

            if (!contact) {
                return Result.fail(new NotFoundError('Contact'));
            }

            await prisma.contact.delete({
                where: { id: contactId }
            });

            logger.info('Contact deleted', { contactId, userId });

            return Result.ok(undefined);
        } catch (error) {
            logger.error('Error deleting contact', { error, userId, contactId });

            return Result.fail(error as Error);
        }
    }
}
