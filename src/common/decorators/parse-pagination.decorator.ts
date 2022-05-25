import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Pagination } from '../types';

export const ParsePagination = createParamDecorator(function (
    data: unknown,
    ctx: ExecutionContext,
): Pagination {
    const { env } = process;
    const { query } = ctx.switchToHttp().getRequest();
    const limitRestriction = +env.MAX_WALLETS_PER_PAGE;
    let { limit, page } = query;

    if (typeof limit != 'string') {
        limit = +env.WALLETS_PER_PAGE_DEFAULT;
    } else {
        limit = +limit;
    }
    if (typeof page != 'string') {
        page = 0;
    } else {
        page = +page;
    }
    if (limit > limitRestriction) {
        limit = limitRestriction;
    }
    return {
        limit,
        offset: limit * (page - 1),
    };
});
