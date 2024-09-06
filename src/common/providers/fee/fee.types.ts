import { TransferType } from 'src/common/enums';

export type FeeBasicParams = {
    transfer: {
        amount: number;
        type: TransferType;
    };
};

export type FeeRefundParams = FeeBasicParams & {
    systemIncome: number;
};
