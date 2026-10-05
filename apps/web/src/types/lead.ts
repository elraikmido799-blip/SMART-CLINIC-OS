// أي فورم في الموقع (Contact · العروض · البرامج الرقمية) بيعمل Lead في الـCRM
export type CreateLeadBody = {
  full_name: string;
  phone: string;
  message?: string;
  landing_page: string;
};
