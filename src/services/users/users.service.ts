import prisma from "prisma";
import type { UserWhereInput } from "prisma/generated/models";

export interface IListUserParams {
	limit: number;
	page: number;
	search?: string;
}

export const findUserById = async (id: string) => {
	return prisma.user.findUnique({
		where: { id },
	});
};

export const updateUserRole = async (id: string, role: string) => {
	return prisma.user.update({
		where: { id },
		data: { role },
	});
};

export const getListUser = async (params: IListUserParams) => {
	const { limit, page } = params;
	const where: UserWhereInput = {};
	if (params.search) {
		where.OR = [
			{
				username: {
					contains: params.search,
					mode: "insensitive",
				},
			},
			{
				email: {
					contains: params.search,
					mode: "insensitive",
				},
			},
			{
				fullName: {
					contains: params.search,
					mode: "insensitive",
				},
			},
		];
	}
	return prisma.user
		.paginate({
			where: where,
		})
		.withPages({
			limit,
			page,
			includePageCount: true,
		});
};
