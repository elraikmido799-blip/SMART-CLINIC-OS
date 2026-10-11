import { LegalPage, legalMetadata } from '../_components/legal-page';

export const generateMetadata = () => legalMetadata('refund-policy');

export default function Page() {
  return <LegalPage slug="refund-policy" />;
}
