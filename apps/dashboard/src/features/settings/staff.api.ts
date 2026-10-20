import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  roleSchema,
  staffMemberSchema,
  type RoleEntry,
  type StaffBody,
  type StaffMember,
  type UpdateRoleBody,
  type UpdateStaffBody,
} from './staff-types';

/**
 * الموظفين والأدوار (9.3). 403 `FORBIDDEN` · 409 `DUPLICATE_EMAIL` · 422 `INVALID_STAFF` ·
 * 422 `LOCKOUT` (الأدمن مينفعش يشيل صلاحية إدارة الأدوار والإعدادات من دوره)
 */
export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffMembers: build.query<StaffMember[], void>({
      query: () => '/staff/staff',
      rawResponseSchema: z.object({ data: z.array(staffMemberSchema) }),
      transformResponse: (response: { data: StaffMember[] }) => response.data,
      providesTags: ['StaffMembers'],
    }),
    createStaffMember: build.mutation<StaffMember, StaffBody>({
      query: (body) => ({ url: '/staff/staff', method: 'POST', body }),
      responseSchema: staffMemberSchema,
      invalidatesTags: ['StaffMembers'],
    }),
    updateStaffMember: build.mutation<StaffMember, UpdateStaffBody>({
      query: ({ id, ...body }) => ({ url: `/staff/staff/${id}`, method: 'PUT', body }),
      responseSchema: staffMemberSchema,
      invalidatesTags: ['StaffMembers'],
    }),
    getRoles: build.query<RoleEntry[], void>({
      query: () => '/staff/roles',
      rawResponseSchema: z.object({ data: z.array(roleSchema) }),
      transformResponse: (response: { data: RoleEntry[] }) => response.data,
      providesTags: ['Roles'],
    }),
    updateRole: build.mutation<RoleEntry, UpdateRoleBody>({
      query: ({ role, ...body }) => ({ url: `/staff/roles/${role}`, method: 'PUT', body }),
      responseSchema: roleSchema,
      // صلاحيات الموظف الحالي ممكن تتغير
      invalidatesTags: ['Roles', 'Me'],
    }),
  }),
});

export const {
  useGetStaffMembersQuery,
  useCreateStaffMemberMutation,
  useUpdateStaffMemberMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} = staffApi;
