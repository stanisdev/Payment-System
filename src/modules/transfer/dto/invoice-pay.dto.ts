import { IsNotEmpty, IsUUID } from 'class-validator';

export class InvoicePayDto {
    @IsUUID('4')
    @IsNotEmpty()
    transferId: string;
}
